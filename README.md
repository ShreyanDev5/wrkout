# 🏋️‍♂️ wrkout

A fast, simple workout tracker built with **Next.js** and **Supabase**, optimized specifically for the **Push, Pull, Legs (PPL)** split. Built to log workouts without ads, subscriptions, or clutter.

Most workout apps are slow, bloated, or locked behind paywalls. `wrkout` is a clean, single-page web app designed to log your sets in under 2 seconds so you can focus on lifting.

---

## ⚡ Features

- **Fast Logging**: Contextual inline logger with custom number steppers.
- **Volume & Trend Tracking**: Shows exercise volume trends compared to your previous workouts.
- **Clean UI**: Dark-mode first design with smooth Framer Motion transitions.
- **Tactile Feedback**: Audio ticks and mobile vibration (haptics) when you log sets.
- **Simple Auth**: Login with just a username. Internally maps to a secure Supabase account.
- **Routine Builder**: Create custom splits (like Push-Pull-Legs) and add your own exercises.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) & React 18
- **Database & Auth**: Supabase (PostgreSQL)
- **State Management**: Zustand & Immer
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Libraries**: Sonner (Toasts), Lucide React (Icons)
- **AI Toolchain Progression**: Built and iteratively refined over the years using: v0 by Vercel → Cursor → Windsurf → Gemini CLI → Qwen CLI → Codex → Antigravity

---

## 🔑 Local Setup

### Prerequisites
- Node.js (v18+)
- Docker (required to run Supabase locally)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/wrkout.git
cd wrkout
```

### 2. Start the local database
This project uses the Supabase CLI to run a local database instance.
```bash
npx supabase start
```
This command runs the database migrations automatically. Copy the local credentials outputted in the terminal:
- `API URL`
- `anon key`
- `service_role key`

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Optional: configure Resend for email delivery
RESEND_API_KEY=
PASSWORD_RESET_FROM_EMAIL=noreply@yourdomain.com
```
*Note: If `RESEND_API_KEY` is left empty, password recovery codes will log directly to your terminal console for local testing.*

### 4. Install and Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000].

---

## 📂 Project Structure

- **`app/`**: Routes, recovery pages, and auth API endpoints.
- **`components/`**: Layouts, modals, and custom UI components.
- **`hooks/`**: Custom hooks for app logic, audio, and haptics.
- **`lib/`**: Supabase client, local storage helpers, and database types.
- **`supabase/`**: Database migrations and configuration.
