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
      subtitle="Continue where you left off."
      footerText="Need an account?"
      footerLink="/auth/signup"
      footerLinkText="Create account"
    >
      <Suspense fallback={null}>
        <SignInMessage />
      </Suspense>
      <SignInForm />
      <div className="mt-4 text-center">
        <a href="/auth/forgot-password" className="text-sm text-zinc-500 underline-offset-4 transition-colors duration-200 hover:text-zinc-200 hover:underline">Forgot password?</a>
      </div>
    </AuthLayout>
  );
} 
