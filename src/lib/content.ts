/**
 * Content access layer.
 *
 * Every page reads church content through this file and never imports a data
 * source directly. That indirection is what lets the content live in two places
 * without any page knowing the difference:
 *
 *   Sanity CMS   — used whenever PUBLIC_SANITY_PROJECT_ID is set
 *   Local JSON   — the fallback, used when it is not
 *
 * The practical effect: the site keeps building and deploying before the CMS
 * exists, and switching it on is an environment variable rather than a code
 * change. If Sanity is ever unreachable mid-build the fallback also keeps the
 * site from failing to deploy.
 */

import eventsData from '../data/events.json';
import announcementsData from '../data/announcements.json';
import weeklyProgramData from '../data/weekly-program.json';
import messagesData from '../data/bible-studies.json';
import { isUpcoming } from './datetime';
import type { PortableTextBlock } from './portabletext';

// ---------------------------------------------------------------- types

export type Event = {
  slug: string;
  title: string;
  /** UTC ISO-8601 instant */
  startDateTime: string;
  endDateTime?: string | null;
  venue?: string | null;
  category: string;
  description: string;
  featured?: boolean;
  registrationLink?: string | null;
  contactPerson?: string | null;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  publishDate: string;
  /** Past this date the notice disappears on the next build. */
  expiryDate?: string | null;
  priority?: 'normal' | 'high';
};

/** One line in the Sunday running order. */
export type ProgramItem = {
  /** Wall-clock "HH:MM", optional — many items have no fixed time. */
  time?: string | null;
  activity: string;
  person?: string | null;
};

/** Something happening during the week, outside the Sunday service. */
export type WeekActivity = {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  /** Wall-clock "HH:MM" */
  time?: string | null;
  activity: string;
  venue?: string | null;
  notes?: string | null;
};

export type WeeklyProgram = {
  /** ISO date of the Sunday this programme covers. */
  weekOf: string;
  theme?: string | null;
  sermonTitle?: string | null;
  preacher?: string | null;
  scriptureReading?: string | null;
  worshipLeader?: string | null;
  communion?: boolean;
  items: ProgramItem[];
  activities?: WeekActivity[];
  notes?: string | null;
};

/**
 * The pastor's weekly Bible study message — written content published to the
 * site each week, not a meeting. Modelled as a post with its own URL so a
 * single week's message can be shared on its own.
 */
export type WeeklyMessage = {
  slug: string;
  title: string;
  /** ISO date the message is published. Future dates stay hidden. */
  publishDate: string;
  passage?: string | null;
  series?: string | null;
  author?: string | null;
  summary?: string | null;
  body?: PortableTextBlock[] | null;
  attachmentUrl?: string | null;
};

// ---------------------------------------------------------------- source

const SANITY_PROJECT_ID = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = import.meta.env.PUBLIC_SANITY_DATASET ?? 'production';
const SANITY_API_VERSION = '2024-10-01';

export const usingCms = Boolean(SANITY_PROJECT_ID);

/**
 * Run a GROQ query against Sanity's CDN. Returns null on any failure so the
 * caller falls back to local data rather than failing the whole build — a
 * church site going stale is recoverable, a build that will not deploy is not.
 */
async function groq<T>(query: string): Promise<T | null> {
  if (!SANITY_PROJECT_ID) return null;
  const url =
    `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}` +
    `/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[content] Sanity returned ${res.status}; using local data`);
      return null;
    }
    const json = (await res.json()) as { result: T };
    return json.result ?? null;
  } catch (err) {
    console.warn('[content] Sanity unreachable; using local data:', err);
    return null;
  }
}

// ---------------------------------------------------------------- events

export async function getEvents(): Promise<Event[]> {
  const fromCms = await groq<Event[]>(`
    *[_type == "event"] | order(startDateTime asc) {
      "slug": slug.current, title, startDateTime, endDateTime,
      venue, category, description, featured, registrationLink, contactPerson
    }`);
  const all = fromCms ?? (eventsData as Event[]);
  return all.slice().sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
}

export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  const upcoming = (await getEvents()).filter((e) =>
    isUpcoming(e.endDateTime ?? e.startDateTime),
  );
  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}

export async function getPastEvents(): Promise<Event[]> {
  return (await getEvents())
    .filter((e) => !isUpcoming(e.endDateTime ?? e.startDateTime))
    .reverse();
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  return (await getEvents()).find((e) => e.slug === slug);
}

// ---------------------------------------------------------- announcements

/**
 * Announcements past their expiry date are dropped at build time. This is the
 * main reason church sites stop looking abandoned — stale notices remove
 * themselves without anyone remembering to do it.
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  const fromCms = await groq<Announcement[]>(`
    *[_type == "announcement"] | order(publishDate desc) {
      "id": _id, title, body, publishDate, expiryDate, priority
    }`);
  const now = Date.now();
  return (fromCms ?? (announcementsData as Announcement[]))
    .filter((a) => !a.expiryDate || new Date(a.expiryDate).getTime() >= now)
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return b.publishDate.localeCompare(a.publishDate);
    });
}

// -------------------------------------------------------- weekly programme

/**
 * The most recent programme dated on or before the coming Sunday. Publishing
 * next week's in advance is therefore safe — it appears when its week arrives
 * rather than immediately replacing the current one.
 */
export async function getCurrentProgram(): Promise<WeeklyProgram | null> {
  const fromCms = await groq<WeeklyProgram[]>(`
    *[_type == "weeklyProgram"] | order(weekOf desc) [0...12] {
      weekOf, theme, sermonTitle, preacher, scriptureReading,
      worshipLeader, communion, notes,
      items[]{ time, activity, person },
      activities[]{ weekday, time, activity, venue, notes }
    }`);
  const all = (fromCms ?? (weeklyProgramData as WeeklyProgram[]))
    .slice()
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf));
  if (!all.length) return null;

  // "This week" runs until the end of the Sunday it covers.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + 6);
  const horizon = cutoff.toISOString().slice(0, 10);
  return all.find((p) => p.weekOf <= horizon) ?? all[all.length - 1];
}

export async function getProgramArchive(limit = 6): Promise<WeeklyProgram[]> {
  const current = await getCurrentProgram();
  const fromCms = await groq<WeeklyProgram[]>(`
    *[_type == "weeklyProgram"] | order(weekOf desc) [0...20] {
      weekOf, theme, sermonTitle, preacher, scriptureReading
    }`);
  return (fromCms ?? (weeklyProgramData as WeeklyProgram[]))
    .slice()
    .sort((a, b) => b.weekOf.localeCompare(a.weekOf))
    .filter((p) => p.weekOf !== current?.weekOf)
    .slice(0, limit);
}

// -------------------------------------------------- weekly bible study

/**
 * Messages dated in the future stay hidden, so the pastor can write ahead and
 * have each week publish itself.
 */
export async function getMessages(): Promise<WeeklyMessage[]> {
  const fromCms = await groq<WeeklyMessage[]>(`
    *[_type == "bibleStudy"] | order(publishDate desc) {
      "slug": slug.current, title, publishDate, passage, series,
      author, summary, body, "attachmentUrl": attachment.asset->url
    }`);
  const today = new Date().toISOString().slice(0, 10);
  return (fromCms ?? (messagesData as WeeklyMessage[]))
    .filter((m) => m.publishDate <= today)
    .sort((a, b) => b.publishDate.localeCompare(a.publishDate));
}

export async function getLatestMessage(): Promise<WeeklyMessage | null> {
  return (await getMessages())[0] ?? null;
}

export async function getMessageArchive(limit = 12): Promise<WeeklyMessage[]> {
  return (await getMessages()).slice(1, limit + 1);
}

export async function getMessageBySlug(
  slug: string,
): Promise<WeeklyMessage | undefined> {
  return (await getMessages()).find((m) => m.slug === slug);
}
