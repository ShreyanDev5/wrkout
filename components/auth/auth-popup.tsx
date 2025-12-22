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
        className="w-[92%] max-w-[320px] md:max-w-[400px] bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 rounded-xl p-4 shadow-lg"
        onInteractOutside={e => e.preventDefault()} // Prevent click outside
        onEscapeKeyDown={e => e.preventDefault()} // Prevent Escape key
      >
        <DialogHeader className="items-center">
          <DialogTitle className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-red-500 bg-clip-text text-transparent">
            Welcome to wrkout
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base text-muted-foreground mt-1.5 text-center">
            Sign in to sync your workouts across devices and track your progress over time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-black font-semibold py-2 rounded-md"
          >
            Sign In
          </Button>
          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full border border-zinc-700/50 hover:bg-zinc-800/50 hover:border-zinc-600/50 text-foreground py-2 rounded-md transition-all duration-200"
          >
            Create Account
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 