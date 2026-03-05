'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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
      {/* Background decorative elements - subtle for premium look */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-400/[0.03] rounded-full blur-3xl" />
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
            "text-center space-y-3",
            isMobile && "space-y-2"
          )}>
            <Link
              href="/"
              className="inline-block transition-all duration-300 hover:scale-105 hover:rotate-3"
            >
              <div className="relative w-20 h-20 mx-auto">
                <Image
                  src="/logo_1.0-transparent.png"
                  alt="wrkout logo"
                  width={80}
                  height={80}
                  className="w-full h-full object-contain"
                  priority
                />
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
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-green-400/10 to-red-500/10 rounded-2xl blur-xl" />
            <div className={cn(
              "relative bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-2xl p-8 shadow-2xl",
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
              className="font-medium text-foreground hover:text-yellow-400 transition-colors duration-200"
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div >
    </div >
  );
} 