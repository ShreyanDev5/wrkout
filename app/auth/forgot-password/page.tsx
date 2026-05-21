"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { AuthLayout } from '@/components/auth/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
        setError("Enter a valid email address.");
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
        setError(result.error || "We could not send the code.");
        setDebugInfo(`API error: ${response.status} - ${JSON.stringify(result)}`);
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
        setError("Please enter a valid 6-digit code.");
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
        setError(resetResult.error || "We could not send the reset link.");
        setDebugInfo(`API error: ${resetResponse.status} - ${JSON.stringify(resetResult)}`);
      } else {
        setStep('success');
        setMessage("Your reset link is on the way. Check your inbox and spam folder.");
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
        title="Check your inbox"
        subtitle="We've sent a recovery link to your email."
        footerText=""
        footerLink=""
        footerLinkText=""
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-pull-light/20 bg-pull-light/10 text-pull-light animate-pulse">
            <CheckCircle2 className="h-6 w-6" strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-zinc-100">Reset Link Sent</h3>
            <p className="text-[0.92rem] text-zinc-400 leading-relaxed max-w-xs mx-auto">
              We&apos;ve sent a password recovery link to <span className="text-zinc-200 font-medium">{recoveryEmail}</span>. Please check your inbox and spam folders.
            </p>
          </div>

          {resetUrl && (
            <div className="rounded-xl border border-white/5 bg-zinc-950/40 p-4 space-y-2 text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Development Mode</p>
              <Button
                onClick={() => window.location.href = resetUrl}
                variant="outline"
                className="h-9 w-full rounded-lg border-white/10 bg-zinc-900/60 text-xs font-medium text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                Bypass Email & Continue
              </Button>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Button
              onClick={() => window.location.href = '/auth/signin'}
              className="h-11 w-full rounded-xl bg-push-dark text-zinc-950 hover:bg-[#4d3f0a] font-bold text-sm shadow-[0_4px_16px_rgba(234,179,8,0.15)] transition-all active:scale-95"
            >
              Back to sign in
            </Button>
            <Button
              onClick={resetForm}
              variant="ghost"
              className="h-10 w-full rounded-xl text-xs font-semibold text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            >
              Start over
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={step === 'username'
        ? "Enter your username to begin."
        : step === 'email'
        ? "Enter the email address for the code."
        : "Enter the verification code we sent."
      }
      footerText="Need to return?"
      footerLink="/auth/signin"
      footerLinkText="Back to sign in"
    >
      <form onSubmit={
        step === 'username' ? handleUsernameSubmit :
        step === 'email' ? handleEmailSubmit :
        handleVerifyCodeSubmit
      } className="space-y-5">
        {message && (
          <Alert className="border-white/10 bg-white/5 text-zinc-100">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <Alert className="border-white/10 bg-zinc-950/60">
            <AlertDescription className="text-xs font-mono text-zinc-500">
              {debugInfo}
            </AlertDescription>
          </Alert>
        )}

        {step === 'username' ? (
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-zinc-200">
              Username
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-[42px] rounded-md border-white/10 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-push-light/25 sm:h-11"
              disabled={loading}
            />
          </div>
        ) : step === 'email' ? (
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              value={recoveryEmail}
              onChange={e => setRecoveryEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-[42px] rounded-md border-white/10 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-pull-light/25 sm:h-11"
              disabled={loading}
            />
            <p className="text-xs leading-5 text-zinc-500">
              We will send a one-time code to confirm access.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-zinc-200">
              Code
            </Label>
            <Input
              id="code"
              type="text"
              value={verificationCode}
              onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              placeholder="000000"
              maxLength={6}
              className="h-[42px] rounded-md border-white/10 bg-zinc-950/60 text-zinc-100 placeholder:text-zinc-500 focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-pull-light/25 sm:h-11 text-center tracking-widest"
              disabled={loading}
            />
            <p className="text-xs leading-5 text-zinc-500">
              Enter the 6-digit code sent to <span className="text-zinc-300">{recoveryEmail}</span>.
            </p>
          </div>
        )}

        <Button
          type="submit"
          className="h-[42px] w-full rounded-md bg-push-dark text-zinc-950 hover:bg-[#4d3f0a] sm:h-11"
          disabled={loading}
        >
          {loading ? "Please wait..." : (
            step === 'username' ? "Continue" :
            step === 'email' ? "Send code" :
            "Verify code"
          )}
        </Button>

        {step === 'email' && (
          <Button
            type="button"
            onClick={resetForm}
            variant="ghost"
            className="h-10 w-full rounded-md text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
          >
            Change username
          </Button>
        )}

        {step === 'verify-code' && (
          <Button
            type="button"
            onClick={() => setStep('email')}
            variant="ghost"
            className="h-10 w-full rounded-md text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
          >
            Change email
          </Button>
        )}
      </form>
    </AuthLayout>
  );
}
