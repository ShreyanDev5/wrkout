'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignInForm } from '@/components/auth/sign-in-form';
import { Alert, AlertDescription } from '@/components/ui/alert';

function SignInMessage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  if (!message) return null;
  return (
    <Alert className="mb-6">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export default function SignInPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue tracking your workouts"
      footerText="Don't have an account?"
      footerLink="/auth/signup"
      footerLinkText="Create an account"
    >
      <Suspense fallback={null}>
        <SignInMessage />
      </Suspense>
      <SignInForm />
      <div className="mt-4 text-center">
        <a href="/auth/forgot-password" className="text-sm text-primary underline hover:text-primary/80">Forgot password?</a>
      </div>
    </AuthLayout>
  );
} 