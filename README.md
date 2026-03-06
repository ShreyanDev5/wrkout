# wrkout

Private Next.js + Supabase workout tracker.

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS + Radix/shadcn UI
- Supabase Auth + Postgres

## Auth Model

- Users sign in with a username in the UI.
- Internally, auth uses a pseudo-email format: `<username>@wrkout.app`.
- Password reset is handled by `POST /api/auth/reset-password`.

## Required Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required by `lib/supabase.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` is required by `app/api/auth/reset-password/route.ts`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint

## Database

- Supabase config: `supabase/config.toml`
- SQL migrations: `supabase/migrations/`

## Project Layout

- `app/` - routes, layouts, and API handlers
- `components/` - UI and screen components
- `hooks/` - reusable React hooks
- `lib/` - auth/data utilities and shared types
- `types/` - global TypeScript declarations
