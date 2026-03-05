'use client';

import { useAuth } from '@/lib/auth';
import { WorkoutTracker } from "@/components/dashboard/workout-tracker";
import { AuthPopup } from '@/components/auth/auth-popup';

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-background">
      <WorkoutTracker />
      {!user && <AuthPopup />}
    </main>
  );
}
