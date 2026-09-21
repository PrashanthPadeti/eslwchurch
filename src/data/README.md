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

## Weekly programme shape

```json
{
  "weekOf": "2026-09-27",
  "theme": "Living Water",
  "sermonTitle": "Rivers That Never Run Dry",
  "preacher": "Pastor Daniel",
  "scriptureReading": "John 7:37-39",
  "worshipLeader": "Worship Team",
  "communion": true,
  "items": [
    { "time": "10:00", "activity": "Welcome and opening prayer", "person": null },
    { "time": "10:10", "activity": "Praise and worship", "person": "Worship Team" },
    { "time": "10:40", "activity": "Announcements", "person": null },
    { "time": "10:50", "activity": "The Word", "person": "Pastor Daniel" },
    { "time": "11:40", "activity": "Holy Communion", "person": null },
    { "time": "11:55", "activity": "Closing prayer and blessing", "person": null }
  ],
  "notes": "Bring a friend — fellowship lunch follows the service."
}
```

`weekOf` is the **date of the Sunday** the programme covers, in `YYYY-MM-DD`.
A programme dated in the future is published safely: the site shows the most
recent one dated on or before the coming Sunday, so next week's can be prepared
in advance without replacing this week's.

`time` is wall-clock Sydney time and may be `null` for items with no fixed slot.

## Bible study shape

```json
{
  "slug": "romans-week-4",
  "date": "2026-09-30T09:00:00.000Z",
  "endDate": "2026-09-30T10:30:00.000Z",
  "title": "Justified by Faith",
  "passage": "Romans 5:1-11",
  "leader": "Pastor Daniel",
  "series": "Journey Through Romans",
  "description": "What it means to have peace with God.",
  "venue": "244 Woodstock Avenue, Whalan",
  "onlineLink": null,
  "notesUrl": null
}
```

`date` and `endDate` are **UTC instants**, not local wall-clock strings. Sydney
is UTC+11 in daylight saving and UTC+10 outside it, so a 7:00 pm study on
30 September 2026 is `2026-09-30T09:00:00.000Z`. The CMS handles this
conversion; if hand-editing, check against `src/lib/datetime.ts`.
