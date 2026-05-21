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
      {/* Premium subtle iOS-like background blur blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Yellow top/left blob */}
        <div className="absolute -left-[10%] -top-[10%] h-[55%] w-[55%] rounded-full bg-[rgba(249,217,73,0.07)] blur-[100px] sm:blur-[120px]" />
        {/* Green middle/right blob */}
        <div className="absolute right-[5%] top-[15%] h-[50%] w-[50%] rounded-full bg-[rgba(76,175,80,0.06)] blur-[100px] sm:blur-[120px]" />
        {/* Red bottom/left blob */}
        <div className="absolute -bottom-[10%] left-[15%] h-[45%] w-[45%] rounded-full bg-[rgba(244,67,54,0.05)] blur-[100px] sm:blur-[120px]" />
        
        {/* Premium faint dot pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

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
              className="inline-flex animate-fade-in"
            >
              <div className="relative mx-auto h-14 w-14 sm:h-16 sm:w-16">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/70 shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:h-16 sm:w-16 transition-all duration-350 hover:scale-[1.05] hover:border-push-light/20 hover:shadow-[0_10px_25px_rgba(249,217,73,0.12)]">
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
            "rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-950/80 to-zinc-950/65 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl",
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
