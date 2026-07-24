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
        className="w-[92%] max-w-[330px] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150 outline-none select-none mx-auto flex flex-col items-center text-center relative"
        onInteractOutside={e => e.preventDefault()} // Prevent click outside
        onEscapeKeyDown={e => e.preventDefault()} // Prevent Escape key
      >
        <DialogHeader className="items-center w-full">
          <DialogTitle className="text-base font-extrabold text-white text-center tracking-tight">
            Sign in to wrkout
          </DialogTitle>
          <DialogDescription className="mt-1 text-center text-xs leading-relaxed text-zinc-400">
            Stay in sync across all your devices.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={handleSignIn}
            className="h-10 w-full rounded-xl bg-flex-dark text-white font-bold hover:opacity-90 transition-all active:scale-95 text-xs shadow-sm border-none"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-200 font-semibold hover:bg-zinc-800 hover:text-white transition-all active:scale-95 text-xs shadow-none"
          >
            Create account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
