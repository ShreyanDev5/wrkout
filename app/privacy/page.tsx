"use client"

import Link from "next/link"
import { ArrowLeft, Shield, Lock, Database, EyeOff, Trash2 } from "lucide-react"

export default function PrivacyPage() {
  return (
    <main className="relative isolate min-h-screen bg-zinc-950 text-foreground flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Subtle luxury ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-flex-dark/5 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.012)_1px,transparent_1px)] [background-size:24px_24px] opacity-70" />
      </div>

      <div className="w-full max-w-[480px] space-y-4 -mt-4 sm:-mt-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>

        {/* Dark Glass Card Container */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-5 sm:p-7 shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150 space-y-5 relative overflow-hidden">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-flex-dark/20 bg-flex-dark/10 text-flex-dark text-[11px] font-extrabold tracking-wide uppercase">
              <Shield className="h-3.5 w-3.5" /> Privacy Notice
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
              Data Privacy & Security
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Wrkout is built with privacy at its core. Here is how your data is protected:
            </p>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60">
              <Lock className="h-4 w-4 text-flex-dark mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Secure Authentication</p>
                <p className="text-[11.5px] text-zinc-400 leading-snug">
                  Passwords are encrypted and safely managed via Supabase Auth. Raw credentials are never stored or accessed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60">
              <Database className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Workout Synchronization</p>
                <p className="text-[11.5px] text-zinc-400 leading-snug">
                  Your workout logs and routines are stored strictly to sync your training progress across devices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60">
              <EyeOff className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Zero Third-Party Sharing</p>
                <p className="text-[11.5px] text-zinc-400 leading-snug">
                  Your data is 100% private. It is never sold, shared, or used for advertising or tracking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-zinc-800/60 bg-zinc-900/60">
              <Trash2 className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">Full Control & Deletion</p>
                <p className="text-[11.5px] text-zinc-400 leading-snug">
                  You maintain full ownership of your data and may request total account & log deletion at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
