'use client';

import { useAuth } from '@/lib/auth';
import { WorkoutTracker } from "@/components/dashboard/workout-tracker";
import { AuthPopup } from '@/components/auth/auth-popup';

export default function Home() {
  const { user, isLoading } = useAuth();


  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <WorkoutTracker />
      {!user && <AuthPopup />}
    </main>
  );
}
