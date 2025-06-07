'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

export function AuthPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('AuthPopup mounted, user:', user);
    // Show popup after a short delay if not signed in
    if (!user) {
      const timer = setTimeout(() => {
        console.log('Setting popup to open');
        setIsOpen(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    console.log('Closing popup');
    setIsOpen(false);
    try {
      localStorage.setItem('hasSeenAuthPopup', 'true');
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  };

  const handleSignIn = () => {
    handleClose();
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    handleClose();
    router.push('/auth/signup');
  };

  // Always render the dialog, but control its visibility with the open prop
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      console.log('Dialog open state changing to:', open);
      setIsOpen(open);
    }}>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-red-500 bg-clip-text text-transparent">
            Welcome to wrkout
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mt-2">
            Sign in to sync your workouts across devices and track your progress over time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={handleSignIn}
            className="w-full bg-gradient-to-r from-yellow-400 to-green-400 hover:from-yellow-500 hover:to-green-500 text-black font-semibold"
          >
            Sign In
          </Button>
          <Button
            onClick={handleSignUp}
            variant="outline"
            className="w-full border-2 hover:bg-accent"
          >
            Create Account
          </Button>
          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 