'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignInForm } from '@/components/auth/sign-in-form';
import { Alert, AlertDescription } from '@/components/ui/alert';

import Link from 'next/link';

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
      subtitle="Sign in to continue."
      footerText="Don't have an account?"
      footerLink="/auth/signup"
      footerLinkText="Sign up"
    >
      <Suspense fallback={null}>
        <SignInMessage />
      </Suspense>
      <SignInForm />
      <div className="mt-3.5 text-center">
        <Link
          href="/auth/forgot-password"
          className="text-xs text-zinc-400 hover:text-zinc-200 underline-offset-4 transition-colors hover:underline cursor-pointer"
        >
          Forgot password?
        </Link>
      </div>
    </AuthLayout>
  );
} 
