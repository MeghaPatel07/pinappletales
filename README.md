# Pineappletales — website

Marketing site and admin panel for **Pineappletales by Kenaa Jadeja** —
Child Analyst, Author, Neuro-Art Therapist and Bibliotherapist, Vadodara.

Full-stack Next.js: the public site, the admin panel and the API all live in
one app. See `ADMIN.md` for how content and authentication work.

---

## Stack

| Concern       | Choice                                                       |
| ------------- | -------------------------------------------------------------|
| Framework     | Next.js 15 (App Router) + React 19 + TypeScript (strict)     |
| Database      | MongoDB via Mongoose                                         |
| Auth          | JWT access/refresh tokens, enforced by `src/middleware.ts`   |
| Styling       | CSS Modules on top of a CSS custom-property token layer      |
| Images        | Cloudinary (signed uploads via `/api/admin/uploads/sign`)    |
| SEO           | Next.js Metadata API + JSON-LD, ISR (`revalidate = 60`)      |

---

## Commands

```bash
npm install

npm run dev              # dev server
npm run typecheck        # tsc --noEmit
npm run build             # next build
npm run start              # serve the production build

npm run seed:admin         # create/update an admin login in MongoDB
npm run migrate:firestore   # one-off: port content from the old Firestore project
```

Copy `.env.example` to `.env` and fill in `MONGODB_URI`, `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET` and the Cloudinary variables before running anything —
see `ADMIN.md` for details.

---

## Project layout

```
src/
  app/
    (site)/        public pages — Server Components reading MongoDB directly
    admin/          the admin panel (client-rendered, its own root layout)
    api/            REST routes: public reads + JWT-protected /api/admin/**
  lib/
    db.ts, models/  Mongoose connection + schemas
    auth/           JWT signing/verification, password hashing
    content.ts      public content queries, shared by Server Components and
                     the public API routes
    adminCrud.ts    shared CRUD handlers for the /api/admin/** routes
    api-client.ts   fetch wrapper used by the admin SPA (access token +
                     silent refresh)
  admin/            the admin UI: components, hooks, and one folder of
                     pages per content type — routed via thin wrappers under
                     app/admin/(protected)/**
  components/, seo/, config/, data/, types/   shared across admin and public
middleware.ts       the one auth middleware — protects /admin/** pages and
                    /api/admin/** routes
```

## How the SEO works

Every public route exports `generateMetadata` (or a static `metadata`
object) built from `src/seo/nextMetadata.ts`, plus a `<JsonLd>` component
for structured data. Blog and event detail pages use `generateStaticParams`
so every known slug is pre-built at `next build` time; `dynamicParams = true`
means a slug published afterwards still renders (and gets cached) on first
request. `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and
`/robots.txt` from the same MongoDB queries.
