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
      "relative isolate min-h-screen overflow-hidden bg-background text-foreground",
      "flex items-center justify-center px-4 py-8 sm:py-10"
    )}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(193,154,30,0.08),transparent_30%),radial-gradient(circle_at_18%_20%,rgba(91,144,95,0.07),transparent_26%),radial-gradient(circle_at_84%_8%,rgba(160,80,80,0.06),transparent_24%),linear-gradient(to_bottom,rgba(255,255,255,0.015),transparent_28%,rgba(255,255,255,0.01))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_35%,transparent_65%,rgba(255,255,255,0.015)_100%)]" />

      <div className={cn(
        "w-full max-w-[420px]",
        isMobile && "max-w-[390px]"
      )}>
        <div className={cn(
          "space-y-6 sm:space-y-7",
          isMobile && "space-y-5"
        )}>
          <div className={cn(
            "text-center space-y-3 sm:space-y-4",
            isMobile && "space-y-2"
          )}>
            <Link
              href="/"
              className="inline-flex"
            >
              <div className="relative mx-auto h-14 w-14 sm:h-16 sm:w-16">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/70 shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:h-16 sm:w-16">
                  <Image
                    src="/logo_1.0-transparent.png"
                    alt="wrkout logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
              </div>
            </Link>
            <div className="space-y-1.5">
              <h2 className={cn(
                "text-[1.7rem] font-semibold tracking-normal text-foreground sm:text-2xl",
                isMobile && "text-[1.5rem]"
              )}>
                {title}
              </h2>
              <p className={cn(
                "mx-auto max-w-sm text-[0.92rem] leading-6 text-muted-foreground sm:text-sm",
                isMobile && "text-[0.89rem]"
              )}>
                {subtitle}
              </p>
            </div>
          </div>

          <div className={cn(
            "rounded-3xl border border-white/10 bg-zinc-950/72 p-5 sm:p-6",
            isMobile && "p-[18px]"
          )}>
            {children}
          </div>

          {footerText && footerLink && footerLinkText && (
            <p className="text-center text-[0.88rem] text-muted-foreground sm:text-sm">
              {footerText}{' '}
              <Link
                href={footerLink}
                className="font-medium text-foreground underline-offset-4 transition-colors duration-200 hover:text-pull-dark hover:underline"
              >
                {footerLinkText}
              </Link>
            </p>
          )}
        </div>
      </div >
    </div >
  );
} 
