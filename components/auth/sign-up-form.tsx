'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle2, User, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveUserWorkouts, createDefaultRoutinesForWorkout } from '@/lib/supabase-data';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createPseudoEmail, normalizeUsername, validatePassword, validateUsername } from '@/lib/auth/auth-utils';

export function SignUpForm() {
  const [username, setUsername] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate username
    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    // Validate recovery email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recoveryEmail) {
      setError('Recovery email is required for account security.');
      return;
    }
    if (!emailRegex.test(recoveryEmail)) {
      setError('Please enter a valid recovery email address.');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setIsLoading(true);

    try {
      const normalizedUsername = normalizeUsername(username);
      const pseudoEmail = createPseudoEmail(normalizedUsername);
      
      const { error } = await signUp(pseudoEmail, password, normalizedUsername, recoveryEmail);
      if (error) {
        setError(error.message);
        return;
      }
      
      const { error: signInError, data: signInData } = await signIn(pseudoEmail, password);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      
      if (signInData && signInData.user) {
        const supabase = createClientComponentClient();
        const defaultWorkoutId = crypto.randomUUID();
        // Create a default 'My Workouts' routine for new users (one-time, only on sign-up)
        await saveUserWorkouts(supabase, [{
          id: defaultWorkoutId,
          user_id: signInData.user.id,
          name: 'My Workouts',
          days: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }], signInData.user.id);

        // Pre-populate standard Push, Pull, Legs routines (days) with exercises
        await createDefaultRoutinesForWorkout(supabase, signInData.user.id, defaultWorkoutId);
      }
      
      router.push('/');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-[18px] sm:space-y-5">
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 border-leg-light/20 bg-leg-light/10 text-zinc-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3.5 sm:space-y-4">
        <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-zinc-200">Username</Label>
          <div className="relative w-full">
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={cn(
                "h-[42px] w-full rounded-md border-white/10 bg-zinc-950/60 pl-9 text-zinc-100 shadow-none sm:h-11",
                "placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-push-light/25",
                "transition-all duration-200",
                username && "pl-3",
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              username && "opacity-0 -translate-x-2"
            )}>
              <User className="h-4 w-4 ml-3 text-zinc-500" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="recoveryEmail" className="text-sm font-medium text-zinc-200">Recovery Email</Label>
          <div className="relative w-full">
            <Input
              id="recoveryEmail"
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={cn(
                "h-[42px] w-full rounded-md border-white/10 bg-zinc-950/60 pl-9 text-zinc-100 shadow-none sm:h-11",
                "placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-pull-light/25",
                "transition-all duration-200",
                recoveryEmail && "pl-3",
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              recoveryEmail && "opacity-0 -translate-x-2"
            )}>
              <Mail className="h-4 w-4 ml-3 text-zinc-500" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 leading-4">
            Required to securely recover your account if you forget your password.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium text-zinc-200">
            Password
          </Label>
          <div className="relative w-full">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={cn(
                "h-[42px] w-full rounded-md border-white/10 bg-zinc-950/60 pl-9 text-zinc-100 shadow-none sm:h-11",
                "placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-pull-light/25",
                "transition-all duration-200",
                password && "pl-3"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              password && "opacity-0 -translate-x-2"
            )}>
              <Lock className="h-4 w-4 ml-3 text-zinc-500" />
            </div>
          </div>
          <div className="mt-[10px] grid grid-cols-1 gap-[5px] sm:mt-3 sm:gap-1.5">
            {passwordRequirements.map((req, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center text-xs transition-colors duration-200",
                  req.met ? "text-pull-light" : "text-zinc-500"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "mr-2 h-3.5 w-3.5",
                    req.met ? "text-pull-light" : "text-zinc-600"
                  )}
                />
                {req.label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-200">
            Confirm password
          </Label>
          <div className="relative w-full">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={cn(
                "h-[42px] w-full rounded-md border-white/10 bg-zinc-950/60 pl-9 text-zinc-100 shadow-none sm:h-11",
                "transition-all duration-200",
                "placeholder:text-zinc-500",
                confirmPassword && "pl-3",
                password !== confirmPassword && confirmPassword
                  ? "border-leg-light/40 focus-visible:border-leg-light/40 focus-visible:ring-1 focus-visible:ring-leg-light/20"
                  : "focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-leg-light/20"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              confirmPassword && "opacity-0 -translate-x-2"
            )}>
              <Lock className="h-4 w-4 ml-3 text-zinc-500" />
            </div>
          </div>
          {password !== confirmPassword && confirmPassword && (
              <p className="text-sm text-leg-light mt-1">
              Passwords do not match.
            </p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className={cn(
          "h-[42px] w-full rounded-md bg-pull-dark text-zinc-950 hover:bg-[#366b39] sm:h-11",
          "font-medium transition-colors duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
} 
