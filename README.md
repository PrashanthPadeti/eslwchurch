# El Shaddai Living Waters Church — Website

Static website for El Shaddai Living Waters Church, Whalan, Western Sydney.

**Live domain (to be registered):** `eslwchurch.com`

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run check` | TypeScript and Astro diagnostics |
| `npx tsx test/datetime.test.ts` | Timezone and DST test suite |

---

## Stack

- **[Astro 5](https://astro.build)** — static site generation, ships almost no JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com)** — CSS-first configuration via `@theme`
- **Cloudflare Pages** — hosting (planned)
- **Sanity** — headless CMS (planned; see `src/lib/content.ts`)

No database, no server, no admin panel on the public site.

---

## Project layout

```
assets/logo/        Processed logo masters (transparent PNG, several sizes)
content-source/     Original PDFs supplied by the church, plus extracted text
docs/               Plan, brand system, content map, deployment guide
public/             Static files served as-is (logo, favicon, OG image, robots)
src/
  components/       Reusable UI pieces
  data/
    site.ts         Single source of truth for church details
    events.json     Seed data until the CMS is connected
    announcements.json
  layouts/
    BaseLayout.astro  Head, SEO, JSON-LD, header and footer wrapper
  lib/
    datetime.ts     Timezone-safe formatting — read the header comment
    content.ts      Content access layer — the CMS swap point
  pages/            One file per route
  styles/global.css Design tokens and base styles
test/               Timezone and DST tests
```

---

## Two files worth understanding before changing anything

### `src/data/site.ts`

Church name, address, service times, contact details, giving details. Changing a
service time here updates the homepage, the Visit page, the What's On table, the
footer and the search-engine structured data at once.

Fields set to `null` are awaiting information from the church. Pages check for
these and simply omit the relevant section rather than rendering an empty stub —
so the site is never broken by missing content, and filling a field in makes the
section appear.

### `src/lib/datetime.ts`

Sydney moves between AEDT (UTC+11) and AEST (UTC+10) twice a year. The usual bug
in church websites is storing service times as absolute instants, so every
displayed time silently shifts by an hour at the daylight-saving boundary.

This file prevents that. Recurring services are stored as weekday plus
wall-clock time and resolved against the `Australia/Sydney` IANA zone at render
time. **Never hardcode a `+10:00` or `+11:00` offset anywhere.**

The behaviour is covered by tests across both 2026 DST transitions:

```bash
npx tsx test/datetime.test.ts
```

---

## Adding content

**Service times** — edit `services` in `src/data/site.ts`.

**Events and announcements** — until the CMS is connected, edit
`src/data/events.json` and `src/data/announcements.json`. See
`src/data/README.md` for the shapes and an important note about UTC.

Pages import through `src/lib/content.ts`, never from the JSON directly. When the
CMS is connected, only that one file changes.

---

## Current status

Built and verified:

- 12 routes, all pages building clean
- 0 TypeScript errors, 0 warnings
- 25/25 timezone tests passing
- Homepage first load ~44 KB gzipped, against a 250 KB budget
- WCAG AA contrast verified across the palette (see `docs/BRAND.md`)

Awaiting church content — see `docs/CONTENT-MAP.md` section 5. The main gaps are
the pastor's photo and bio, contact email, giving details, ABN, a formal
statement of faith, and photographs.

---

## Documentation

| File | Contents |
|---|---|
| `docs/PROJECT-PLAN.md` | Architecture, stack rationale, costs, risks |
| `docs/BRAND.md` | Palette sampled from the logo, contrast rules, logo usage |
| `docs/CONTENT-MAP.md` | What the church supplied and where it is used |
| `docs/CONTENT-CHECKLIST.md` | What is still needed, with specifications |
| `docs/DEPLOYMENT.md` | Domain, hosting and go-live steps |
