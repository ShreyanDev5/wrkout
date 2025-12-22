"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

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
      setError("Passwords do not match");
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
      setSuccess(true);
      setMessage("Password updated successfully!");
      setTimeout(() => router.push("/auth/signin"), 2000);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <AuthLayout
        title="Password Updated"
        subtitle="Your password has been successfully reset"
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <div className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Success!</h2>
              <p className="text-sm text-muted-foreground">
                {message} Redirecting to sign in...
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push('/auth/signin')}
            className={cn(
              "w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500",
              "text-black font-semibold shadow-lg shadow-yellow-400/20",
              "transition-all duration-200 hover:shadow-xl hover:shadow-yellow-400/30",
              "h-11"
            )}
          >
            Go to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
      footerText="Remembered your password?"
      footerLink="/auth/signin"
      footerLinkText="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              New Password
            </Label>
            <div className="relative w-full">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className={cn(
                  "w-full rounded-lg border border-border/50 bg-background/50 pl-8",
                  "focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50",
                  "transition-all duration-200",
                  "placeholder:text-muted-foreground/50",
                  password && "pl-3"
                )}
                disabled={loading}
              />
              <div className={cn(
                "absolute left-0 top-0 h-full flex items-center",
                "transition-all duration-200",
                password && "opacity-0 -translate-x-2"
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
            <Label htmlFor="confirm" className="text-sm font-medium">
              Confirm New Password
            </Label>
            <div className="relative w-full">
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                className={cn(
                  "w-full rounded-lg border bg-background/50 pl-8",
                  "transition-all duration-200",
                  "placeholder:text-muted-foreground/50",
                  confirm && "pl-3",
                  password !== confirm && confirm
                    ? "border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-1 focus-visible:ring-red-500/50"
                    : "border-border/50 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50"
                )}
                disabled={loading}
              />
              <div className={cn(
                "absolute left-0 top-0 h-full flex items-center",
                "transition-all duration-200",
                confirm && "opacity-0 -translate-x-2"
              )}>
                <Lock className="h-4 w-4 ml-3 text-muted-foreground/60" />
              </div>
            </div>
            {password !== confirm && confirm && (
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
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating password...
            </>
          ) : (
            'Set New Password'
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}