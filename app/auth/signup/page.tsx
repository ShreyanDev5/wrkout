'use client';

import { AuthLayout } from '@/components/auth/auth-layout';
import { SignUpForm } from '@/components/auth/sign-up-form';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create account"
      subtitle="Keep your training organized in one place."
      footerText="Already have an account?"
      footerLink="/auth/signin"
      footerLinkText="Sign in"
    >
      <SignUpForm />
      <div className="mt-4 text-center">
        <a href="/privacy" className="text-xs text-zinc-500 underline-offset-4 transition-colors duration-200 hover:text-zinc-300 hover:underline">Privacy policy</a>
      </div>
    </AuthLayout>
  );
} 
