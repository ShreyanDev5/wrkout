'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { SignUpForm } from '@/components/auth/sign-up-form';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your progressive overload journey"
      footerText="Already have an account?"
      footerLink="/auth/signin"
      footerLinkText="Sign in"
    >
      <SignUpForm />
      <div className="mt-4 text-center">
        <a href="/privacy" className="text-xs text-muted-foreground underline hover:text-primary/80">Privacy Policy</a>
      </div>
    </AuthLayout>
  );
} 