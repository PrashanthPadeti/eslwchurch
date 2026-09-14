/**
 * Timezone-safe date and time helpers for Australia/Sydney.
 *
 * WHY THIS FILE EXISTS
 * Sydney switches between AEDT (UTC+11) and AEST (UTC+10) twice a year. The
 * common failure in church websites is storing a service as an absolute instant
 * — every displayed time then silently shifts by an hour at the DST boundary and
 * nobody notices until people arrive late.
 *
 * The rule here: recurring services are stored as weekday + wall-clock time and
 * resolved against the IANA zone at render time, so 10:00 am stays 10:00 am all
 * year. Absolute instants (a specific dated event) are stored as UTC ISO strings
 * and formatted through Intl with an explicit timeZone. Never a hardcoded
 * +10:00 or +11:00 offset anywhere in the codebase.
 */

import { site } from '../data/site';

const TZ = site.timezone;
const LOCALE = site.locale;

/** Milliseconds the zone is ahead of UTC at a given instant. DST-aware. */
function zoneOffset(ts: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(ts))) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUTC - ts;
}

/**
 * Convert a Sydney wall-clock date/time to the correct UTC instant.
 * Probes the offset twice so it lands correctly either side of a DST change.
 */
export function sydneyWallClockToDate(
  year: number,
  month: number, // 1-12
  day: number,
  hour = 0,
  minute = 0,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  const firstGuess = zoneOffset(naive, TZ);
  let ts = naive - firstGuess;
  const corrected = zoneOffset(ts, TZ);
  if (corrected !== firstGuess) ts = naive - corrected;
  return new Date(ts);
}

/** Calendar date parts as they currently read in Sydney. */
export function sydneyParts(d: Date = new Date()) {
  const dtf = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(d)) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  const weekdayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
    parts.weekday,
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    weekday: weekdayIndex,
  };
}

/** "HH:MM" wall-clock string → "10:00 am" in Australian style. */
export function formatWallTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  // Any date works; we only format the time portion.
  const d = sydneyWallClockToDate(2025, 6, 15, h, m);
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(d)
    .replace(/\s*([ap])\.?m\.?/i, (_, p) => ` ${p.toLowerCase()}m`);
}

/** "10:00 am – 12:00 pm", using an en dash. */
export function formatWallTimeRange(start: string, end: string): string {
  return `${formatWallTime(start)} – ${formatWallTime(end)}`;
}

export function weekdayName(weekday: number, style: 'long' | 'short' = 'long'): string {
  // 2024-01-07 was a Sunday, so adding the index lands on the right day.
  const d = sydneyWallClockToDate(2024, 1, 7 + weekday, 12, 0);
  return new Intl.DateTimeFormat(LOCALE, { timeZone: TZ, weekday: style }).format(d);
}

/**
 * "Sun 14 Sep 2026".
 * en-AU natively yields "Sun, 14 Sept 2026" — the comma and the four-letter
 * "Sept" break column alignment in listings, so both are normalised away.
 */
export function formatDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(d)
    .replace(/,/g, '')
    .replace(/\bSept\b/, 'Sep');
}

/** "Sun 14 Sep 2026, 10:00 am" */
export function formatDateTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const date = formatDate(d);
  const time = new Intl.DateTimeFormat(LOCALE, {
    timeZone: TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(d)
    .replace(/\s*([ap])\.?m\.?/i, (_, p) => ` ${p.toLowerCase()}m`);
  return `${date}, ${time}`;
}

/** ISO-8601 date-only string ("2026-09-14") in Sydney terms, for <time datetime>. */
export function isoDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  const p = sydneyParts(d);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/**
 * The next occurrence of a recurring weekly service, as a real instant.
 * Returns today's occurrence if it has not yet finished.
 */
export function nextOccurrence(
  weekday: number,
  start: string,
  end: string,
  now: Date = new Date(),
): Date {
  const today = sydneyParts(now);
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);

  let delta = (weekday - today.weekday + 7) % 7;
  if (delta === 0) {
    const endsAt = sydneyWallClockToDate(today.year, today.month, today.day, eh, em);
    if (endsAt.getTime() <= now.getTime()) delta = 7;
  }
  return sydneyWallClockToDate(today.year, today.month, today.day + delta, sh, sm);
}

/** Is this instant in the future? */
export function isUpcoming(input: string | Date, now: Date = new Date()): boolean {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.getTime() >= now.getTime();
}

/**
 * Relative label for a nearby date, or null when it would add nothing.
 * Returns "Today"/"Tomorrow" only — for anything further out the formatted date
 * already carries the weekday, so "Sun 20 Sep 2026 (Sunday)" is just noise.
 */
export function relativeDayLabel(
  input: string | Date,
  now: Date = new Date(),
): string | null {
  const d = typeof input === 'string' ? new Date(input) : input;
  const a = sydneyParts(d);
  const b = sydneyParts(now);
  const dayA = Date.UTC(a.year, a.month - 1, a.day);
  const dayB = Date.UTC(b.year, b.month - 1, b.day);
  const diff = Math.round((dayA - dayB) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return null;
}
