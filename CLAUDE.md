# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start local dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No linter or test suite is configured.

## Stack

- **Next.js 16.2.9** — App Router, TypeScript. See AGENTS.md warning: this version has breaking changes.
- **Tailwind v4** — Uses `@import "tailwindcss"` in `globals.css`, not `tailwind.config.ts`. No `tailwind.config` file exists.
- **Supabase** — Two clients: `supabase-server.ts` (service role key, server-only writes) and `supabase-browser.ts` (anon key, browser reads). Never use the server client in Client Components.
- **Vercel** — Supabase+Vercel integration auto-injects env vars. Local dev requires `.env.local` (copy from `.env.local.example`).

## Architecture

The app is a personal time tracking dashboard. A cloud Claude routine runs at 4 PM ET weekdays, classifies calendar/email activity, and POSTs structured reports to `/api/report`. The frontend displays the last 7 days.

```
Cloud Routine (4 PM ET) → POST /api/report (Bearer token auth)
                                    ↓ service role key
                              Supabase (reports table)
                                    ↑ anon key
                        Next.js frontend (Vercel)
```

**Multi-user:** `user_id` is a handle (e.g. `joandrews`), stored in `localStorage` as `tt_user_id`. Each user also has a per-user `api_key` (UUID) stored in `localStorage` as `tt_api_key` and in the `users` table. All dashboard API routes require `Authorization: Bearer [api_key]`.

## Key Files

- `src/lib/supabase-server.ts` — Throws if env vars missing. All API routes wrap calls in try/catch to prevent 500s from propagating as blank responses.
- `src/lib/auth.ts` — `verifyApiKey(userId, authHeader)` helper used by protected routes.
- `src/app/api/report/route.ts` — Protected by `REPORT_API_SECRET` bearer token. Used exclusively by the cloud routine.
- `src/app/api/reports/route.ts` — Requires per-user `api_key` Bearer token.
- `src/app/api/profile/route.ts` — GET and PUT both require per-user `api_key` Bearer token.
- `src/app/setup/page.tsx` — Onboarding. Pre-seeds 6 accounts when handle is `joandrews`. Returns `api_key` from server and stores it in localStorage.
- `src/app/page.tsx` — Dashboard. Redirects to `/setup` if `tt_user_id` or `tt_api_key` missing from localStorage.

## Supabase Schema

Three tables: `users`, `accounts` (keywords-based account matching, comma-separated), `reports` (jsonb `structured_data` + `raw_text`). Unique constraint on `(user_id, report_date)` in `reports` — POST endpoint uses upsert.

## Tailwind v4 Gotcha

Dark-mode CSS variables cause input text to render near-white by default. Always add `text-gray-900` explicitly to text inputs and textareas.

## Environment Variables

| Var | Used by |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_URL` | Server + browser clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server client (bypasses RLS) |
| `REPORT_API_SECRET` | `/api/report` POST auth |

Diagnose missing vars: `GET /api/health` returns env check + DB connectivity status.
