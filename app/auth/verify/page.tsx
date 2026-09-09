'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function VerifyEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');

        if (!token || type !== 'signup') {
          setStatus('error');
          setMessage('This link is invalid or expired.');
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup',
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('success');
          setMessage('Email verified. Sign in to continue.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Could not verify this link. Try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <div className="space-y-4">
      {status === 'loading' && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-zinc-950/60 px-4 py-3.5 text-[0.9rem] text-zinc-300 sm:py-4 sm:text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          <span>Verifying...</span>
        </div>
      )}

      {status === 'success' && (
        <Alert className="border-white/10 bg-white/5 text-zinc-100">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive" className="border-leg-light/20 bg-leg-light/10 text-zinc-50">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status !== 'loading' && (
        <button
          type="button"
          onClick={handleSignIn}
          className="h-10 w-full rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm transition-all active:scale-[0.98] border-none cursor-pointer flex items-center justify-center"
        >
          Sign in
        </button>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <AuthLayout
      title="Verify email"
      subtitle="Confirming your link."
      footerText=""
      footerLink=""
      footerLinkText=""
    >
      <Suspense fallback={<div className="flex items-center justify-center space-x-2"><Loader2 className="h-4 w-4 animate-spin" /><span>Verifying...</span></div>}>
        <VerifyEmailHandler />
      </Suspense>
    </AuthLayout>
  );
} 
