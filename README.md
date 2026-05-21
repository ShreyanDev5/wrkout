# wrkout

Private Next.js + Supabase workout tracker.

## Architecture & Stack

The application is structured as a premium, dynamic Single-Page Application (SPA) running entirely on the root route (`/`). It uses an animated, tab-based navigation layout to seamlessly switch between **Workout**, **Progress**, and **Settings** views, backed by highly polished custom components.

- **Frontend**: Next.js 15 (App Router) + React 18 + TypeScript
- **Styling & UI**: Tailwind CSS + Framer Motion + Radix/shadcn UI
- **Database & Auth**: Supabase Auth + PostgreSQL

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
RESEND_API_KEY=...
PASSWORD_RESET_FROM_EMAIL=...
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required by `lib/supabase.ts`.
- `SUPABASE_SERVICE_ROLE_KEY` is required by the auth API routes.
- `RESEND_API_KEY` and `PASSWORD_RESET_FROM_EMAIL` are required to send password reset emails in production. In development, the backend returns the generated reset URL when email delivery is not configured.

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

- `app/` - Core SPA layout, API handlers, authentication routes, and the privacy policy page
- `components/` - Screen-level components (`screens/`), reusable UI blocks (`ui/`), charts, and modals
- `hooks/` - Reusable React hooks (e.g. haptics, theme, and audio feedback)
- `lib/` - Auth helpers, database queries, and storage utilities
- `types/` - Global TypeScript declarations
