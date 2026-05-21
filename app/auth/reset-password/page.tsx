"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePassword } from '@/lib/auth/auth-utils';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasResetSession, setHasResetSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (!session) {
        setError("This reset link is invalid or expired. Request a new one.");
      } else {
        setHasResetSession(true);
      }

      setCheckingSession(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setError("");
        setHasResetSession(true);
        setCheckingSession(false);
      }
    });

    checkSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Validate passwords match
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      sessionStorage.setItem('intentional_logout', 'true');
      await supabase.auth.signOut();
      setSuccess(true);
      setMessage("Your password has been updated.");
      setTimeout(() => router.push("/auth/signin"), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout
        title="Password updated"
        subtitle="You can sign in with your new password."
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <div className="space-y-6">
          <div className="text-center space-y-3.5 sm:space-y-4">
            <div className="mx-auto flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-white/10 bg-white/5 text-pull-light sm:h-11 sm:w-11">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <h2 className="text-[1.05rem] font-semibold text-foreground sm:text-lg">All set</h2>
              <p className="text-[0.9rem] text-zinc-500 sm:text-sm">
                {message} Redirecting to sign in.
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/auth/signin')}
            className={cn(
              "h-[42px] w-full rounded-md bg-push-dark text-zinc-950 hover:bg-[#4d3f0a] sm:h-11",
              "font-medium transition-colors duration-200"
            )}
          >
            Sign in
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
      <AuthLayout
        title="Create a new password"
      subtitle="Choose a strong password."
      footerText="Need to return?"
      footerLink="/auth/signin"
      footerLinkText="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300 border-leg-light/20 bg-leg-light/10 text-zinc-50">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3.5 sm:space-y-4">
          <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-200">
              New password
            </Label>
            <div className="relative w-full group">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={cn(
                    "h-[42px] w-full rounded-md border-white/10 bg-zinc-950/60 pl-9 text-zinc-100 shadow-none sm:h-11",
                  "placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-push-light/25",
                  "transition-all duration-200",
                  password && "pl-3"
                )}
                disabled={loading}
              />
              <div className={cn(
                "absolute left-0 top-0 h-full flex items-center pointer-events-none",
                "transition-all duration-200",
                password && "opacity-0 -translate-x-2"
              )}>
                  <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-push-light transition-colors duration-200" />
              </div>
            </div>
            <div className="mt-3 grid gap-1.5">
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
                      "mr-2 h-3.5 w-3.5 transition-colors duration-250",
                      req.met ? "text-pull-light" : "text-zinc-650"
                    )}
                  />
                  {req.label}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
              <Label htmlFor="confirm" className="text-sm font-medium text-zinc-200">
              Confirm new password
            </Label>
            <div className="relative w-full group">
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className={cn(
                  "h-[42px] w-full rounded-md border-white/10 bg-zinc-950/60 pl-9 text-zinc-100 shadow-none sm:h-11",
                  "transition-all duration-200",
                  "placeholder:text-zinc-500",
                  confirm && "pl-3",
                  password !== confirm && confirm
                      ? "border-leg-light/40 focus-visible:border-leg-light/40 focus-visible:ring-1 focus-visible:ring-leg-light/20"
                      : "focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-leg-light/20"
                )}
                disabled={loading}
              />
              <div className={cn(
                "absolute left-0 top-0 h-full flex items-center pointer-events-none",
                "transition-all duration-200",
                confirm && "opacity-0 -translate-x-2"
              )}>
                <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-push-light transition-colors duration-200" />
              </div>
            </div>
            {password !== confirm && confirm && (
              <p className="text-sm text-leg-light mt-1">
                Passwords do not match.
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className={cn(
            "h-[42px] w-full rounded-md bg-push-dark text-zinc-950 hover:bg-[#4d3f0a] sm:h-11",
            "font-semibold transition-all duration-200 active:scale-[0.98]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100",
            "shadow-[0_4px_16px_rgba(249,217,73,0.08)] hover:shadow-[0_4px_16px_rgba(249,217,73,0.18)]"
          )}
          disabled={loading || checkingSession || !hasResetSession}
        >
          {loading || checkingSession ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {checkingSession ? 'Checking link...' : 'Updating...'}
            </>
          ) : (
            'Set password'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
