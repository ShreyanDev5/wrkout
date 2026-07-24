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

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Username</Label>
          <div className="relative w-full group">
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={cn(
                "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all",
                username ? "pl-3" : "pl-9"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center pointer-events-none",
              "transition-all duration-200",
              username && "opacity-0 -translate-x-2"
            )}>
              <User className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-flex-dark transition-colors duration-200" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recoveryEmail" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recovery Email</Label>
          <div className="relative w-full group">
            <Input
              id="recoveryEmail"
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={cn(
                "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all",
                recoveryEmail ? "pl-3" : "pl-9",
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center pointer-events-none",
              "transition-all duration-200",
              recoveryEmail && "opacity-0 -translate-x-2"
            )}>
              <Mail className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-flex-dark transition-colors duration-200" />
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 leading-4">
            Required to securely recover your account if you forget your password.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Password
          </Label>
          <div className="relative w-full group">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={cn(
                "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all",
                password ? "pl-3" : "pl-9"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center pointer-events-none",
              "transition-all duration-200",
              password && "opacity-0 -translate-x-2"
            )}>
              <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-flex-dark transition-colors duration-200" />
            </div>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-1">
            {passwordRequirements.map((req, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center text-[11px] font-medium transition-colors duration-200",
                  req.met ? "text-emerald-400" : "text-zinc-500"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "mr-1.5 h-3.5 w-3.5 transition-colors duration-200",
                    req.met ? "text-emerald-400" : "text-zinc-600"
                  )}
                />
                {req.label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Confirm password
          </Label>
          <div className="relative w-full group">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={cn(
                "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all",
                confirmPassword ? "pl-3" : "pl-9",
                password !== confirmPassword && confirmPassword && "border-rose-500/40"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center pointer-events-none",
              "transition-all duration-200",
              confirmPassword && "opacity-0 -translate-x-2"
            )}>
              <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-flex-dark transition-colors duration-200" />
            </div>
          </div>
          {password !== confirmPassword && confirmPassword && (
            <p className="text-xs text-rose-400 mt-1">
              Passwords do not match.
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className={cn(
          "h-10 w-full rounded-xl bg-flex-dark text-white hover:opacity-90 font-bold text-xs transition-all active:scale-95 border-none shadow-sm flex items-center justify-center cursor-pointer mt-3",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
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
      </button>
    </form>
  );
}
