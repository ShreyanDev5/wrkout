'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createPseudoEmail, validateUsername } from '@/lib/auth/auth-utils';

export function SignInForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const usernameError = validateUsername(username);
      if (usernameError) {
        setError(usernameError);
        setIsLoading(false);
        return;
      }
      const pseudoEmail = createPseudoEmail(username);
      const { error, data } = await signIn(pseudoEmail, password);
      
      if (error) {
        setError(error.message);
        return;
      }

      // After successful sign-in, set user_metadata.username if missing
      if (data && data.user) {
        const supabase = createClientComponentClient();
        if (!data.user.user_metadata?.username) {
          const { error: metaError } = await supabase.auth.updateUser({ data: { username: username.trim().toLowerCase() } });
          if (metaError) {
            setError(metaError.message);
            return;
          }
        }
        // Only load user workouts; do not insert any default routine
        // const workouts = await loadUserWorkouts(supabase, data.user.id);
        // if (!workouts || workouts.length === 0) {
        //   await saveUserWorkouts(supabase, [{ id: crypto.randomUUID(), name: 'My Workouts', days: [] }], data.user.id);
        // }
      }

      router.push('/');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs p-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Username
          </Label>
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
              autoComplete="current-password"
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
        </div>
      </div>

      <button
        type="submit"
        className={cn(
          "h-10 w-full rounded-xl bg-flex-dark text-white hover:opacity-90 font-bold text-xs transition-all active:scale-95 border-none shadow-sm flex items-center justify-center cursor-pointer mt-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
} 
