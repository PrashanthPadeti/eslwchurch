# Deployment Guide

Getting `eslwchurch.com` live. Recurring cost is the domain at about
**US$10.46/year**.

---

## Account ownership

One nominated **church administrator account** is the owner and billing contact
for every service below — the registrar, GitHub, Cloudflare and later the CMS —
so a single inbox receives every renewal notice, build failure and security
alert. The address itself is deliberately not recorded in this repository.

**Add a second administrator before launch.** Every service supports more than
one, and a single point of control is the most common way a church later loses
access to its own site. This is the one recommendation here worth acting on even
if nothing else is.

---

## Step 1 — Register the domain ✅ Done

`eslwchurch.com` is registered through **Cloudflare Registrar**, status Active.

Registering at Cloudflare rather than a third-party registrar removed two steps
from this guide: DNS is already delegated to Cloudflare (DNS Setup: Full), so
there are no nameservers to copy between companies and no propagation wait.

`.com` also carries no eligibility test, so the Australian-presence requirement
that applies to `.com.au` and `.org.au` does not arise. If the church later
obtains an ABN, an incorporated association number or an ACN,
`eslwchurch.com.au` can be added and redirected to this domain.

**Two things to confirm in the dashboard** (Domains → Registrations → Manage
domain registration):

- [ ] **Auto-renew is on.** Without it the site disappears when the term ends.
- [ ] **The expiry date.** The dashboard shows 14 September 2027, which is a
      one-year term — worth checking against what you intended to buy.

---

## Step 2 — Create the GitHub repository

Signed in as the church administrator account,
create a **private** repository named `eslwchurch` — empty, with no README,
`.gitignore` or licence, so the first push is clean.

Send the repository URL on and the code will be pushed for you.

---

## Step 3 — Connect Cloudflare Pages

In the Cloudflare dashboard (same account that holds the domain):

1. **Workers & Pages → Create → Pages → Connect to Git**
2. Authorise GitHub access and select the `eslwchurch` repository
3. Build settings:

   | Setting | Value |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Node version | 20 or later |

4. Deploy. A `*.pages.dev` URL works immediately — check the site there first.

---

## Step 4 — Attach the domain

**Workers & Pages → the project → Custom domains → Set up a custom domain.**
Add `eslwchurch.com` and `www.eslwchurch.com`.

Because the domain is already on Cloudflare, the DNS records are created
automatically and SSL is issued within minutes. Nothing to paste, nothing to
wait on overnight.

---

## Step 5 — Email

`info@eslwchurch.com` costs nothing and can be set up now that the domain is
active.

**Option A — Cloudflare Email Routing (free, immediate). Recommended.**
Cloudflare dashboard → **Email → Email Routing**. Forward
`info@eslwchurch.com` to the administrator mailbox. Receiving works straight
away. To *send* as that address, add it in Gmail under
*Settings → Accounts → Send mail as*.

Do this as soon as the domain resolves. The site currently publishes a personal
Gmail address directly, which works but has two drawbacks: a personal address on a
public page attracts spam scrapers, and it ties the church's point of contact to
one individual. Routing through `info@eslwchurch.com` fixes both —
the public address belongs to the church, and where it forwards can change later
without touching the website.

**Option B — Google Workspace for Nonprofits (free, better, slower).**
ACNC-registered charities generally qualify for Google Workspace at no cost,
administered in Australia through Connecting Up. This gives real mailboxes rather
than forwarding. Apply early — approval takes time — and use Option A in the
meantime.

Then change `contact.email` in `src/data/site.ts` to `info@eslwchurch.com`.
That single line updates the footer, the Visit page, the privacy policy and the
search-engine structured data together.

---

## Step 6 — Analytics

Cloudflare dashboard → **Web Analytics** → add `eslwchurch.com`.

Privacy-first, no cookies, and therefore **no cookie banner required** — which is
why the privacy policy can honestly say the site sets no cookies of its own. Do
not add Google Analytics without revisiting that policy.

---

## Step 7 — Daily scheduled rebuild

The site resolves "next service" and drops expired announcements **at build
time**. Without a periodic rebuild, those go stale in a week when nobody edits
anything.

1. In Cloudflare Pages → **Settings → Builds & deployments → Deploy hooks**,
   create a hook and copy the URL.
2. Trigger it once a day. Simplest option is a free GitHub Actions schedule —
   create `.github/workflows/daily-rebuild.yml`:

```yaml
name: Daily rebuild
on:
  schedule:
    - cron: '0 16 * * *'   # 16:00 UTC = 3am AEDT / 2am AEST, Sydney
  workflow_dispatch:
jobs:
  rebuild:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsSL -X POST "${{ secrets.CF_DEPLOY_HOOK }}"
```

Add the hook URL as a repository secret named `CF_DEPLOY_HOOK`.

---

## Step 8 — Pre-launch checks

- [ ] Every page loads over `https://`
- [ ] `www` redirects to the apex domain (or vice versa — pick one)
- [ ] Service times read correctly on a real phone
- [ ] The Google Maps embed shows the right building
- [ ] "Get directions" opens correctly on both iOS and Android
- [ ] Test the site on a slow connection, not just office wifi
- [ ] Run Lighthouse — targets are in `docs/PROJECT-PLAN.md` section 7
- [ ] Validate the structured data at <https://validator.schema.org>
- [ ] Submit the sitemap in Google Search Console
- [ ] Check the link preview by pasting the URL into WhatsApp — this is how most
      people will first share the site
- [ ] Confirm photo consent is in place for every identifiable person
- [ ] Check `eslwchurch.com/robots.txt` still lists the sitemap. Cloudflare has a
      **Manage your robots.txt** setting (currently *Content Signals Policy*) that
      appends its own directives — it should not remove the sitemap line, but
      confirm after the first deploy
- [ ] Leave **Block AI training bots** as *Do not block*. A church site benefits
      from being findable; there is nothing here worth withholding from crawlers

---

## Step 9 — After launch

**Connect the CMS.** Once the church is ready to edit content themselves, create
a Sanity project and replace the function bodies in `src/lib/content.ts` with
GROQ queries. Nothing else in the codebase changes. Then add a Sanity webhook
pointing at the same Cloudflare deploy hook, so publishing rebuilds the site.

**Give two people access** to the domain registrar, GitHub, Cloudflare and the
CMS. Never one. See *Account ownership* at the top of this document.

**Switch the public email** from the interim Gmail address to
`info@eslwchurch.com`.

**Back up.** Code lives in git. Once the CMS is connected, schedule a dataset
export to the church's Google Drive.

---

## Rollback

Cloudflare Pages keeps every previous deployment. **Deployments → … → Rollback**
restores an earlier version in seconds. There is no way to permanently break the
live site by pushing a bad commit.
