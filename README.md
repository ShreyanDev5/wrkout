# wrkout

Fast, distraction-free workout logger built for Push, Pull, Legs (PPL) splits. Log sets in seconds, track volume trends, and calculate progressive overload without ads or clutter.

[![Live Demo](https://img.shields.io/badge/Live_Demo-wrkout--tracker.vercel.app-blue?style=flat-square)](https://wrkout-tracker.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)

![wrkout Preview](public/readme_home_page.png)

---

## Features

- **Rapid Set Logging**: Inline steppers to record weight and reps in seconds.
- **Volume & Overload Tracking**: Auto-calculates volume and flags progress against previous sessions.
- **PPL Routine Builder**: Custom workout split management and exercise library.
- **Simple Auth**: Frictionless username login mapped to secure Supabase accounts.
- **Tactile Feedback**: Audio clicks and device vibration on set completion.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion |
| **State** | Zustand, Immer |
| **Backend & DB** | Supabase (PostgreSQL, Auth, Migrations) |
| **UI & Icons** | Radix UI, Lucide React, Sonner (Toasts) |
| **Deployment** | Vercel |

---

## Project Structure

```text
wrkout/
├── app/          # App Router pages, auth routes, and API endpoints
├── components/   # UI components and workout modals
├── hooks/        # Hooks for app state, audio, and haptics
├── lib/          # Supabase client and shared utilities
├── public/       # Static assets, audio, and icons
└── supabase/     # Database schema and migrations
```

---

## Quickstart

### Prerequisites
- Node.js 18+
- Docker Desktop (running with WSL 2 backend)

### 1. Clone & Install
```bash
git clone https://github.com/ShreyanDev5/wrkout.git
cd wrkout
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Optional: leave blank to log reset codes in terminal
RESEND_API_KEY=
```

### 3. Start DB & Dev Server
```bash
npx supabase start
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Author

**Shreyan Sardar** — [Portfolio](https://shreyandev.vercel.app) · [GitHub](https://github.com/ShreyanDev5) · [Live Demo](https://wrkout-tracker.vercel.app/)
