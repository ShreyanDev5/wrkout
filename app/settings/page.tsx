'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Settings2 } from 'lucide-react';
import { CollapsibleHeaderLayout } from '@/components/layouts/collapsible-header-layout';

export default function SettingsPage() {
  const { user, signOut, username } = useAuth();
  const router = useRouter();

  useEffect(() => {
  }, [user]);

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const displayUsername = username || (user?.email ? user.email.replace(/@wrkout\.app$/, '') : '');

  const header = (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EA4335] shadow-sm">
        <Settings2 className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Customize your workout experience</p>
      </div>
    </div>
  );

  return (
    <CollapsibleHeaderLayout
      header={header}
      initialHeaderHeight={100}
      collapseThreshold={50}
    >
      <div className="space-y-6">
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
                      <p className="text-sm font-medium">{displayUsername || user.email}</p>
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
    </CollapsibleHeaderLayout>
  );
} 