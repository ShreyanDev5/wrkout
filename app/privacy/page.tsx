"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Lock, Database, EyeOff, Trash2 } from "lucide-react"

export default function PrivacyPage() {
  return (
    <main className="relative isolate min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Subtle luxury ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-white/[0.02] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="w-full max-w-[410px] space-y-4 -mt-4 sm:-mt-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        {/* Dark Glass Card Container */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl space-y-5 relative overflow-hidden">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border border-zinc-800 bg-zinc-900/90 text-zinc-300 text-[11px] font-semibold tracking-wide uppercase shadow-sm">
              <Shield className="h-3.5 w-3.5 text-zinc-400" /> Privacy
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Privacy & Data
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              How your data and workouts are protected.
            </p>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-zinc-800 bg-zinc-800/60 text-zinc-300 flex-shrink-0 mt-0.5 shadow-sm">
                <Lock className="h-4 w-4 text-zinc-300" strokeWidth={1.8} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Secure Authentication</p>
                <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                  Passwords are encrypted. Raw credentials are never stored or accessible.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 flex-shrink-0 mt-0.5 shadow-sm">
                <Database className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Workout Sync</p>
                <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                  Workouts and routines are stored to sync across your devices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-amber-500/20 bg-amber-500/10 text-amber-400 flex-shrink-0 mt-0.5 shadow-sm">
                <EyeOff className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Zero Data Sharing</p>
                <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                  Your data is never sold, shared, or used for tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-800/70 bg-zinc-900/50">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center border border-red-500/20 bg-red-500/10 text-red-400 flex-shrink-0 mt-0.5 shadow-sm">
                <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Full Control</p>
                <p className="text-[11.5px] text-zinc-400 leading-relaxed">
                  You can delete your account and workout history at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
