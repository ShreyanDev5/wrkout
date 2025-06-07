'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SignInForm() {
  const [email, setEmail] = useState('');
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
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email address
          </Label>
          <div className="relative w-full">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={cn(
                "w-full rounded-lg border border-border/50 bg-background/50 pl-8",
                "focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/50",
                email && "pl-3" // Standard padding when icon is hidden
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              email && "opacity-0 -translate-x-2" // Hide and slide left when there's input
            )}>
              <Mail className="h-4 w-4 ml-3 text-muted-foreground/60" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative w-full">
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={cn(
                "w-full rounded-lg border border-border/50 bg-background/50 pl-8",
                "focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/50",
                password && "pl-3" // Standard padding when icon is hidden
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              password && "opacity-0 -translate-x-2" // Hide and slide left when there's input
            )}>
              <Lock className="h-4 w-4 ml-3 text-muted-foreground/60" />
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className={cn(
          "w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500",
          "text-black font-semibold shadow-lg shadow-yellow-400/20",
          "transition-all duration-200 hover:shadow-xl hover:shadow-yellow-400/30",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "h-11"
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