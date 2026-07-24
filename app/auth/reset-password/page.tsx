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

          <button
            onClick={() => router.push('/auth/signin')}
            className="h-10 w-full rounded-xl bg-flex-dark text-white hover:opacity-90 font-bold text-xs shadow-sm transition-all active:scale-95 border-none cursor-pointer"
          >
            Sign in
          </button>
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
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-xs p-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
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
                  "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all",
                  password ? "pl-3" : "pl-9"
                )}
                disabled={loading}
              />
              <div className={cn(
                "absolute left-0 top-0 h-full flex items-center pointer-events-none",
                "transition-all duration-200",
                password && "opacity-0 -translate-x-2"
              )}>
                <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-flex-dark transition-colors duration-200" />
              </div>
            </div>
            <div className="mt-2 grid gap-1">
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
            <Label htmlFor="confirm" className="text-xs font-bold uppercase tracking-wider text-zinc-400">
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
                  "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition-all",
                  confirm ? "pl-3" : "pl-9",
                  password !== confirm && confirm && "border-rose-500/40"
                )}
                disabled={loading}
              />
              <div className={cn(
                "absolute left-0 top-0 h-full flex items-center pointer-events-none",
                "transition-all duration-200",
                confirm && "opacity-0 -translate-x-2"
              )}>
                <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-flex-dark transition-colors duration-200" />
              </div>
            </div>
            {password !== confirm && confirm && (
              <p className="text-xs text-rose-400 mt-1">
                Passwords do not match.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="h-10 w-full rounded-xl bg-flex-dark text-white hover:opacity-90 font-bold text-xs shadow-sm transition-all active:scale-95 border-none cursor-pointer flex items-center justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating password...
            </>
          ) : (
            'Reset password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
