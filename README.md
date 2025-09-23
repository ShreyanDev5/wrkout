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
- **Onboarding Guide**: Comprehensive carousel-based introduction for new users
- **Username-Based Authentication**: Unique authentication system without email requirements

## 🤖 AI-Assisted Development

This project was developed with the assistance of AI tools, including:
- **v0 by Vercel** - For UI component generation and design inspiration
- **Cursor** - For intelligent code completion and refactoring
- **Gemini CLI** - For code generation and project scaffolding
- **Qwen CLI** - For code generation and project scaffolding

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **State**: Zustand + React hooks
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Animations**: Framer Motion
- **UI Components**: shadcn/ui component library

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth with RLS
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
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. Set up Supabase database:
   - Create a new Supabase project
   - Run the SQL commands from `SUPABASE_SETUP.md` to create tables
   - Configure authentication settings as described in the setup guide

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

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
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── screens/           # Main screens
│   └── ui/                # UI components
├── lib/                   # Utilities & types
├── hooks/                 # Custom hooks
├── supabase/              # Database migrations
└── public/                # Static assets
```

## 🔐 Security

- Row Level Security (RLS) policies
- User data isolation
- Comprehensive input validation
- TypeScript type safety
- Service role permissions for admin operations

## 🎨 Design

- Gradient color scheme (gold → green → red)
- Adaptive light/dark themes
- Mobile-first responsive design
- WCAG compliant accessibility
- Modern UI with shadcn/ui components

## 🚀 Performance

- Code splitting and lazy loading
- Optimized bundle size
- Strategic caching
- Core Web Vitals optimization

## 🛠️ Key Features Implementation

### Onboarding Guide

The app includes a comprehensive onboarding guide that helps new users understand and navigate the app effectively. The guide appears as a visually appealing carousel that introduces users to the key features of the app.

### Username-Based Authentication

A unique authentication system where users register and login using only usernames and passwords without requiring email addresses. This includes a custom password recovery implementation.

### Data Safety & Cascading Delete Logic

The app implements robust data safety measures including confirmation dialogs for critical operations and hardened save logic to prevent accidental mass deletion.

## 📈 Development Progress

This project serves as a portfolio piece tracking progress toward becoming a world-class software developer. Key milestones include:

- Implementation of a comprehensive authentication system
- Development of responsive UI with dark/light theme support
- Creation of data visualization features for progress tracking
- Implementation of unique username-based authentication
- Development of onboarding experience for new users

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to your preferred hosting platform:
   - Vercel (recommended for Next.js apps)
   - Netlify
   - Self-hosted Node.js server

## 📋 Troubleshooting

### Authentication Issues

See `SUPABASE_SETUP.md` for detailed setup instructions for Supabase authentication.

### Forgot Password Issues

See `FORGOT_PASSWORD_TROUBLESHOOTING.md` for solutions to common email delivery problems.

### Username-Based Password Recovery

See `USERNAME_BASED_PASSWORD_RECOVERY.md` for implementation details of the custom password recovery system.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.io/) - Backend as a service
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) - Accessible UI primitives