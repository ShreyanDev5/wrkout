'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { WorkoutTracker } from '@/components/workout-tracker';
import { AuthPopup } from '@/components/auth/auth-popup';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Auth state:', { user, isLoading });
  }, [user, isLoading]);

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
