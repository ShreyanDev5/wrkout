'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { SettingsScreen } from '@/components/screens/settings-screen';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { loadUserWorkouts, loadUserWorkoutDays, saveUserWorkouts, saveUserWorkoutDays } from '@/lib/supabase-data';
import type { Workout, WorkoutDay } from '@/lib/types';

export default function SettingsPage() {
  const { user, signOut, username } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClientComponentClient(), []);

  // Add local state for workouts and workoutDays
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutDays, setWorkoutDays] = useState<WorkoutDay[]>([]);

  const loadSettingsData = useCallback(async () => {
    if (!user) return;

    const [loadedWorkouts, loadedWorkoutDays] = await Promise.all([
      loadUserWorkouts(supabase, user.id),
      loadUserWorkoutDays(supabase, user.id),
    ]);

    setWorkouts(loadedWorkouts);
    setWorkoutDays(loadedWorkoutDays);
  }, [supabase, user]);

  // Load workouts and workoutDays from Supabase on mount (and when user changes)
  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  // Handler to update both workouts and workoutDays
  const handleUpdateWorkoutsAndDays = async (newWorkouts: Workout[], newWorkoutDays: WorkoutDay[]) => {
    setWorkouts(newWorkouts);
    setWorkoutDays(newWorkoutDays);
    if (user) {
      try {
        await saveUserWorkouts(supabase, newWorkouts, user.id);
        await saveUserWorkoutDays(supabase, newWorkoutDays, user.id);
        await loadSettingsData();
      } catch (error) {
        console.error('Supabase save or reload error:', error);
      }
    }
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const displayUsername = username || (user?.email ? user.email.replace(/@wrkout\.app$/, '') : '');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* User Info Section */}
            {user && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-400 text-black">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{displayUsername || user.email}</p>
                    <p className="text-sm text-muted-foreground">Signed in</p>
                  </div>
                </div>
                <Separator />
              </div>
            )}

            {/* Auth Buttons */}
            <div className="space-y-4">
              {user ? (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-2 hover:bg-accent"
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSignIn}
                    className="w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-black font-semibold"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={handleSignUp}
                    variant="outline"
                    className="w-full border-2 hover:bg-accent"
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Render the SettingsScreen for workout management */}
      <SettingsScreen
        workouts={workouts}
        workoutDays={workoutDays}
        onUpdateWorkoutsAndDays={handleUpdateWorkoutsAndDays}
      />
    </div>
  );
} 