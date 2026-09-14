# EL Shaddai Living Waters Church — Project Plan

**Location:** Sydney, Australia
**Content editor:** Non-technical volunteer (phone-first editing)
**Languages:** English only (confirmed)
**Domain:** `eslwchurch.com` (to be registered)
**Address:** 244 Woodstock Avenue, Whalan NSW 2770
**Services:** Sundays, 10:00 am – 12:00 pm
**Status:** Built — 12 routes live locally, awaiting remaining content
**Last updated:** 14 September 2026

---

## 1. Confirmed stack

| Layer | Choice | Cost (AUD/yr) |
|---|---|---|
| Framework | Astro 5 (static site generation) | $0 |
| Styling | Tailwind CSS | $0 |
| CMS | Sanity | $0 (free tier) |
| Repo | GitHub (private) | $0 |
| Hosting / CDN | Cloudflare Pages (Sydney PoP) | $0 |
| Domain | `.org.au` via Australian registrar | ~$20–25 |
| Email | Cloudflare Email Routing, or Google Workspace for Nonprofits | $0 |
| Contact form | Cloudflare Worker + Resend | $0 |
| Analytics | Cloudflare Web Analytics | $0 |
| Video | YouTube embeds | $0 |
| **Total recurring** | | **~A$25/yr** |

---

## 2. Australia-specific decisions

### 2.1 Domain

`.org.au` requires an **Australian presence** — an ABN, ACN, or registered
Australian trademark. A church registered with the ACNC will have an ABN, which
satisfies this.

| Option | Approx. cost | Notes |
|---|---|---|
| `.org.au` | A$20–25/yr | **Recommended.** Signals local and legitimate. Needs ABN. Must use an AU-accredited registrar — Cloudflare Registrar does not sell `.au`. |
| `.au` (direct) | A$20–25/yr | Shorter. Also needs Australian presence. |
| `.org` | A$18–22/yr | No presence test. Good as a redirect to the primary. |
| `.church` | A$40–50/yr | Descriptive but unfamiliar to older visitors, who may mistype it. |

**Recommendation:** register `.org.au` as primary, optionally `.org` as a 301
redirect. Enable auto-renew and set a calendar reminder on a *church* calendar,
not a personal one.

### 2.2 Timezone — the critical technical detail

Sydney observes daylight saving (**AEDT UTC+11** roughly Oct–Apr, **AEST
UTC+10** Apr–Oct). The most common failure in church event sites in DST regions
is storing times naively and having every service time silently shift by an hour
twice a year.

**Mitigation, built in from day one:**

- Store all datetimes as UTC ISO-8601 in the CMS.
- Render exclusively through `Intl.DateTimeFormat` with the IANA zone
  `Australia/Sydney` — never a hardcoded `+10:00` or `+11:00` offset.
- Recurring weekly services stored as *wall-clock time plus weekday*
  (e.g. "Sunday 09:30 local"), resolved against the zone at render time, so a
  9:30 am service stays 9:30 am across the DST boundary.
- Build a DST-boundary test case into the schedule component.
- Run a daily scheduled rebuild so "This Week" stays correct even in a week
  nobody edits anything.

### 2.3 Dates, times and language conventions

- Locale `en-AU` throughout.
- Dates as `Sun 14 Sep 2026` — unambiguous, avoids the DD/MM vs MM/DD trap.
- Times as `9:30 am` (lowercase, with a space) per Australian style.
- Australian English spelling in all UI copy: *organise, centre, recognise*.
  Note that **program** (not *programme*) is standard Australian usage for events.

### 2.4 Privacy and legal

- **Australian Privacy Act 1988 / Australian Privacy Principles.** Organisations
  under A$3M annual turnover are generally exempt, which covers most churches —
  but a privacy policy remains best practice and is expected by visitors once you
  collect contact-form data. One will be included.
- **Spam Act 2003.** If a newsletter signup is ever added, consent must be
  explicit and every email needs a working unsubscribe. Recommend deferring
  newsletters to v2.
- **ACNC Registered Charity Tick.** If registered, display it in the footer — it
  is a strong, free trust signal for Australian visitors.
- **DGR status.** Most churches are *not* deductible gift recipients for general
  donations; often only a specific building fund is. The Give page must state the
  tax position plainly rather than implying deductibility.
- **Photo consent**, particularly for children, needs a written church policy
  before any gallery goes live. This is a pastoral and legal matter, not a
  technical one.

### 2.5 Giving

| Method | Fees | Recommendation |
|---|---|---|
| Bank transfer (BSB + account number) | $0 | **v1.** Universal, free, zero compliance burden. |
| PayID | $0 | **v1.** Instant, free, increasingly expected in Australia. |
| Tithe.ly | ~1.9% + $0.30 | v2, if card giving is wanted. Widely used by AU churches. |
| Stripe | ~1.75% + A$0.30 domestic | v2. More setup, lower fees at volume. |

**v1 is a static Give page** with BSB, account number, PayID and a QR code. No
gateway, no PCI surface, no monthly fee.

### 2.6 Email

Apply for **Google for Nonprofits** (administered in Australia via Connecting Up)
— ACNC-registered charities generally qualify for Google Workspace at no cost.
Until that is approved, Cloudflare Email Routing forwards
`info@eslwchurch.com` to an existing Gmail account for free.

---

## 3. Language

**English only**, confirmed. This removes the entire internationalisation layer
that was previously scoped: no locale routing, no localised CMS fields, no
per-script webfont subsets, no `hreflang` tags, and no RTL considerations.

Practical effect: roughly a session of build work saved, a simpler content model
for the volunteer editor, and a smaller page-weight budget freed up for imagery.

If a second language is ever wanted, the cleanest path is Astro's built-in i18n
routing with localised fields in the CMS. Retrofitting is more work than building
it in from the start, but it is not prohibitive at this site's size.

## 4. Site map

### Static pages (9)

Home · About Us · Mission & Vision · Statement of Faith · Leadership ·
Ministries · Visit Us / Contact · Give · Privacy Policy

### CMS-managed sections (6)

Weekly Schedule · Programs & Events · Announcements · Sermons · Gallery ·
Bulletins (PDF)

---

## 5. Content model

```
SiteSettings          (edited once)
  churchName, tagline, abn, acncNumber
  address, phone, email, socialLinks[]
  regularServices[] { weekday, startTime, endTime, name, venue }
  givingDetails { bsb, accountNumber, accountName, payId, qrImage, taxNote }

WeeklySchedule
  weekOf: date
  items[] { datetime, endDatetime, title, venue,
            speaker, description, isSpecial }
  notes

Event
  title, slug, coverImage
  startDateTime, endDateTime, recurrence?
  venue, description
  registrationLink?, contactPerson
  category, featured

Announcement
  title, body, publishDate, expiryDate, priority, attachment?

Sermon
  title, speaker, date, series?
  scriptureRefs[], youtubeUrl?, audioUrl?, notesPdf?

Ministry
  name, slug, leader, meetingTime, description, image

LeadershipMember
  name, role, bio, photo, order
```

`expiryDate` on announcements auto-hides stale notices — the main reason church
sites come to look abandoned.

---

## 6. Design direction

**Palette** — sampled from the church emblem, not chosen independently. Full
tokens, provenance and measured contrast ratios are in `BRAND.md`, which is the
authority; this is the summary.

```
blue-900   #041B54   headings, dark sections, footer
blue-700   #0A2E7A   primary brand colour, links
gold-500   #C8921F   accent, button fill, rules
gold-300   #D8A830   accents on dark only
ground     #FAF8F4   warm off-white page background
ink        #16202E   body text
```

**The constraint that shaped the design:** `gold-500` on the light ground
measures 2.61:1 and fails WCAG AA for text. Gold is therefore a dark-background
colour, or a button fill carrying navy text (5.88:1, passes). This is why
emphasis sections are navy with gold accents rather than the gold-on-cream that
would be the obvious choice.

**Type:** Lora for headings (serif, warmth); Inter for body (clarity at small
sizes).

**Principles:** mobile-first and thumb-reachable · 17–18px minimum body size ·
WCAG 2.1 AA contrast · service times above the fold with no scrolling ·
full dark mode · under 250KB per page.

---

## 7. Performance targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 98 |
| Lighthouse Accessibility | 100 |
| Lighthouse SEO | 100 |
| Largest Contentful Paint | < 1.2s on 4G |
| Page weight (homepage) | < 250KB including one webfont subset per script |
| JavaScript shipped | < 15KB |
| Build time | 20–45s |
| Traffic headroom | ~100,000 visits/month on free tiers |

---

## 8. Build phases

| Phase | Work | Est. |
|---|---|---|
| 0 | Content gathering — partially complete, see `CONTENT-MAP.md` §5 | Ongoing |
| 1 | ✅ Scaffold: Astro + Tailwind, design tokens, layout, nav, footer | Done |
| 2 | ✅ Static pages built with supplied content | Done |
| 3 | Sanity schemas, studio deploy, seed data | Pending church decision |
| 4 | ✅ Schedule and events rendering via `lib/content.ts` (seed data) | Done |
| 5 | ✅ Sitemap, OG image, `Church` JSON-LD · contact form pending email address | Mostly done |
| 6 | Deploy — see `DEPLOYMENT.md` | Ready to run |
| 7 | Handover: editor guide and walkthrough | After CMS |

---

## 9. Operational risks

| Risk | Mitigation |
|---|---|
| DST shifts all service times | IANA timezone rendering, DST boundary test, daily rebuild |
| Volunteer leaves | Two people with CMS access minimum, never one; written handover doc |
| Domain lapses | Auto-renew, church calendar reminder, church-owned payment method |
| Content goes stale | Announcement expiry dates; homepage degrades gracefully when empty |

| Vendor lock-in | Content exports as JSON; documented migration path to Markdown-in-repo |
| Backups | Git for code; scheduled Sanity dataset export to church Google Drive |
| Children's photos | Written consent policy required before the gallery goes live |
| Security | No database, no public login, no admin panel exposed — minimal attack surface |

---

## 10. Deferred to v2

Online card giving · newsletter signup · member login or directory ·
live streaming infrastructure (embed YouTube instead) · podcast feed ·
event registration with payment
