# Admin Guide — Updating the Website

For whoever keeps the website up to date. No technical knowledge needed, and
nothing here can break the site.

---

## Part 1 — One-time setup

This part is done once, by whoever is setting the site up. Skip to Part 2 if
the admin area already exists.

### Step 1 — Create the Sanity account

1. Go to [sanity.io](https://www.sanity.io) and click **Get started**
2. Sign in **with Google**, using the church account
3. Create a new project:
   - Project name: `El Shaddai Living Waters Church`
   - Dataset: `production`
   - Plan: **Free**
4. Copy the **Project ID** — a short string of letters and numbers shown in the
   project settings. It is needed twice below.

The free plan is far beyond what a church this size will use. There is no card
to enter.

### Step 2 — Publish the admin area

On the computer holding the website code:

```bash
cd studio
npm install
SANITY_STUDIO_PROJECT_ID=your-project-id npx sanity deploy
```

When asked for a studio hostname, enter **eslwchurch**.

The admin area is then live at **https://eslwchurch.sanity.studio** — forever,
at no cost, with nothing to maintain.

### Step 3 — Connect the website to it

In the Cloudflare dashboard: **Workers & Pages → eslwchurch → Settings →
Environment variables → Add**, for both Production and Preview:

| Name | Value |
|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | your project ID |
| `PUBLIC_SANITY_DATASET` | `production` |

Then redeploy. Until this is set the site quietly uses the built-in content
instead, so nothing breaks while the setup is half-finished.

### Step 4 — Make publishing update the website

The website is rebuilt when content is published. Two connections:

1. **Cloudflare:** Workers & Pages → eslwchurch → Settings → Builds &
   deployments → **Deploy hooks** → create one named `sanity-publish` and copy
   the URL.
2. **Sanity:** [sanity.io/manage](https://www.sanity.io/manage) → your project →
   **API → Webhooks → Create webhook**
   - Name: `Rebuild website`
   - URL: the deploy hook URL from Cloudflare
   - Dataset: `production`
   - Trigger on: Create, Update, Delete
   - HTTP method: `POST`

From then on, pressing **Publish** puts the change on the website within about
a minute.

### Step 5 — Invite the other admins

[sanity.io/manage](https://www.sanity.io/manage) → your project → **Members →
Invite member**. Enter their email; they sign in with Google.

**Invite at least two people.** A single administrator is how churches lose
control of their own website.

| Role | Can do |
|---|---|
| **Administrator** | Everything, including inviting others |
| **Editor** | Create, edit and publish content — the right role for most people |
| **Viewer** | Look but not change |

Give volunteers **Editor**. Keep Administrator for one or two leaders.

---

## Part 2 — Everyday use

### Signing in

Go to **https://eslwchurch.sanity.studio** and sign in with Google. Works on a
phone.

Only invited people can get in. There is no login page anywhere on the public
website, and nothing an outsider can reach.

### Updating the Weekly Program

The Sunday order of service.

1. Click **Weekly Program** in the sidebar
2. Click **+** to create a new one, or click an existing week to edit it
3. Set **Which Sunday is this for** — the date of the Sunday
4. Fill in the theme, message title, who is speaking, the reading, worship leader
5. Tick **Holy Communion** if it applies
6. Under **Order of service**, click **Add item** for each part of the morning.
   Drag the handles to reorder.
7. Under **Also on this week**, add anything else happening during the week —
   prayer meetings, youth night, fellowship. Pick the day, add a time if there
   is one, and say where. Leave it empty if there is nothing on.
8. Click **Publish**

**You can prepare next week in advance.** A programme dated for a future Sunday
stays hidden until its week arrives, so it will not replace the current one.

### Publishing the Weekly Bible Study

This is the study message you write and post each week. It is read on the
website — it is not a meeting.

1. Click **Weekly Bible Study** in the sidebar
2. Click **+** for a new one
3. Enter the title, then click **Generate** next to Web address
4. Set **Publish on**. Today's date is filled in for you. **Date it in the
   future and it stays hidden until that day**, so you can write several weeks
   ahead and let each publish itself.
5. Add the Bible passage — it appears as a badge under the title
6. Write a short summary. This shows in larger type above the message, and is
   what people see when the link is shared in WhatsApp.
7. Write the study in **The message**:
   - **Normal** for ordinary paragraphs
   - **Heading** for section titles
   - **Quote** for scripture you want set apart
   - **Bold** and *Italic* from the toolbar, plus bullet and numbered lists
8. Optionally attach study notes as a PDF
9. Click **Publish**

**Each study gets its own web address** — `eslwchurch.com/bible-study/...` —
so a single week's message can be shared on its own rather than only appearing
at the top of the page. Older studies move into "Previous studies" by
themselves.

### Adding an event or program

**Programs & Events** in the sidebar. These appear on the What's On page and,
if you tick **Highlight on the homepage**, on the front page too. Events move
out of "Coming up" by themselves once the date passes.

### Adding an announcement

**Announcements** in the sidebar.

**Always set "Hide after".** The notice removes itself from the website on that
date. This one field is the reason the site will not end up showing a Christmas
notice in March.

---

## Things worth knowing

**Nothing is live until you press Publish.** Drafts are private and saved
automatically as you type, so you can start something and come back to it.

**Changes appear in about a minute.** The website is rebuilt each time you
publish. If you do not see a change, wait a minute and refresh.

**You cannot break the site.** Every previous version is kept. If something
goes wrong, any earlier version can be restored in seconds.

**Old content looks after itself.** Past events, expired notices and finished
Bible studies move out of the way without anyone deleting them.

**The website stays correct on its own.** It rebuilds itself once a night, so
"next service" and the weekly dates stay right even in a week nobody touches it.

---

## What still needs a developer

These live in the code rather than the admin area, because they change once a
year at most:

- Service times and the church address
- Contact email and giving details
- The wording on About, Mission & Vision, Belonging and What We Believe
- The pastor's photo and biography
- Page layout, colours and design

Ask, and any of these can be moved into the admin area too. They were left in
the code deliberately — every field added to the admin area is another thing a
volunteer has to understand, and these almost never change.

---

## If something goes wrong

**Cannot sign in** — check you are using the Google account that was invited.
An administrator can re-invite you at sanity.io/manage → Members.

**Published, but the website has not changed** — wait two minutes and refresh.
If still nothing, the deploy hook from Part 1 Step 4 may be missing.

**Published something by mistake** — edit it and publish again, or ask a
developer to restore the previous version.

**Website looks broken** — Cloudflare keeps every past version. Workers & Pages
→ eslwchurch → Deployments → find the last good one → **Rollback**. Takes
seconds.
