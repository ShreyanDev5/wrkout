'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

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
  return (
    <div className={cn(
      "relative isolate min-h-screen overflow-hidden bg-zinc-950 text-foreground select-none",
      "flex items-center justify-center px-4 py-8 sm:py-10"
    )}>
      {/* Subtle luxury ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full bg-white/[0.02] blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="w-full max-w-[410px] -mt-4 sm:-mt-6">
        <div className="space-y-5">
          <div className="text-center space-y-2.5">
            <Link
              href="/"
              className="inline-flex transition-transform active:scale-95 cursor-pointer"
            >
              <div className="relative mx-auto h-11 w-11 sm:h-12 sm:w-12">
                <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/60 p-2">
                  <Image
                    src="/logo_1.0-transparent.png"
                    alt="wrkout logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
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

          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl relative overflow-hidden">
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
                className="font-semibold text-zinc-200 hover:text-white underline-offset-4 transition-colors hover:underline"
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
