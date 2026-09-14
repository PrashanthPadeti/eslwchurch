/**
 * DST boundary tests for Australia/Sydney.
 * Sydney: AEDT (UTC+11) ~Oct-Apr, AEST (UTC+10) ~Apr-Oct.
 * 2026 transitions: DST ends Sun 5 Apr 2026, DST starts Sun 4 Oct 2026.
 */
import {
  formatWallTime,
  formatWallTimeRange,
  nextOccurrence,
  sydneyWallClockToDate,
  weekdayName,
  formatDate,
  relativeDayLabel,
} from '../src/lib/datetime.ts';

let pass = 0, fail = 0;
function eq(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}\n      got:      ${actual}${ok ? '' : `\n      expected: ${expected}`}`);
}

console.log('--- wall-clock formatting ---');
eq('10:00 formats', formatWallTime('10:00'), '10:00 am');
eq('12:00 formats as noon', formatWallTime('12:00'), '12:00 pm');
eq('19:30 formats', formatWallTime('19:30'), '7:30 pm');
eq('00:00 formats', formatWallTime('00:00'), '12:00 am');
eq('service range', formatWallTimeRange('10:00', '12:00'), '10:00 am – 12:00 pm');

console.log('\n--- zone offsets either side of DST ---');
// Jan = AEDT (+11), Jul = AEST (+10)
const jan = sydneyWallClockToDate(2026, 1, 18, 10, 0);
const jul = sydneyWallClockToDate(2026, 7, 19, 10, 0);
eq('Jan 10am Sydney -> UTC 23:00 prev day', jan.toISOString(), '2026-01-17T23:00:00.000Z');
eq('Jul 10am Sydney -> UTC 00:00 same day', jul.toISOString(), '2026-07-19T00:00:00.000Z');

console.log('\n--- the actual bug this guards against ---');
// A 10am Sunday service must read 10:00 am on BOTH sides of every transition.
const sundays = [
  '2026-03-29', // AEDT, week before DST ends
  '2026-04-05', // DST ends this very morning (3am -> 2am)
  '2026-04-12', // AEST, week after
  '2026-09-27', // AEST, week before DST starts
  '2026-10-04', // DST starts this very morning (2am -> 3am)
  '2026-10-11', // AEDT, week after
];
for (const iso of sundays) {
  const [y, m, d] = iso.split('-').map(Number);
  const inst = sydneyWallClockToDate(y, m, d, 10, 0);
  const shown = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(inst).replace(/\s*([ap])\.?m\.?/i, (_, p) => ` ${p.toLowerCase()}m`);
  eq(`${iso} service reads`, shown, '10:00 am');
}

console.log('\n--- nextOccurrence lands on Sunday 10am ---');
const probes = [
  '2026-04-04T12:00:00Z', // Sat before DST ends
  '2026-04-05T02:00:00Z', // during the transition window
  '2026-10-03T12:00:00Z', // Sat before DST starts
  '2026-10-04T01:00:00Z', // during the transition window
  '2026-06-10T09:00:00Z', // random midweek
];
for (const iso of probes) {
  const n = nextOccurrence(0, '10:00', '12:00', new Date(iso));
  const f = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney', weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(n).replace(/\s*([ap])\.?m\.?/i, (_, p) => ` ${p.toLowerCase()}m`);
  const ok = f.startsWith('Sun') && f.includes('10:00 am');
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  from ${iso} -> ${f}`);
}

console.log('\n--- same-day rollover ---');
// Sunday 2026-06-14, 11:00 Sydney = 01:00 UTC. Service runs to 12:00, so still today.
eq('during service -> today',
   nextOccurrence(0, '10:00', '12:00', new Date('2026-06-14T01:00:00Z')).toISOString(),
   '2026-06-14T00:00:00.000Z');
// 13:00 Sydney = 03:00 UTC, service finished -> next week
eq('after service -> next week',
   nextOccurrence(0, '10:00', '12:00', new Date('2026-06-14T03:00:00Z')).toISOString(),
   '2026-06-21T00:00:00.000Z');

console.log('\n--- misc ---');
eq('weekday 0 is Sunday', weekdayName(0), 'Sunday');
eq('weekday 3 is Wednesday', weekdayName(3), 'Wednesday');
eq('date format', formatDate('2026-09-14T02:00:00Z'), 'Mon 14 Sep 2026');
eq('relative today', relativeDayLabel('2026-06-14T01:00:00Z', new Date('2026-06-14T00:00:00Z')), 'Today');
eq('relative far -> null', relativeDayLabel('2026-06-28T01:00:00Z', new Date('2026-06-14T00:00:00Z')), null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
