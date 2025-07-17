# wrkout

A modern workout tracking application built with Next.js, Supabase, and TypeScript. Track your fitness journey with a beautiful, responsive interface.

## 🏋️ Features

- **Workout Planning**: Create and manage custom workout routines
- **Exercise Tracking**: Log sets, reps, and weights with real-time feedback
- **Progress Monitoring**: Visualize fitness progress with interactive charts
- **User Authentication**: Complete auth system with Supabase
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark/Light Theme**: Automatic theme switching
- **Audio Feedback**: Sound notifications for workout completion

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State**: Zustand + React hooks
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
- **Real-time**: Supabase subscriptions
- **API**: Next.js API routes

## 📊 Data Models

```typescript
interface Workout {
  id: string;
  user_id: string;
  name: string;
  days: WorkoutDay[];
  created_at: string;
  updated_at: string;
}

interface WorkoutLog {
  id: string;
  user_id: string;
  exercise_name: string;
  weight: number;
  avg_reps: number;
  performed_at: string;
}
```

## 🗂️ Project Structure

```
wrkout/
├── app/                    # Next.js App Router
├── components/            # React components
│   ├── auth/              # Authentication
│   ├── screens/           # Main screens
│   └── ui/                # UI components
├── lib/                   # Utilities & types
├── hooks/                 # Custom hooks
└── supabase/              # Database migrations
```

## 🔐 Security

- Row Level Security (RLS) policies
- User data isolation
- Comprehensive input validation
- TypeScript type safety

## 🎨 Design

- Gradient color scheme (gold → green → red)
- Adaptive light/dark themes
- Mobile-first responsive design
- WCAG compliant accessibility

## 🚀 Performance

- Code splitting and lazy loading
- Optimized bundle size
- Strategic caching
- Core Web Vitals optimization

## Data Safety & Cascading Delete Logic Improvements Checklist

- [x] **components/screens/settings-screen.tsx**: Added confirmation dialog for deleting the last workout routine.
- [x] **lib/supabase-data.ts**: Hardened save logic to prevent accidental mass deletion; added clear comments about cascading deletes and safety.
- [ ] **components/workout-tracker.tsx**: (No changes needed, but logic reviewed for safety.)
- [ ] **components/screens/workout-screen.tsx**: (No changes needed, but logic reviewed for safety.)
- [ ] **components/reset-confirmation-modal.tsx**: (Reused for confirmation dialog.)

All critical logic for safe, predictable data handling and cascading deletes is now in place. See code comments for details.
