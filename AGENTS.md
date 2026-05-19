<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key quirks found in the bundled docs:
- For instant client-side navigation, export `unstable_instant` from the route — Suspense alone is insufficient.
<!-- END:nextjs-agent-rules -->

# travelku

**Stack:** Next.js 16.2.6 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4 + Supabase

## Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint (uses `eslint` directly, **not** `next lint`) |
| `npx tsc --noEmit` | Type-check (no dedicated script exists) |

No test framework installed.

## Architecture

**FE ↔ REST API (JSON) ↔ Supabase.** No server actions, no direct Supabase calls from the UI.

```
Client Components ──fetch()──> /api/* (Route Handlers) ──> Supabase
                                   │
                              @supabase/ssr cookie-based auth
```

## REST API routes

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Register staff |
| POST | `/api/auth/login` | Login (sets session cookie) |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current staff profile |
| GET | `/api/bookings` | List (filters, pagination via query params) |
| POST | `/api/bookings` | Create booking |
| GET/PUT/DELETE | `/api/bookings/[id]` | Single booking CRUD |
| PATCH | `/api/bookings/[id]/status` | Status transition (validates flow) |

## Auth

- Next.js Edge Middleware (`middleware.ts`) protects all routes except `/auth/*` and `/api/auth/*`.
- Session managed via `@supabase/ssr` cookies.
- DB tables (`staff`, `bookings`) have Row-Level Security (RLS) enabled.
- `/api/auth/me` is the source of truth for the current user on the client.
- 401 from any API route triggers redirect to `/auth/login`.

## DB migration

Run `supabase/migrations/0001_create_bookings.sql` in Supabase SQL Editor before using the app.

## Tailwind v4 quirks

- Uses `@import "tailwindcss"` (not `@tailwind` directives).
- Custom design tokens defined with `@theme inline { --color-*: ... }` (not `theme.extend` in config).
- PostCSS plugin: `@tailwindcss/postcss`.

## Path alias

`@/*` maps to **project root** (`D:\Live coding 24 visa\travelku`), not `src/`.

## Project layout

| Path | What |
|------|------|
| `lib/supabase/server.ts` | Server Supabase client (for API routes) |
| `lib/supabase/client.ts` | Browser Supabase client (unused directly by UI — kept for possible extension) |
| `lib/api/client.ts` | Typed `fetch()` wrapper with 401 handling |
| `lib/validation.ts` | Server-side booking validation (shared logic) |
| `lib/types.ts` | All shared TypeScript types |
| `components/bookings/` | Booking UI components (table, form, filters, etc.) |
| `components/auth/` | Auth UI components (login, register forms) |
| `app/api/auth/*` | Auth REST endpoints |
| `app/api/bookings/*` | Booking REST endpoints |
| `app/auth/*` | Login/register pages |
| `app/page.tsx` | Main booking dashboard (protected) |
| `app/layout.tsx` | Root layout |
| `middleware.ts` | Auth guard |
