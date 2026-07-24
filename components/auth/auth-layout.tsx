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
      "relative isolate min-h-screen overflow-hidden bg-zinc-950 text-foreground",
      "flex items-center justify-center px-4 py-8 sm:py-10"
    )}>
      {/* Subtle luxury ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-flex-dark/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className={cn(
        "w-full max-w-[400px] -mt-6 sm:-mt-8",
        isMobile && "max-w-[360px]"
      )}>
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <Link
              href="/"
              className="inline-flex transition-transform active:scale-95"
            >
              <div className="relative mx-auto h-14 w-14 sm:h-16 sm:w-16">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-md sm:h-16 sm:w-16 transition-all duration-200 hover:border-zinc-700">
                  <Image
                    src="/logo_1.0-transparent.png"
                    alt="wrkout logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain p-0.5"
                    priority
                  />
                </div>
              </div>
            </Link>
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {title}
              </h2>
              <p className="mx-auto max-w-sm text-xs sm:text-sm text-zinc-400">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/75 p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150 relative overflow-hidden">
            {/* Subtle internal glass glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </div>

          {footerText && footerLink && footerLinkText && (
            <p className="text-center text-xs text-zinc-400">
              {footerText}{' '}
              <Link
                href={footerLink}
                className="font-bold text-flex-dark underline-offset-4 transition-colors hover:text-blue-400 hover:underline"
              >
                {footerLinkText}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 
