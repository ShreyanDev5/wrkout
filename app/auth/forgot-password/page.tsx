"use client";

import { useState } from "react";
import { CheckCircle2, User, Mail, Hash } from "lucide-react";
import { AuthLayout } from '@/components/auth/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from "@/lib/utils";
import { normalizeUsername, validateUsername } from '@/lib/auth/auth-utils';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'username' | 'email' | 'verify-code' | 'success'>('username');
  const [username, setUsername] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDebugInfo("");
    setLoading(true);

    try {
      const normalizedUsername = username.trim().toLowerCase();
      const usernameError = validateUsername(normalizedUsername);
      if (usernameError) {
        setError(usernameError);
        return;
      }

      // Verify that the username exists
      const response = await fetch('/api/auth/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: normalizedUsername }),
      });

      const result = await response.json();

      if (!response.ok || !result.exists) {
        setError("No account found with this username.");
        return;
      }

      setUsername(normalizedUsername);
      setStep('email');
      setMessage("We will send a one-time code to this email.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setDebugInfo(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDebugInfo("");
    setLoading(true);

    try {
      const normalizedEmail = recoveryEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        setError("Enter a valid email.");
        return;
      }

      const response = await fetch('/api/auth/send-recovery-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: normalizedEmail,
          username: username.trim().toLowerCase()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Could not send the code. Try again.");
        console.error(`API error: ${response.status} - ${JSON.stringify(result)}`);
      } else {
        setRecoveryEmail(normalizedEmail);
        setStep('verify-code');
        setMessage("A 6-digit code has been sent. Enter it below.");
        setDebugInfo(result.code ? `Development mode: ${result.code}` : "");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setDebugInfo(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDebugInfo("");
    setLoading(true);

    try {
      if (verificationCode.length !== 6 || !/^\d+$/.test(verificationCode)) {
        setError("Enter a 6-digit code.");
        return;
      }

      const normalizedEmail = recoveryEmail.trim().toLowerCase();
      const normalizedUsername = username.trim().toLowerCase();

      const verifyResponse = await fetch(
        `/api/auth/send-recovery-code?email=${encodeURIComponent(normalizedEmail)}&code=${verificationCode}`,
        { method: 'GET' }
      );

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setError(verifyResult.error || "Invalid or expired code.");
        return;
      }

      // Code is verified; now send the reset link, passing the verified code
      const resetResponse = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: normalizedUsername,
          recoveryEmail: normalizedEmail,
          code: verificationCode,
        }),
      });

      const resetResult = await resetResponse.json();

      if (!resetResponse.ok) {
        setError(resetResult.error || "Could not send the reset link. Try again.");
        console.error(`API error: ${resetResponse.status} - ${JSON.stringify(resetResult)}`);
      } else {
        setStep('success');
        setMessage("Reset link sent. Check your inbox or spam folder.");
        setResetUrl(resetResult.resetUrl || "");
        setDebugInfo(resetResult.resetUrl ? "Email delivery is not configured; reset link generated for development." : "Email sent successfully via API");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setDebugInfo(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('username');
    setUsername("");
    setRecoveryEmail("");
    setVerificationCode("");
    setMessage("");
    setError("");
    setDebugInfo("");
    setResetUrl("");
  };

  if (step === 'success') {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We sent a reset link to your recovery email."
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-sm">
            <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold tracking-tight text-white">Reset link sent</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
              We sent a password reset link to <span className="text-zinc-200 font-semibold">{recoveryEmail}</span>. Check your inbox or spam folder.
            </p>
          </div>

          {resetUrl && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Development Mode</p>
              <button
                type="button"
                onClick={() => window.location.href = resetUrl}
                className="h-9 w-full rounded-xl border border-zinc-700/80 bg-zinc-800/80 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              >
                Bypass Email & Continue
              </button>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={() => window.location.href = '/auth/signin'}
              className="h-10 w-full rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98] border-none cursor-pointer flex items-center justify-center"
            >
              Back to sign in
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="h-9 w-full rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
            >
              Start over
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle={step === 'username'
        ? "Enter your username."
        : step === 'email'
        ? "Enter your recovery email."
        : "Enter the 6-digit code."
      }
      footerText="Remember your password?"
      footerLink="/auth/signin"
      footerLinkText="Sign in"
    >
      <form onSubmit={
        step === 'username' ? handleUsernameSubmit :
        step === 'email' ? handleEmailSubmit :
        handleVerifyCodeSubmit
      } className="space-y-4">
        {message && (
          <Alert className="rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-200 text-xs p-3">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 text-xs p-3">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 'username' ? (
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs font-semibold text-zinc-300">
              Username
            </Label>
            <div className="relative w-full group">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Enter your username"
                className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 transition-all"
                disabled={loading}
              />
              <div className="absolute left-0 top-0 h-full flex items-center pointer-events-none">
                <User className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200" />
              </div>
            </div>
          </div>
        ) : step === 'email' ? (
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold text-zinc-300">
              Email address
            </Label>
            <div className="relative w-full group">
              <Input
                id="email"
                type="email"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-9 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 transition-all"
                disabled={loading}
              />
              <div className="absolute left-0 top-0 h-full flex items-center pointer-events-none">
                <Mail className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200" />
              </div>
            </div>
            <p className="text-[11px] font-medium text-zinc-500 mt-1">
              Used for password recovery.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-xs font-semibold text-zinc-300">
              6-Digit Code
            </Label>
            <div className="relative w-full group">
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                placeholder="000000"
                maxLength={6}
                className={cn(
                  "h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-xs text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/50 text-center tracking-widest transition-all",
                  verificationCode ? "pl-3 text-center tracking-[0.3em] font-mono font-semibold" : "pl-9"
                )}
                disabled={loading}
              />
              <div className="absolute left-0 top-0 h-full flex items-center pointer-events-none">
                <Hash className="h-4 w-4 ml-3 text-zinc-500 group-focus-within:text-zinc-300 transition-colors duration-200" />
              </div>
            </div>
            <p className="text-[11px] font-medium text-zinc-500 mt-1">
              Sent to <span className="text-zinc-300 font-semibold">{recoveryEmail}</span>.
            </p>
          </div>
        )}

        <button
          type="submit"
          className="h-10 w-full rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98] border-none cursor-pointer flex items-center justify-center mt-3 disabled:opacity-35 disabled:cursor-not-allowed disabled:pointer-events-none"
          disabled={loading}
        >
          {loading ? "Please wait..." : (
            step === 'username' ? "Continue" :
            step === 'email' ? "Send code" :
            "Verify code"
          )}
        </button>

        {step === 'email' && (
          <button
            type="button"
            onClick={resetForm}
            className="h-9 w-full rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            Change username
          </button>
        )}

        {step === 'verify-code' && (
          <button
            type="button"
            onClick={() => setStep('email')}
            className="h-9 w-full rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200 transition-all border-none bg-transparent cursor-pointer flex items-center justify-center"
          >
            Change email
          </button>
        )}
      </form>
    </AuthLayout>
  );
}
