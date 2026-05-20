'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-[18px] sm:space-y-5">
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 border-leg-light/20 bg-leg-light/10 text-zinc-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3.5 sm:space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium text-zinc-200">
            Username
          </Label>
          <div className="relative w-full">
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={cn(
                "h-[42px] w-full rounded-md border-white/10 bg-zinc-950/60 pl-9 text-zinc-100 shadow-none sm:h-11",
                "placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-push-light/25",
                "transition-all duration-200",
                username && "pl-3"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              username && "opacity-0 -translate-x-2"
            )}>
              <Mail className="h-4 w-4 ml-3 text-zinc-500" />
            </div>
          </div>
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
              autoComplete="current-password"
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
        </div>
      </div>

      <Button
        type="submit"
        className={cn(
          "h-[42px] w-full rounded-md bg-push-dark text-zinc-950 hover:bg-[#4d3f0a] sm:h-11",
          "font-medium transition-colors duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
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
      </Button>
    </form>
  );
} 
