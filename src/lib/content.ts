/**
 * Content access layer.
 *
 * Today these read from local JSON seed files so the site builds and deploys
 * without any external service. When the church creates a Sanity project, only
 * the bodies of these functions change — every page importing them stays exactly
 * as it is. That is the whole point of routing content through this file rather
 * than importing JSON directly into pages.
 *
 * To migrate: replace each function body with a GROQ query, keep the return
 * types identical, and delete the JSON imports.
 */

import eventsData from '../data/events.json';
import announcementsData from '../data/announcements.json';
import { isUpcoming } from './datetime';

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

export async function getEvents(): Promise<Event[]> {
  return (eventsData as Event[])
    .slice()
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
}

export async function getUpcomingEvents(limit?: number): Promise<Event[]> {
  const all = await getEvents();
  const upcoming = all.filter((e) => isUpcoming(e.endDateTime ?? e.startDateTime));
  return typeof limit === 'number' ? upcoming.slice(0, limit) : upcoming;
}

export async function getPastEvents(): Promise<Event[]> {
  const all = await getEvents();
  return all
    .filter((e) => !isUpcoming(e.endDateTime ?? e.startDateTime))
    .reverse();
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  return (await getEvents()).find((e) => e.slug === slug);
}

/**
 * Announcements past their expiry date are dropped at build time. This is the
 * main reason church sites stop looking abandoned — stale notices remove
 * themselves without anyone remembering to do it.
 */
export async function getAnnouncements(): Promise<Announcement[]> {
  const now = Date.now();
  return (announcementsData as Announcement[])
    .filter((a) => !a.expiryDate || new Date(a.expiryDate).getTime() >= now)
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return b.publishDate.localeCompare(a.publishDate);
    });
}
