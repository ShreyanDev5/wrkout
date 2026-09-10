'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LogIn } from 'lucide-react';
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
        centerMobile={true}
        className="w-[90%] max-w-[320px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6 shadow-[0_24px_64px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none mx-auto flex flex-col items-center text-center relative"
        onInteractOutside={e => e.preventDefault()} // Prevent click outside
        onEscapeKeyDown={e => e.preventDefault()} // Prevent Escape key
      >
        <DialogHeader className="w-full flex flex-col items-center space-y-0 text-center">
          <div className="mx-auto mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 shadow-sm">
            <LogIn className="h-5 w-5 text-zinc-300" strokeWidth={2} aria-hidden="true" />
          </div>
          <DialogTitle className="text-base font-bold tracking-tight text-white text-center w-full">
            Sign in to wrkout
          </DialogTitle>
          <DialogDescription className="text-xs text-zinc-400 text-center w-full mt-1.5 leading-relaxed">
            Stay in sync across all your devices.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col gap-2.5 w-full">
          <button
            type="button"
            onClick={handleSignIn}
            className="w-full h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-all active:scale-[0.98] shadow-sm border-none cursor-pointer flex items-center justify-center"
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            className="w-full h-10 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all active:scale-[0.98] shadow-none cursor-pointer flex items-center justify-center"
          >
            Create account
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 
