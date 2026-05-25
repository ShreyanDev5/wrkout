# ⚡ wrkout

A premium, high-performance, and beautifully crafted private workout tracker built with **Next.js** and **Supabase**. 

`wrkout` is designed as a smooth Single-Page Application (SPA) that runs entirely on the root route (`/`), utilizing haptic feedback, fluid animations, and a contextual logger to optimize your training flow.

---

## ✨ Features & Architecture

- **🚀 Single-Page Experience**: Instant load times and fluid screen switching between **Workout**, **Progress**, and **Settings** views.
- **🎨 Premium UI/UX**: Crafted with custom Tailwind styling, smooth Framer Motion transitions, and theme script optimizations (Light/Dark mode).
- **🔊 Multi-Sensory Feedback**: Responsive haptic feedback (vibrations) and subtle audio feedback (ticks) on actions.
- **🛡️ Custom Auth Model**: Simplified login using plain usernames mapping internally to secure pseudo-emails (`username@wrkout.app`), supported by a custom verification and recovery flow.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router) & React 18
- **Styling**: Tailwind CSS & Vanilla CSS
- **Animations**: Framer Motion
- **Database & Auth**: Supabase (PostgreSQL)
- **State & Stores**: Zustand & Immer

---

## 🔑 Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
PASSWORD_RESET_FROM_EMAIL=noreply@yourdomain.com
```

> [!NOTE]
> `RESEND_API_KEY` and `PASSWORD_RESET_FROM_EMAIL` are optional in development. If not configured, the console will log the local recovery URL to complete the reset process directly.

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Start the local development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

- **`app/`**: Core SPA page routes, custom recovery pages, and API endpoints (`check-username`, `send-recovery-code`, `reset-password`).
- **`components/`**: Clean component tree including screen layouts (`screens/`), interactive charts (`charts/`), overlay modals (`modals/`), and shared custom UI primitives (`ui/`).
- **`hooks/`**: Specialized React hooks managing state and sensory feedback (`use-workout-logic`, `use-audio-feedback`, `use-haptics`, `use-toast`).
- **`lib/`**: Business logic modules, Supabase helper functions, offline storage, and formatting utilities.
- **`supabase/`**: Local configuration (`config.toml`) and database schema migrations (`migrations/`).
