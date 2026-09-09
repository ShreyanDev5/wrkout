import Link from 'next/link';
import { AuthLayout } from '@/components/auth/auth-layout';
import { SignUpForm } from '@/components/auth/sign-up-form';

export default function SignUpPage() {
  return (
    <AuthLayout
      title="Create account"
      subtitle="Sign up to start tracking."
      footerText="Already have an account?"
      footerLink="/auth/signin"
      footerLinkText="Sign in"
    >
      <SignUpForm />
      <div className="mt-3.5 text-center">
        <Link
          href="/privacy"
          className="text-xs text-zinc-400 hover:text-zinc-200 underline-offset-4 transition-colors hover:underline cursor-pointer"
        >
          Privacy policy
        </Link>
      </div>
    </AuthLayout>
  );
} 
