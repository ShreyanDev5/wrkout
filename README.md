# wrkout

A premium, minimalist workout tracking application built for serious lifters who value simplicity and effectiveness. Track your progressive overload journey with a clean, distraction-free interface based on the PPL (Push, Pull, Legs) split.

## 🏋️ Features

### Core Functionality
- **PPL Split System**: Built around the proven Push, Pull, Legs training methodology
- **Progressive Overload Tracking**: Log weights and reps to track strength progression over time
- **Session-Based Logging**: Quick checkmark completion with optional detailed weight/rep logging
- **Routine Management**: Create and customize workout routines with multiple days and exercises
- **Real-Time Progress**: Visual session progress bar showing workout completion percentage

### User Experience
- **Minimal, Premium UI**: Dark theme with carefully crafted aesthetics
- **Three-Tab Navigation**: Seamless navigation between Workout, Progress, and Settings
- **Modal Confirmations**: Polished confirmation dialogs for all critical actions
- **Inline Workout Logger**: Quick weight/sets/reps entry directly in exercise cards
- **Smart Defaults**: Previous weights and reps are pre-filled for faster logging
- **Responsive Design**: Optimized for mobile, tablet, and desktop

### Authentication & Data
- **Username-Based Auth**: Simple authentication without email requirements
- **Cloud Sync**: Data synced across devices via Supabase
- **Automatic Daily Reset**: Session resets automatically at midnight
- **Password Recovery**: Custom recovery system via associated email

## 🎨 Design Philosophy

This app follows a **strictly minimal, premium aesthetic**:

- **Dark-First Design**: Premium dark background (#1A1A1A) with subtle zinc accents
- **Color-Coded Workouts**: Yellow (Push), Green (Pull), Red (Legs) accent system
- **Refined Typography**: Clean, readable fonts with proper hierarchy
- **Subtle Animations**: Smooth Framer Motion transitions without distraction
- **No Visual Clutter**: Every element serves a purpose
- **Touch-Optimized**: 44px+ touch targets, proper spacing for mobile use

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI primitives
- **State Management**: Zustand + React hooks
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui component library
- **Charts**: Recharts for progress visualization

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Row Level Security
- **Real-time**: Supabase subscriptions
- **API**: Next.js API routes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/wrkout.git
   cd wrkout
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📂 Project Structure

```
wrkout/
├── app/                        # Next.js App Router
│   ├── api/                    # API routes (auth, data operations)
│   ├── auth/                   # Authentication pages (signin, signup, reset)
│   └── globals.css             # Global styles and CSS variables
├── components/
│   ├── auth/                   # Auth components (forms, layouts, popup)
│   ├── dashboard/              # Main app components
│   │   ├── TabNavigation.tsx   # Bottom navigation bar
│   │   ├── day-exercises.tsx   # Exercise list with inline logger
│   │   ├── workout-tracker.tsx # Main workout orchestrator
│   │   └── ...
│   ├── layouts/                # Layout components (collapsible header)
│   ├── modals/                 # Modal dialogs
│   │   ├── workout-log-modal.tsx
│   │   ├── reset-confirmation-modal.tsx
│   │   ├── deletion-confirmation-modal.tsx
│   │   └── restriction-confirmation-modal.tsx
│   ├── onboarding/             # Onboarding guide components
│   ├── screens/                # Main screen components
│   │   ├── workout-screen.tsx  # Workout tab
│   │   ├── progress-screen.tsx # Progress tab
│   │   └── settings-screen.tsx # Settings tab
│   └── ui/                     # shadcn/ui components
├── hooks/                      # Custom React hooks
├── lib/                        # Utilities, types, and data operations
│   ├── auth/                   # Auth context and utilities
│   ├── types.ts                # TypeScript interfaces
│   ├── supabase.ts             # Supabase client
│   └── utils.ts                # Helper functions
├── supabase/                   # Database migrations
└── public/                     # Static assets
```

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

interface WorkoutDay {
  id: string;
  workout_id: string;
  day_id: 'push' | 'pull' | 'leg';
  name: string;
  exercises: Exercise[];
}

interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string;
  exercise_name: string;
  weight: number;
  avg_reps: number;
  performed_at: string; // Date string (YYYY-MM-DD)
}
```

## 🔒 Security

- Row Level Security (RLS) policies on all tables
- User data isolation - users can only access their own data
- Comprehensive input validation
- TypeScript type safety throughout
- Service role permissions for admin operations only

## 📱 Recent Improvements

### UI/UX Refinements
- Seamless bottom navigation with consistent app background color
- Refined routine selector without chevron overlap
- Polished pill-shaped filter container for Push/Pull/Leg selection
- Enhanced modal dialogs with premium styling and animations
- Improved active/inactive state contrast throughout

### Technical Updates
- Automatic daily session reset via visibility/focus events
- Optimized inline workout logger with proper spacing
- Streamlined Progress page showing recent sessions
- Comprehensive onboarding guide aligned with minimal aesthetic
- Codebase cleanup: removed deprecated files and unused code

## 🛠️ Key Components

### Onboarding Guide
A 6-step interactive carousel introducing new users to:
1. App philosophy and PPL methodology
2. Progressive overload concepts
3. Smart logging workflow
4. Progress visualization features
5. Getting started tips

### Modal System
Polished modal dialogs for:
- Workout logging (weight/reps entry)
- Delete confirmations (workout/day/exercise)
- Sign out confirmation
- Restriction notices (max days, duplicate prevention)

### Navigation
Three-tab bottom navigation:
- **Workout**: Main exercise tracking interface
- **Progress**: Recent sessions and performance charts
- **Settings**: Routine management, account options, guide access

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel (recommended):
   ```bash
   npx vercel
   ```

## 📋 Troubleshooting

- **Authentication Issues**: See `SUPABASE_SETUP.md`
- **Password Recovery**: See `USERNAME_BASED_PASSWORD_RECOVERY.md`
- **Build Errors**: Ensure all TypeScript types are satisfied

## 🤖 AI-Assisted Development

This project was developed with AI assistance:
- **v0 by Vercel** - UI component generation
- **Cursor** - Intelligent code completion
- **Gemini CLI** - Code generation and refactoring

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and open a Pull Request

## 📄 License

MIT License - see `LICENSE` file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)