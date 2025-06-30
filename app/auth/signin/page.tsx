'use client';

import { useSearchParams } from 'next/navigation';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignInForm } from '@/components/auth/sign-in-form';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your account to continue tracking your workouts"
      footerText="Don't have an account?"
      footerLink="/auth/signup"
      footerLinkText="Create an account"
    >
      {message && (
        <Alert className="mb-6">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      <SignInForm />
      <div className="mt-4 text-center">
        <a href="/auth/forgot-password" className="text-sm text-primary underline hover:text-primary/80">Forgot password?</a>
      </div>
    </AuthLayout>
  );
} 