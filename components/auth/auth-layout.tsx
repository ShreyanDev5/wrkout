'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WorkoutProgressIcon } from '@/components/workout-progress-icon';
import { useIsMobile } from '@/hooks/use-mobile';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink,
  footerLinkText,
}: AuthLayoutProps) {
  const { isMobile } = useIsMobile();

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/90 relative overflow-hidden",
      isMobile && "py-6" // Slightly reduced padding to accommodate larger elements
    )}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/5 rounded-full blur-3xl" />
      </div>

      <div className={cn(
        "relative z-10 w-full max-w-md px-4 sm:px-6 lg:px-8",
        isMobile && "mt-6 mb-10" // Adjusted margins for better spacing with larger elements
      )}>
        <div className={cn(
          "space-y-8",
          isMobile && "space-y-7" // Slightly increased spacing between elements
        )}>
          {/* Logo and Title Section */}
          <div className={cn(
            "text-center space-y-6",
            isMobile && "space-y-5" // Increased spacing in logo section
          )}>
            <Link 
              href="/" 
              className="inline-block transition-all duration-300 hover:scale-105 hover:rotate-3"
            >
              <div className={cn(
                "relative w-16 h-16 mx-auto bg-background/50 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-border/50",
                isMobile && "w-15 h-15" // Increased logo size slightly
              )}>
                <WorkoutProgressIcon size={40} className="w-full h-full" />
              </div>
            </Link>
            <div className="space-y-2">
              <h2 className={cn(
                "text-3xl font-bold bg-gradient-to-r from-yellow-400 via-green-400 to-red-500 bg-clip-text text-transparent",
                isMobile && "text-2xl sm:text-2xl" // Increased title size and added responsive breakpoint
              )}>
                {title}
              </h2>
              <p className={cn(
                "text-base text-muted-foreground",
                isMobile && "text-[0.9375rem]" // Increased subtitle size (15px)
              )}>
                {subtitle}
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-green-400/20 to-red-500/20 rounded-2xl blur-xl" />
            <div className={cn(
              "relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl",
              isMobile && "p-7" // Increased padding slightly
            )}>
              {children}
            </div>
          </div>

          {/* Footer */}
          <p className={cn(
            "text-center text-sm text-muted-foreground",
            isMobile && "text-[0.875rem]" // Increased footer text size (14px)
          )}>
            {footerText}{' '}
            <Link
              href={footerLink}
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 