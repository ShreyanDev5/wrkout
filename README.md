# wrkout

A modern, full-stack workout tracking application built with Next.js, Supabase, and TypeScript. Track your fitness journey with a beautiful, responsive interface that adapts to your workout routine.

## 🏋️ Features

### Core Functionality

- **Workout Planning**: Create and manage custom workout routines with multiple training days
- **Exercise Tracking**: Log sets, reps, and weights for each exercise with real-time feedback
- **Progress Monitoring**: Visualize your fitness progress with interactive charts and analytics
- **Data Persistence**: Secure cloud storage with Supabase backend
- **User Authentication**: Complete auth system with email/password and social login support

### User Experience

- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Dark/Light Theme**: Automatic theme switching with system preference detection
- **Audio Feedback**: Sound notifications for workout completion and milestones
- **Onboarding Guide**: Interactive tutorial for new users
- **Real-time Sync**: Automatic data synchronization across devices

### Technical Features

- **TypeScript**: Full type safety throughout the application
- **Modern UI**: Built with Radix UI primitives and Tailwind CSS
- **State Management**: Zustand for efficient client-side state management
- **Form Validation**: Zod schema validation with React Hook Form
- **Animations**: Smooth transitions and micro-interactions with Framer Motion

## 🏗️ Architecture

### Frontend Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: Zustand for global state, React hooks for local state
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth interactions

### Backend Stack

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with Row Level Security
- **Real-time**: Supabase real-time subscriptions
- **Storage**: Supabase storage for user data
- **API**: Next.js API routes with Supabase client

### Key Libraries

- **@supabase/supabase-js**: Database and auth client
- **@radix-ui/react-\***: Accessible UI components
- **lucide-react**: Icon library
- **date-fns**: Date manipulation utilities
- **uuid**: Unique identifier generation
- **sonner**: Toast notifications
- **next-themes**: Theme management

## 📊 Data Models

### Workout Structure

```typescript
interface Workout {
  id: string;
  user_id: string;
  name: string;
  days: WorkoutDay[];
  created_at: string;
  updated_at: string;
}
```

### Workout Day

```typescript
interface WorkoutDay {
  id: string;
  workout_id: string;
  day_id: string;
  name: string;
  exercises: Exercise[];
  created_at: string;
  updated_at: string;
}
```

### Workout Log

```typescript
interface WorkoutLog {
  id: string;
  user_id: string;
  workout_id: string;
  workout_day_id: string | null;
  exercise_name: string;
  weight: number;
  avg_reps: number;
  performed_at: string;
  created_at: string;
  updated_at: string;
}
```

## 🗂️ Project Structure

```
wrkout/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── screens/           # Main application screens
│   ├── ui/                # Reusable UI components
│   └── layouts/           # Layout components
├── lib/                   # Utility libraries
│   ├── auth/              # Authentication utilities
│   ├── supabase.ts        # Supabase client configuration
│   └── types.ts           # TypeScript type definitions
├── hooks/                 # Custom React hooks
├── supabase/              # Database migrations
└── public/                # Static assets
```

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level security policies
- **User Isolation**: Users can only access their own data
- **Authentication**: Secure user authentication with Supabase Auth
- **Input Validation**: Comprehensive form validation with Zod schemas
- **Type Safety**: Full TypeScript coverage for runtime safety

## 🎨 Design System

### Color Palette

- **Primary**: Gradient from gold to green to red (representing workout intensity)
- **Background**: Adaptive light/dark themes
- **Accent**: Consistent color scheme across components

### Typography

- **Headings**: Bold, gradient text with custom letter spacing
- **Body**: Clean, readable fonts optimized for mobile
- **Interactive**: Hover and active states for all interactive elements

### Components

- **Modern UI**: Radix UI primitives with custom styling
- **Accessibility**: WCAG compliant components with proper ARIA labels
- **Responsive**: Mobile-first design with progressive enhancement

## 📱 Mobile Optimization

- **Touch-Friendly**: Optimized touch targets and gestures
- **Progressive Web App**: Installable on mobile devices
- **Offline Support**: Local storage for offline functionality
- **Performance**: Optimized bundle size and loading times

## 🔧 Development Features

- **Hot Reload**: Fast development with Next.js hot reloading
- **Type Checking**: Strict TypeScript configuration
- **Linting**: ESLint configuration for code quality
- **Formatting**: Consistent code formatting across the project
- **Migrations**: Database schema versioning with Supabase migrations

## 🚀 Performance Optimizations

- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component for optimized images
- **Bundle Analysis**: Webpack bundle analyzer for optimization
- **Caching**: Strategic caching strategies for data and assets
- **Lazy Loading**: Component and route lazy loading

## 📈 Analytics & Monitoring

- **Error Tracking**: Comprehensive error handling and logging
- **Performance Monitoring**: Core Web Vitals tracking
- **User Analytics**: Anonymous usage analytics for feature improvement
- **Database Monitoring**: Supabase dashboard for database performance

## 🤝 Contributing

This project follows modern development practices with:

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commit messages
- Comprehensive testing strategy
