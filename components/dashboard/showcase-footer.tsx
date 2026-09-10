"use client"

import { ArrowUpRight, Github } from "lucide-react"

interface ShowcaseFooterProps {
  className?: string
}

export function ShowcaseFooter({ className = "" }: ShowcaseFooterProps) {
  return (
    <footer className={`w-full mt-6 pt-4 pb-2 border-t border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-2 text-xs select-none ${className}`}>
      {/* Left side: Project Name · Description */}
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-semibold text-zinc-300 tracking-tight">wrkout</span>
        <span className="text-zinc-600 font-bold">·</span>
        <span className="text-zinc-500 font-normal">Overload Tracker</span>
      </div>

      {/* Right side: Shreyan Sardar ↗ / GitHub */}
      <div className="flex items-center gap-2.5 font-medium flex-shrink-0">
        <a
          href="https://shreyandev.vercel.app"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label="Visit Shreyan Sardar's portfolio (opens in new tab)"
        >
          <span>Shreyan Sardar</span>
          <ArrowUpRight className="h-[13px] w-[13px] stroke-[1.8] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
        </a>

        <span className="text-zinc-700">/</span>

        <a
          href="https://github.com/ShreyanDev5/wrkout"
          target="_blank"
          rel="noreferrer"
          className="group inline-flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label="View wrkout repository on GitHub (opens in new tab)"
        >
          <Github className="h-[13px] w-[13px] stroke-[1.8] transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[1px] group-hover:-translate-y-[1px]" />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  )
}
