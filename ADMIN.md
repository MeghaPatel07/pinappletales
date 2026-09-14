# Pineappletales — Admin & Content Setup

The site now has a password-protected admin at `/admin` that manages four
content masters, and three public sections that render what it publishes.

```
Admin                        Public
/admin/blogs             →   /blog, /blog/<slug>
/admin/events            →   /events, /events/<slug>
/admin/podcasts          →   /podcast
/admin/event-forms       →   the registration form on each event page
/admin/registrations     →   (read-only: what visitors submitted)
```

---

## 1. What you must fill in before it works

Open `.env` in the project root. Four values are blank and only you can supply
them. Everything else is already filled in.

| Variable | Where to get it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase console → Project settings → General → Your apps → Web app → SDK setup and configuration |
| `VITE_FIREBASE_APP_ID` | same screen |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary console → Settings → the "cloud name" of your product environment |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | you create this — see step 3 |

If there is no web app on the Firebase project yet, create one:
**Project settings → Your apps → Add app → Web**. No hosting setup is required
at that point.

> Restart `npm run dev` after editing `.env`. Vite only reads it at startup.

**The admin tells you if something is missing.** The dashboard shows a "Finish
the setup" panel listing exactly which variables are still blank, and the login
screen says so too. Nothing fails silently.

---

## 2. Firebase setup

Three things to switch on in the Firebase console for project `pineappletales`:

1. **Authentication → Sign-in method → Email/Password → Enable.**
   Without this the seed script cannot create the admin account.

2. **Firestore Database → Create database.** Start in production mode; the rules
   in this repo replace the defaults.

3. **Deploy the rules and indexes:**

   ```bash
   npm i -g firebase-tools     # once
   firebase login              # once
   firebase use pineappletales
   npm run deploy:rules
   ```

   This pushes `firestore.rules` and `firestore.indexes.json`. The indexes take
   a minute or two to build; until they finish, list queries may return nothing
   and Firestore logs a link in the browser console.

### Create the admin login

```bash
npm run seed:admin
```

Creates `admin@gmail.com` / `1234567` as you asked. To use different details:

```bash
npm run seed:admin -- someone@example.com theirpassword "Their Name"
```

Admin access needs **two** things, and the script does both:

1. a Firebase Auth user — proves who you are
2. a document at `admins/{uid}` — grants permission

The rules deliberately block clients from writing to `admins`, so if the rules
are already deployed the script cannot create that second document itself. When
that happens it prints the exact document to add — collection `admins`, document
ID = the UID it just printed — for you to paste into the Firestore console. It
takes about twenty seconds.

> **Change the password before this is publicly reachable.** `1234567` is fine while
> you are building; it is not fine on a live site. Change it in Firebase console
> → Authentication → Users → ⋮ → Reset password.

---

## 3. Cloudinary setup

Images are uploaded straight from the browser. There are two ways to authorise
that, and the code supports both behind one switch — you do **not** change any
component code to move between them.

### Option A — unsigned preset (the default, no server)

Cloudinary console → **Settings → Upload → Upload presets → Add upload preset**:

- Signing mode: **Unsigned**
- Folder: `pineappletales`
- Allowed formats: `jpg, png, webp, avif`
- Max file size: `5000000` (5 MB)

Put the preset's name in `VITE_CLOUDINARY_UPLOAD_PRESET`. Done.

The preset name is public — it is in the JavaScript bundle — which is why it
should be restricted to a folder, a format list and a size cap. Your API secret
is never involved.

### Option B — signed uploads (locked down)

You asked whether a static signature could be stored in an env var. It cannot,
and it is worth being clear why:

- A Cloudinary signature is `SHA1(that upload's parameters + timestamp + secret)`.
  It is bound to one upload and expires — there is no reusable value.
- Any variable named `VITE_*` is compiled into the JavaScript that every visitor
  downloads. A secret there is published, not protected.

So the signed path needs something server-side. `api/cloudinary-sign.js` is that
endpoint, written to run free on Vercel, Netlify or Cloudflare Pages — no
Firebase Blaze plan needed. It refuses to sign for anyone who is not a
signed-in admin on the allow-list.

To switch over, set these in your hosting dashboard (note: **no** `VITE_`
prefix, so they never reach the browser):

```
CLOUDINARY_API_KEY      453561363972366
CLOUDINARY_API_SECRET   rD00pb0D-qwqSel_WTpR58h5rZY
FIREBASE_API_KEY        <same value as VITE_FIREBASE_API_KEY>
ADMIN_EMAILS            admin@gmail.com
```

and then set `VITE_CLOUDINARY_SIGNATURE_URL=/api/cloudinary-sign`.

When that variable is set the admin uses signed uploads; when it is empty it
uses the preset. Nothing else changes.

> The API secret is in your local `.env` for reference. `.env` is gitignored.
> Since the secret was shared in plain text, consider rotating it in the
> Cloudinary console once you are set up.

---

## 4. How content reaches the website

This site is prerendered — every page is a real HTML file, which is why it does
well in search. Database-driven content works in **two** ways at once:

1. **At build time.** `npm run build` reads published records from Firestore and
   writes a real file per post and event — `dist/blog/<slug>/index.html` — with
   its own `<title>`, canonical URL, Open Graph tags and JSON-LD, plus a sitemap
   entry. Crawlers and link previews get the full article with no JavaScript.

2. **At runtime.** Pages also fetch from Firestore in the browser. So something
   published in the admin **appears on the live site immediately**, without
   waiting for a deploy. It gains its prerendered file at the next build.

The practical rule: publish freely, and redeploy when convenient so new posts
get their fully static version and sitemap entry.

### Performance

The admin's dependencies — Firebase SDK, the Jodit editor, DOMPurify — are
loaded only when someone opens `/admin`:

| Bundle | Gzipped | Who downloads it |
|---|---|---|
| Public site JS | ~105 KB | every visitor |
| Public site CSS | ~12 KB | every visitor |
| Admin JS | ~200 KB | only on `/admin` |
| Editor (Jodit) JS + CSS | ~209 KB + ~24 KB | only when editing a body |

Public pages read Firestore over its REST API rather than the SDK, which is what
keeps the visitor-facing bundle small. Images go through Cloudinary with
`f_auto,q_auto` and a `srcset`, so a phone never downloads a desktop-sized file.

---

## 5. Using the admin

**Sign in** at `/admin/login`. Every other `/admin` URL redirects here if you are
not signed in, and returns you where you were headed after you sign in.

**Every list** has search, sorting, pagination and a per-page selector (10 / 25 /
50 / 100). Search runs across all fields by default, or you can point it at one
field with the dropdown beside it. All of that state lives in the URL, so a
filtered view can be bookmarked and survives the back button.

**Drafts.** Everything has a *Published* switch. Off means it is invisible to the
website — enforced by security rules, not just hidden in the UI.

**Slugs** are generated from the title and stay editable. Once a record is saved
the slug stops following the title, because it is part of a published URL that
should not change underneath people. Duplicate slugs are rejected on save.

**Images.** The banner/main image fields and the gallery upload to Cloudinary
with a progress bar. Each image has an alt-text box — please fill it in; it is
what screen readers announce and it helps image search.

**Article bodies** use the Jodit editor. You can paste or drag images straight
in and they upload to Cloudinary automatically rather than being embedded as
base64. Content is sanitised when saved.

**Event forms.** `/admin/event-forms` lists every event and whether it has a
registration form. Open one to build its fields — label, type (text, email,
phone, dropdown, single/multiple choice, date…), required, help text, options.
"Start with name, email and phone" gives you the common case in one click. The
event page renders exactly those fields.

Answers are stored under a field's internal key, shown as `stored as ...` on
each field. Renaming a label after submissions exist keeps the old key on
purpose, so existing answers are not orphaned.

**Registrations** are at `/admin/registrations`, filterable by event, with a CSV
export (UTF-8 with BOM, so Excel reads accented names correctly). Visitors can
submit but can never read submissions back — that is enforced in the rules.

---

## 6. Data model

```
blogs/{id}          title, slug, shortDescription, bannerImage, date,
                    minuteRead, description (HTML), author, isActive, isPrimary
events/{id}         name, slug, date, shortDescription, description (HTML),
                    mainImage, imageGallery[], isActive
podcasts/{id}       name, slug, youtubeLink, description (HTML), date, isActive
eventForms/{eventId}  isActive, title, intro, submitLabel, successMessage,
                    fields[] — the document ID is the event ID
eventRegistrations/{id}  eventId, eventName, values{}, createdAt (server time)
admins/{uid}        email, name — presence of this document grants admin access
```

Security rules summary (`firestore.rules`):

- anyone may read a record where `isActive == true`
- only an admin may read drafts, or write anything
- anyone may **create** a registration; only an admin may read one
- `admins` is never writable from a browser

---

## 7. Commands

```bash
npm run dev            # dev server
npm run typecheck      # TypeScript, no emit
npm run build          # typecheck + build + prerender (incl. content)
npm run preview        # serve the built site
npm run seed:admin     # create the admin account
npm run deploy:rules   # push firestore.rules + indexes
```

`npm run build` works before Firebase is configured — it prerenders the fixed
pages, logs that no content was found, and carries on. It never blocks a deploy.
