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

## Living Word message shape

The Living Word is **written content the pastor publishes each week**, not a
meeting. Each one gets its own page at `/living-word/<slug>` so a single week
can be shared on its own.

```json
{
  "slug": "rivers-of-living-water",
  "title": "Rivers of Living Water",
  "publishDate": "2026-09-20",
  "passage": "John 7:37-39",
  "series": "The Work of the Spirit",
  "author": "Pastor Daniel",
  "summary": "What Jesus promised to those who come to Him thirsty.",
  "body": [
    { "_type": "block", "style": "normal",
      "children": [{ "_type": "span", "text": "Paragraph text." }] },
    { "_type": "block", "style": "h2",
      "children": [{ "_type": "span", "text": "A section heading" }] },
    { "_type": "block", "style": "blockquote",
      "children": [{ "_type": "span", "text": "A verse set apart." }] }
  ],
  "attachmentUrl": null
}
```

`publishDate` is a plain date. A message dated in the future stays hidden until
that day, so the pastor can write ahead.

`body` is Sanity's Portable Text: an array of blocks rather than HTML, which
means nothing pasted into the editor can break the page layout. Supported
styles are `normal`, `h2`, `h3` and `blockquote`, with `strong` / `em` marks,
bullet and numbered lists, and links. Rendering lives in
`src/lib/portabletext.ts`.
