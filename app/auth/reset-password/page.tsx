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
        setError("This link is invalid or expired. Request a new one.");
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
        subtitle="Your password has been changed."
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <div className="space-y-6 text-center">
          <div className="space-y-3.5 sm:space-y-4">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-sm">
              <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-bold tracking-tight text-white">All set</h2>
              <p className="text-xs text-zinc-400">
                Redirecting to sign in...
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/auth/signin')}
            className="h-10 w-full rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98] border-none cursor-pointer flex items-center justify-center"
          >
            Sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="New password"
      subtitle="Choose your new password."
      footerText="Remember your password?"
      footerLink="/auth/signin"
      footerLinkText="Sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive" className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs p-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold text-zinc-300">
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
                placeholder="••••••••"
                className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 transition-all"
                disabled={loading}
              />
              <div className="absolute left-0 top-0 h-full flex items-center pointer-events-none">
                <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200" />
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
            <Label htmlFor="confirm" className="text-xs font-semibold text-zinc-300">
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
                placeholder="••••••••"
                className={cn(
                  "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 transition-all",
                  password !== confirm && confirm && "border-red-500/40"
                )}
                disabled={loading}
              />
              <div className="absolute left-0 top-0 h-full flex items-center pointer-events-none">
                <Lock className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200" />
              </div>
            </div>
            {password !== confirm && confirm && (
              <p className="text-xs text-red-400 mt-1">
                Passwords do not match.
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="h-10 w-full rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98] border-none cursor-pointer flex items-center justify-center mt-3 disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-950" />
              Updating password...
            </>
          ) : (
            'Update password'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
