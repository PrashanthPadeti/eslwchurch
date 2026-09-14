# Seed data

`events.json` and `announcements.json` hold the dynamic content until the Sanity
CMS is connected. They are intentionally empty: the site renders correctly with
no events and no announcements, showing the regular service times instead.

Read through `src/lib/content.ts` — never import these files directly into a
page. When the CMS is connected, only that file changes.

## Event shape

```json
{
  "slug": "annual-convention-2026",
  "title": "Annual Convention",
  "startDateTime": "2026-11-14T23:00:00.000Z",
  "endDateTime": "2026-11-15T02:00:00.000Z",
  "venue": "244 Woodstock Avenue, Whalan",
  "category": "Convention",
  "description": "Three days of worship and the Word.",
  "featured": true,
  "registrationLink": null,
  "contactPerson": null
}
```

`startDateTime` and `endDateTime` are **UTC instants**, not local wall-clock
strings. Sydney is UTC+11 in daylight saving and UTC+10 outside it, so a 10:00 am
service on 15 November 2026 is `2026-11-14T23:00:00.000Z`. The CMS will handle
this conversion; if hand-editing, double-check against `src/lib/datetime.ts`.

## Announcement shape

```json
{
  "id": "baptism-service-nov",
  "title": "Baptism service",
  "body": "Speak with Pastor Daniel if you would like to be baptised.",
  "publishDate": "2026-10-01",
  "expiryDate": "2026-11-30",
  "priority": "normal"
}
```

`expiryDate` matters: past it, the notice disappears on the next build without
anyone having to remember to delete it.
