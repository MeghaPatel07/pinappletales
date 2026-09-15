# Pineappletales — Admin & Content Setup

Next.js (App Router) is now both the frontend and the backend: pages are
Server Components reading straight from MongoDB, and the admin panel at
`/admin` talks to a REST API under `/api/admin/**`, protected by a JWT
access/refresh token pair. There is no more Firebase anywhere in this
project.

```
Admin                        Public
/admin/blogs             →   /blog, /blog/<slug>
/admin/events             →   /events, /events/<slug>
/admin/podcasts            →   /podcast
/admin/event-forms          →   the registration form on each event page
/admin/registrations        →   (read-only: what visitors submitted)
```

---

## 1. What you must fill in before it works

Copy `.env.example` to `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string (or a local `mongodb://localhost:27017/pineappletales`) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | Any strong random string, e.g. `openssl rand -base64 48`. Two different values. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_CLOUD_NAME` | Cloudinary console → Settings → the "cloud name" of your product environment (same value in both) |
| `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary console → Settings → API Keys |

> Restart `npm run dev` after editing `.env`.

### Create the admin login

```bash
npm run seed:admin
```

Creates `admin@gmail.com` / `1234567`. To use different details:

```bash
npm run seed:admin -- someone@example.com theirpassword "Their Name"
```

This writes an `AdminUser` document straight into MongoDB with a bcrypt
password hash — no email/password sign-up flow exists, admins are only ever
created this way (or by editing MongoDB directly).

> **Change the password before this is publicly reachable.**

---

## 2. Authentication model

- Signing in (`/admin/login`) posts to `POST /api/auth/login`, which checks
  the email/password against MongoDB and returns a short-lived **access
  token** (15 minutes) plus sets a long-lived **refresh token** as an
  `httpOnly` cookie (30 days).
- The admin SPA keeps the access token in memory only (never
  `localStorage`) and sends it as `Authorization: Bearer <token>` on every
  `/api/admin/**` call.
- `src/middleware.ts` is the one authentication middleware: it verifies the
  access token on every `/api/admin/**` request (401 JSON if missing/
  invalid) and the refresh-token cookie on every `/admin/**` page request
  (redirects to `/admin/login` if missing/invalid).
- On a 401, the browser silently calls `POST /api/auth/refresh` (using the
  cookie) for a new access token and retries once before giving up.

---

## 3. Cloudinary setup

Uploads always go through the **signed** path — `POST
/api/admin/uploads/sign` — which is verified the same way as every other
`/api/admin/**` route (the JWT access token), rather than a Firebase ID
token. There's no unsigned-preset option any more since there's always a
real backend now.

Console → Settings → API Keys gives you `CLOUDINARY_API_KEY` and
`CLOUDINARY_API_SECRET`; put both in `.env` (never with a `NEXT_PUBLIC_`
prefix — the secret must never reach the browser bundle).

---

## 4. How content reaches the website

Public pages (`/`, `/blog`, `/blog/<slug>`, `/events`, `/events/<slug>`,
`/podcast`) are async Server Components that query MongoDB directly via
`src/lib/content.ts` — no client-side fetch, no separate prerender step.
`export const revalidate = 60` on each of them means a page rendered more
than 60 seconds ago is regenerated in the background on the next visit
(Next.js ISR), so publishing something in the admin shows up on the live
site within about a minute. Blog and event detail pages also get
`generateStaticParams`, so every known slug is pre-built at `next build`
time and new ones render on first request after that.

The same public data is also available over REST — `/api/blogs`,
`/api/events`, `/api/podcasts`, `/api/testimonials/home`,
`/api/event-forms/<eventId>` — for anything that needs to fetch it
client-side or from outside the app.

---

## 5. Using the admin

**Sign in** at `/admin/login`. Every other `/admin` URL redirects here if you
are not signed in (enforced by `middleware.ts`, so this happens before any
admin HTML ships), and returns you where you were headed after you sign in.

**Every list** has search, sorting, pagination and a per-page selector (10 /
25 / 50 / 100). Search runs across all fields by default, or you can point it
at one field with the dropdown beside it. All of that state lives in the URL,
so a filtered view can be bookmarked and survives the back button.

**Drafts.** Everything has a *Published* switch. Off means it is invisible to
the website — enforced by the public API/Server Component queries (they only
ever select `isActive: true`), not just hidden in the UI.

**Slugs** are generated from the title and stay editable. Once a record is
saved the slug stops following the title, because it is part of a published
URL that should not change underneath people. Duplicate slugs are rejected on
save (`409` from the API).

---

## 6. Migrating from the old Firestore project

If you have existing content in Firestore from before this migration:

```bash
npm run migrate:firestore
```

See `.env.example` for the extra variables this needs
(`FIREBASE_API_KEY`, `MIGRATION_ADMIN_EMAIL`, `MIGRATION_ADMIN_PASSWORD`).
It only *reads* Firestore — nothing there is modified — and writes matching
documents into MongoDB. Admin accounts are not migrated (Firebase never
exposes password hashes); run `npm run seed:admin` afterwards.
