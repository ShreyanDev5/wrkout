"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from '@/components/auth/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) setError(error.message);
    else setMessage("Check your email for a password reset link.");
    setLoading(false);
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footerText="Remembered your password?"
      footerLink="/auth/signin"
      footerLinkText="Back to sign in"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <Alert variant="default" className="animate-in slide-in-from-top-2 duration-300">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
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
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full rounded-lg border border-border/50 bg-background/50 pl-8 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all duration-200 placeholder:text-muted-foreground/50"
              disabled={loading}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-black font-semibold shadow-lg shadow-yellow-400/20 transition-all duration-200 hover:shadow-xl hover:shadow-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed h-11"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </AuthLayout>
  );
} 