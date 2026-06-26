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

**Two auth models — don't confuse them:**
- **`REPORT_API_SECRET`** — a single shared secret used only by the cloud routine to POST to `/api/report`. Set as an env var on Vercel; hardcoded in the routine prompt.
- **Per-user `api_key`** — a UUID generated at setup, stored in `localStorage` as `tt_api_key` and in the `users` table. Used by all other protected routes (`/api/reports`, `/api/profile`). Verified by `verifyApiKey()` in `src/lib/auth.ts`.

`user_id` is a handle (e.g. `joandrews`), stored in `localStorage` as `tt_user_id`.

## Key Files

- `src/lib/auth.ts` — `verifyApiKey(userId, authHeader)` — looks up `api_key` in the `users` table and compares.
- `src/app/api/report/route.ts` — Cloud routine writes here. Auth via `REPORT_API_SECRET`. Upserts on `(user_id, report_date)`.
- `src/app/api/reports/route.ts` — Dashboard reads here. Returns last 7 reports ordered by date desc.
- `src/app/api/profile/route.ts` — GET/PUT for user profile and accounts list. PUT replaces all accounts (delete + insert, not patch).
- `src/app/api/setup/route.ts` — Creates or re-initializes a user. Preserves existing `api_key` on re-setup. Clears and re-inserts accounts.
- `src/app/setup/page.tsx` — Pre-seeds 7 accounts when handle is `joandrews`. Stores `api_key` returned from server into localStorage.
- `src/app/page.tsx` — Dashboard, redirects to `/setup` if localStorage keys are missing.
- `src/components/DayCard.tsx` — Collapsible card for one day's report. Renders `structured_data.accounts` and `needs_input`; shows `raw_text` in a collapsible `<details>`.

## Supabase Schema

Three tables:
- `users` — `id` (handle), `name`, `slack_user_id`, `api_key`
- `accounts` — per-user keyword list for account matching; `keywords` is a comma-separated string; `is_internal: true` marks Adobe-internal accounts. **Note:** the `accounts` table is used by the frontend for display and profile editing only — the cloud routine embeds its own keyword list in the prompt and does not read from this table.
- `reports` — `user_id`, `report_date`, `total_hours`, `raw_text`, `structured_data` (jsonb). Unique on `(user_id, report_date)`.

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
