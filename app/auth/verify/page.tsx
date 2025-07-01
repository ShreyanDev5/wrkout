'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function VerifyPage() {
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
          setMessage('Invalid verification link');
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
          setMessage('Email verified successfully! You can now sign in.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <AuthLayout
      title="Email Verification"
      subtitle="Verifying your email address"
      footerText=""
      footerLink=""
      footerLinkText=""
    >
      <div className="space-y-4">
        {status === 'loading' && (
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Verifying your email...</span>
          </div>
        )}

        {status === 'success' && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status === 'error' && (
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {status !== 'loading' && (
          <Button onClick={handleSignIn} className="w-full">
            Go to Sign In
          </Button>
        )}
      </div>
    </AuthLayout>
  );
} 