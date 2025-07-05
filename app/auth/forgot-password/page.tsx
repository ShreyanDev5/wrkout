"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from '@/components/auth/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'username' | 'email' | 'success'>('username');
  const [username, setUsername] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setDebugInfo("");
    setLoading(true);

    try {
      console.log("🔍 Looking up user by username:", username);
      
      // Validate username format
      if (!username || username.length < 3) {
        setError("Username must be at least 3 characters long");
        setLoading(false);
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError("Username can only contain letters, numbers, and underscores");
        setLoading(false);
        return;
      }

      // Check if user exists by trying to sign in with the pseudo-email
      const pseudoEmail = `${username}@wrkout.app`;
      console.log("🔍 Checking if user exists:", pseudoEmail);

      // Check if user exists by attempting to sign in (we'll catch the error if user doesn't exist)
      // This is a workaround since we can't use admin APIs from the client
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: pseudoEmail,
        password: 'dummy-password-to-check-existence'
      });
      
      // If we get "Invalid login credentials", the user exists but password is wrong
      // If we get "User not found", the user doesn't exist
      if (signInError && signInError.message.includes('User not found')) {
        console.log("❌ User not found:", signInError);
        setError("No account found with this username. Please check your username or create a new account.");
        setLoading(false);
        return;
      }
      
      // If we get "Invalid login credentials", the user exists (which is what we want)
      if (signInError && signInError.message.includes('Invalid login credentials')) {
        console.log("✅ User exists (invalid credentials expected)");
        setStep('email');
        setMessage("Username found! Please provide an email address where we can send your password reset link.");
      } else {
        // If we get here, something unexpected happened
        console.log("❌ Unexpected error checking user existence:", signInError);
        setError("An error occurred while checking your username. Please try again.");
      }
      
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
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
      console.log("📧 Processing password reset for username:", username, "with email:", recoveryEmail);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recoveryEmail)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Call our custom API route
      console.log("📡 Making API call to /api/auth/reset-password");
      console.log("📤 Request payload:", { username, recoveryEmail });
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          recoveryEmail,
        }),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log("📥 Response body:", result);

      if (!response.ok) {
        console.error("❌ API error:", result);
        setError(result.error || "Failed to send password reset email");
        setDebugInfo(`API error: ${response.status} - ${JSON.stringify(result)}`);
      } else {
        console.log("✅ Password reset email sent successfully");
        setStep('success');
        setMessage("Password reset link sent! Check your email for the reset link.");
        setDebugInfo("Email sent successfully via API");
      }
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      setError("An unexpected error occurred. Please try again.");
      setDebugInfo(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('username');
    setUsername("");
    setRecoveryEmail("");
    setMessage("");
    setError("");
    setDebugInfo("");
  };

  if (step === 'success') {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent you a password reset link"
        footerText="Remembered your password?"
        footerLink="/auth/signin"
        footerLinkText="Back to sign in"
      >
        <div className="w-full space-y-4">
          {/* Compact Success Header */}
          <div className="text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Reset Link Sent!</h2>
              <p className="text-sm text-muted-foreground">
                Check your email for the password reset link.
              </p>
            </div>
          </div>

          {/* Compact Important Notice */}
          <Card className="border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm font-semibold text-amber-800">
                    Check your email inbox and spam folder
                  </h3>
                  <div className="bg-amber-100 rounded-md p-2 border border-amber-200">
                    <p className="text-xs font-medium text-amber-800">
                      ⏰ Link expires in <strong>24 hours</strong>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compact User Details */}
          <div className="bg-background/30 rounded-lg p-3 border border-border/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Username:</span>
              <span className="font-medium text-foreground">{username}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium text-foreground">{recoveryEmail}</span>
            </div>
          </div>

          {/* Compact Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={() => window.location.href = '/auth/signin'}
              className="w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-black font-semibold shadow-md transition-all duration-200 hover:shadow-lg h-10 text-sm"
            >
              Back to Sign In
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
              className="w-full h-10 text-sm border hover:bg-accent"
            >
              Try Again
            </Button>
          </div>

          {/* Compact Help Text */}
          <p className="text-xs text-muted-foreground text-center">
            Didn't receive the email? Check spam folder or try again.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle={step === 'username' 
        ? "Enter your username and we'll help you reset your password"
        : "Enter an email address where we can send your reset link"
      }
      footerText="Remembered your password?"
      footerLink="/auth/signin"
      footerLinkText="Back to sign in"
    >
      <form onSubmit={step === 'username' ? handleUsernameSubmit : handleEmailSubmit} className="space-y-6">
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
        {debugInfo && process.env.NODE_ENV === 'development' && (
          <Alert variant="default" className="animate-in slide-in-from-top-2 duration-300 border-blue-200 bg-blue-50">
            <AlertDescription className="text-xs font-mono">
              Debug: {debugInfo}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          {step === 'username' ? (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                className="w-full rounded-lg border border-border/50 bg-background/50 pl-8 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all duration-200 placeholder:text-muted-foreground/50"
                disabled={loading}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Recovery Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-border/50 bg-background/50 pl-8 focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/50 transition-all duration-200 placeholder:text-muted-foreground/50"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                We'll send the password reset link to this email address.
              </p>
            </div>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-black font-semibold shadow-lg shadow-yellow-400/20 transition-all duration-200 hover:shadow-xl hover:shadow-yellow-400/30 disabled:opacity-50 disabled:cursor-not-allowed h-11"
          disabled={loading}
        >
          {loading ? "Processing..." : (step === 'username' ? "Continue" : "Send Reset Link")}
        </Button>
        
        {step === 'email' && (
          <Button
            type="button"
            onClick={resetForm}
            variant="outline"
            className="w-full"
          >
            Back to Username
          </Button>
        )}
        
        {/* Additional help text */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Check your spam/junk folder if you don't receive the email</p>
          <p>• The reset link will expire in 24 hours</p>
          <p>• Make sure you're using the same username you signed up with</p>
        </div>
      </form>
    </AuthLayout>
  );
} 