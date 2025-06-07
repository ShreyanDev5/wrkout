'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Settings page mounted, user:', user);
  }, [user]);

  const handleSignIn = () => {
    console.log('Sign in clicked');
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    console.log('Sign up clicked');
    router.push('/auth/signup');
  };

  const handleSignOut = async () => {
    console.log('Sign out clicked');
    await signOut();
  };

  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-red-400 bg-clip-text text-transparent mb-6">
        Settings
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* User Info Section */}
            {user && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-r from-yellow-400 to-green-400 text-black">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">Signed in</p>
                  </div>
                </div>
                <Separator />
              </div>
            )}

            {/* Auth Buttons */}
            <div className="space-y-4">
              {user ? (
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="w-full border-2 hover:bg-accent"
                >
                  Sign Out
                </Button>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 