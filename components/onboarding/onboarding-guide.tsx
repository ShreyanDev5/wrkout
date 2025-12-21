"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp,
  Target,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Calendar,
  Dumbbell,
  List,
  Zap,
} from "lucide-react"
import { LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<LucideProps>
  color: string
  iconColor?: string
  content: React.ReactNode
}

interface OnboardingGuideProps {
  isOpen: boolean
  onClose: () => void
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "foundation",
    title: "Push • Pull • Legs",
    subtitle: "The Foundation",
    description: "Master the classic split. Three focused days to target every muscle group.",
    icon: Calendar,
    color: "from-blue-500 to-indigo-600",
    content: (
      <div className="space-y-2.5 pt-2 max-w-[260px] mx-auto">
        {[
          { label: "PUSH", desc: "Chest • Shoulders • Triceps", color: "from-amber-400 to-orange-500", icon: Dumbbell },
          { label: "PULL", desc: "Back • Biceps • Rear Delt", color: "from-emerald-400 to-teal-500", icon: Target },
          { label: "LEGS", desc: "Quads • Hamstrings • Calves", color: "from-red-400 to-rose-500", icon: TrendingUp },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 + 0.2, duration: 0.4 }}
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-900/40 p-3 flex items-center gap-3.5 transition-colors hover:bg-zinc-800/50"
          >
            <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}>
              <item.icon className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-wide text-foreground">{item.label}</h4>
              <p className="text-[9px] uppercase tracking-wider font-medium text-muted-foreground">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: "method",
    title: "The Golden Rule",
    subtitle: "Smart Logging",
    description: "This app is uniquely designed to log only your final set. This captures your true failure point and averages performance across all sets.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    content: (
      <div className="pt-4 max-w-[280px] mx-auto">
        <div className="relative rounded-2xl border border-white/5 bg-zinc-900/50 p-4 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Zap className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Last Set Only</span>
            </div>
          </div>

          {/* Inline Input Visualization */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-zinc-900/80 rounded-lg p-2 border border-white/5 flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground uppercase">Weight</span>
              <span className="text-sm font-bold text-emerald-400">52.5</span>
            </div>
            <div className="flex-1 bg-zinc-900/80 rounded-lg p-2 border border-white/5 flex flex-col items-center">
              <span className="text-[9px] text-muted-foreground uppercase">Reps</span>
              <span className="text-sm font-bold text-white">8</span>
            </div>
          </div>

          <p className="text-[10px] text-center text-zinc-400 leading-snug">
            "If my last set was 52.5kg for 8 reps, that's what I log."
          </p>
        </div>
      </div>
    )
  },
  {
    id: "pillars",
    title: "The Two Pillars",
    subtitle: "Core Philosophy",
    description: "Everything you do in the gym should serve these two primary goals. Ignore the noise.",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    content: (
      <div className="pt-2 max-w-[300px] mx-auto space-y-3">
        {[
          {
            title: "Progressive Overload",
            meta: "Get Stronger",
            desc: "Add weight or reps every single month.",
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
          },
          {
            title: "Weekly Volume",
            meta: "12-15 Hard Sets",
            desc: "Per muscle group, per week. The growth sweet spot.",
            icon: BarChart3,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
          }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 + 0.2 }}
            className={`p-3 rounded-xl border ${item.border} ${item.bg} flex gap-3`}
          >
            <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-black/20`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/30 ${item.color} uppercase`}>{item.meta}</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-snug">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: "blueprint",
    title: "The Blueprint",
    subtitle: "Rules of Engagement",
    description: "Follow these volume and progression standards to ensure consistent gains.",
    icon: List,
    color: "from-violet-500 to-fuchsia-500",
    content: (
      <div className="pt-2 max-w-[300px] mx-auto">
        <div className="bg-zinc-900/50 rounded-xl border border-white/5 overflow-hidden">

          {/* Monthly Goal */}
          <div className="p-3 bg-white/5 border-b border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-3 w-3 text-fuchsia-400" />
              <h4 className="text-[10px] font-bold text-fuchsia-100 uppercase tracking-wide">Monthly Goal</h4>
            </div>
            <p className="text-[11px] text-zinc-300">
              Add <span className="text-white font-bold">+2-5kg</span> OR <span className="text-white font-bold">+1-2 reps</span>
            </p>
          </div>

          {/* Rep Ranges Grid */}
          <div className="p-3 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Compounds</span>
              <div className="text-lg font-bold text-white">6-10 <span className="text-[10px] font-medium text-zinc-400">reps</span></div>
              <p className="text-[9px] text-zinc-500 leading-tight">Chest, Back, Legs</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 uppercase font-bold">Isolation</span>
              <div className="text-lg font-bold text-white">10-15 <span className="text-[10px] font-medium text-zinc-400">reps</span></div>
              <p className="text-[9px] text-zinc-500 leading-tight">Arms, Delts, Abs</p>
            </div>
          </div>

          {/* Volume Footer */}
          <div className="px-3 py-2 bg-black/20 border-t border-white/5 flex justify-between items-center">
            <span className="text-[9px] text-zinc-400">Volume Ramp</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-zinc-500">2 sets</span>
              <ArrowRight className="h-2.5 w-2.5 text-zinc-600" />
              <span className="text-[10px] font-bold text-white">3-5 sets</span>
            </div>
          </div>

        </div>
      </div>
    )
  },
  {
    id: "rir",
    title: "Intensity & Safety",
    subtitle: "The Guardrails",
    description: "Manage your fatigue. Push hard on safe movements, but stay smart on big lifts.",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    content: (
      <div className="pt-1 max-w-[300px] mx-auto">
        <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-3 space-y-3">

          {/* Safety Rule */}
          <div className="flex items-start gap-2.5 p-2 rounded-lg bg-red-500/10 border border-red-500/10">
            <div className="mt-0.5 h-4 w-4 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-red-500">!</span>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-red-200 uppercase mb-0.5">Safety First</h4>
              <p className="text-[10px] text-red-200/70 leading-snug">
                Never train to failure on big compounds (Squat, Deadlift, Bench). Keep 1 rep in the tank.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { rir: "3+", action: "↑ Weight", desc: "Too easy", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { rir: "1-2", action: "+1 Rep", desc: "Optimal Zone", color: "text-amber-500", bg: "bg-amber-500/10" },
              { rir: "0", action: "Repeat", desc: "Failure Hit", color: "text-zinc-400", bg: "bg-zinc-500/10" },
            ].map((rule, i) => (
              <div key={i} className={`flex items-center justify-between p-2 rounded ${rule.bg}`}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-300 w-12">RIR {rule.rir}</span>
                  <span className="text-[10px] text-zinc-500">{rule.desc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-2.5 w-2.5 text-zinc-600" />
                  <span className={`text-[10px] font-bold ${rule.color}`}>{rule.action}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: "insight",
    title: "Daily Focus",
    subtitle: "The Momentum",
    description: "Your Progress page displays detailed insights for today's workout only, keeping you focused on the session at hand.",
    icon: List,
    color: "from-purple-500 to-indigo-600",
    content: (
      <div className="pt-2 max-w-[300px] mx-auto relative cursor-default select-none">

        {/* Header Mock */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="h-8 w-8 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Today's Focus</div>
            <div className="text-[10px] font-bold text-zinc-500 tracking-wider">DEC 19, 2025</div>
          </div>
        </div>

        {/* Cards Mock */}
        <div className="space-y-1.5">
          {[
            { label: "PUSH", name: "Chest Press", w: "37.5", r: "10", s: "3", rir: "3", bar: "bg-amber-500", text: "text-amber-500" }
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden rounded-lg bg-zinc-900 border border-white/5 p-2 pl-3"
            >
              {/* Colored Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.bar}`} />

              <div className="flex flex-col gap-1.5">
                <div>
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${card.text}`}>{card.label}</span>
                  <h4 className="text-[13px] font-bold text-white truncate">{card.name}</h4>
                </div>

                <div className="grid grid-cols-4 gap-1">
                  {[
                    { l: "WEIGHT", v: card.w },
                    { l: "REPS", v: card.r },
                    { l: "SETS", v: card.s },
                    { l: "RIR", v: card.rir }
                  ].map((stat, j) => (
                    <div key={j} className="bg-zinc-950 rounded py-0.5 px-0.5 flex flex-col items-center">
                      <span className="text-[8px] text-zinc-600 font-bold uppercase">{stat.l}</span>
                      <span className={cn("text-[11px] font-bold text-zinc-300", stat.l === "RIR" && "text-emerald-500")}>{stat.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "begin",
    title: "Your Journey Begins",
    subtitle: "Ready",
    description: "Customize your routine in Settings, or dive straight into your first Push workflow.",
    icon: Sparkles,
    color: "from-emerald-500 to-green-600",
    iconColor: "text-white",
    content: (
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-fuchsia-500 blur-3xl opacity-20 rounded-full" />
          <div className="relative h-24 w-24 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-white/10 flex items-center justify-center shadow-2xl">
            <CheckCircle className="h-10 w-10 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-foreground/90 font-medium">Everything is set.</p>
          <p className="text-xs text-muted-foreground mt-1">Make today count.</p>
        </motion.div>
      </div>
    )
  }
]

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen) setCurrentStep(0)
  }, [isOpen])

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    if (user?.id) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true')
    }
    onClose()
  }, [user?.id, onClose])

  const currentData = onboardingSteps[currentStep]
  const isLast = currentStep === onboardingSteps.length - 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100%-1.5rem)] max-w-[380px] p-0 overflow-hidden rounded-[28px] border-0 bg-[#121212] shadow-2xl outline-none"
        hideCloseButton
      >
        <DialogTitle className="sr-only">Onboarding</DialogTitle>

        {/* Progress System */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-500"
            animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        {/* Compact height */}
        <div className="flex flex-col h-[540px]">
          {/* Header Section */}
          <div className="px-6 pt-10 pb-2 text-center relative z-10">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br ${currentData.color} flex items-center justify-center shadow-lg mb-5 scale-90`}
            >
              <currentData.icon className={`h-7 w-7 ${currentData.iconColor || "text-white"} drop-shadow-sm`} />
            </motion.div>

            <div className="space-y-1.5">
              <motion.div
                key={`text-${currentStep}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-1.5">{currentData.subtitle}</p>
                <h2 className="text-xl font-bold tracking-tight text-white mb-2">{currentData.title}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto min-h-[40px] flex items-center justify-center">
                  {currentData.description}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Dynamic Content Area - Centered & Spaced */}
          <div className="flex-1 px-6 relative flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {currentData.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer / Navigation - Compact Grid */}
          <div className="px-5 pt-2 pb-6">
            <div className="grid grid-cols-[80px_1fr_80px] items-center">
              {/* Left: Skip Button */}
              <button
                onClick={handleComplete}
                className="justify-self-start text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-2 -ml-2 rounded-lg hover:bg-white/5"
              >
                Skip
              </button>

              {/* Center: Dots */}
              <div className="flex gap-1.5 justify-center">
                {onboardingSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${i === currentStep ? "bg-white scale-110" : "bg-white/10"}`}
                  />
                ))}
              </div>

              {/* Right: Next/Start Button */}
              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.95 }}
                className="justify-self-end h-10 px-5 rounded-full bg-white text-black text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
              >
                {isLast ? "Start" : "Next"}
                {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
              </motion.button>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}