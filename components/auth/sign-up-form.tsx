'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SignUpForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signUp, signIn } = useAuth();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate username
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
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
      // Use username to construct a pseudo-email
      const pseudoEmail = `${username}@wrkout.app`;
      const { error } = await signUp(pseudoEmail, password);
      if (error) {
        setError(error.message);
        return;
      }
      const { error: signInError } = await signIn(pseudoEmail, password);
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push('/');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={cn(
              "w-full rounded-lg border border-border/50 bg-background/50 pl-8",
              "focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50",
              "transition-all duration-200",
              "placeholder:text-muted-foreground/50",
              username && "pl-3" // Standard padding when icon is hidden
            )}
            disabled={isLoading}
          />
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
          <div className="mt-2 space-y-1.5">
            {passwordRequirements.map((req, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center text-sm transition-colors duration-200",
                  req.met ? "text-green-500" : "text-muted-foreground/60"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "mr-2 h-4 w-4",
                    req.met ? "text-green-500" : "text-muted-foreground/60"
                  )}
                />
                {req.label}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative w-full">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={cn(
                "w-full rounded-lg border bg-background/50 pl-8",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/50",
                confirmPassword && "pl-3", // Standard padding when icon is hidden
                password !== confirmPassword && confirmPassword
                  ? "border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-1 focus-visible:ring-red-500/50"
                  : "border-border/50 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50"
              )}
              disabled={isLoading}
            />
            <div className={cn(
              "absolute left-0 top-0 h-full flex items-center",
              "transition-all duration-200",
              confirmPassword && "opacity-0 -translate-x-2" // Hide and slide left when there's input
            )}>
              <Lock className="h-4 w-4 ml-3 text-muted-foreground/60" />
            </div>
          </div>
          {password !== confirmPassword && confirmPassword && (
            <p className="text-sm text-red-500 mt-1">
              Passwords do not match
            </p>
          )}
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
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
} 