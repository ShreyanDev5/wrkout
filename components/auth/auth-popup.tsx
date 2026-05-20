'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export function AuthPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Show popup after a short delay if not signed in
    if (!user) {
      // Prefetch auth pages for faster navigation
      router.prefetch('/auth/signin');
      router.prefetch('/auth/signup');
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  // Prevent closing the dialog by any means except sign in or sign up
  const handleOpenChange = (open: boolean) => {
    // Only allow closing if user is authenticated
    if (user) setIsOpen(open);
    else setIsOpen(true); // Force open if not authenticated
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  // Always render the dialog, but control its visibility with the open prop
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        className="w-[92%] max-w-[340px] rounded-2xl border border-white/10 bg-zinc-950/95 p-[18px] sm:p-5"
        onInteractOutside={e => e.preventDefault()} // Prevent click outside
        onEscapeKeyDown={e => e.preventDefault()} // Prevent Escape key
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(193,154,30,0.06),transparent_30%),radial-gradient(circle_at_20%_18%,rgba(91,144,95,0.05),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(160,80,80,0.05),transparent_24%)]" />
        <DialogHeader className="items-center">
          <DialogTitle className="text-lg font-semibold text-zinc-100 sm:text-xl">
            Sign in to wrkout
          </DialogTitle>
          <DialogDescription className="mt-1 text-center text-[0.88rem] leading-6 text-zinc-500 sm:text-sm">
            Stay in sync.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-2.5 sm:gap-3">
          <Button
            onClick={handleSignIn}
            className="h-[42px] w-full rounded-md bg-push-dark text-zinc-950 hover:bg-[#4d3f0a] sm:h-11"
          >
            Sign in
          </Button>
          <Button
            onClick={handleSignUp}
            variant="outline"
            className="h-[42px] w-full rounded-md border-white/10 bg-zinc-900/40 text-zinc-100 hover:bg-white/5 hover:text-zinc-50 sm:h-11"
          >
            Create account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
