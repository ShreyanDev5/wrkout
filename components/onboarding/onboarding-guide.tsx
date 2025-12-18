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
    title: "Progressive Overload",
    subtitle: "The Method",
    description: "Log faster than ever with our quick inline system—enter weights, sets, and reps seamlessly in one flow.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    content: (
      <div className="pt-4 max-w-[280px] mx-auto">
        <div className="relative rounded-2xl border border-white/5 bg-zinc-900/50 p-4 overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />

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
            <div className="h-full flex items-center justify-center p-2">
              <Zap className="h-5 w-5 text-amber-400 fill-amber-400/20" />
            </div>
          </div>

          {/* Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/10"
          >
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-medium text-emerald-100/80">Beating Last Session</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 opacity-80 decoration-emerald-500/30 line-through">50kg</span>
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: "insight",
    title: "Visual Clarity",
    subtitle: "The Reward",
    description: "For utmost simplicity, we display only your last 7 sessions in a clean, elegant list showing dates and completed exercises.",
    icon: List,
    color: "from-purple-500 to-indigo-600",
    content: (
      <div className="pt-3 max-w-[280px] mx-auto relative cursor-default select-none space-y-2">
        {[
          { date: "Today", type: "Push Day", count: 6, color: "bg-amber-400" },
          { date: "Yesterday", type: "Pull Day", count: 7, color: "bg-emerald-400" },
          { date: "Dec 16", type: "Leg Day", count: 5, color: "bg-red-400" }
        ].map((session, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 + 0.2 }}
            className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className={`h-8 w-1 rounded-full ${session.color}`} />
              <div>
                <div className="text-[10px] font-bold text-foreground">{session.date}</div>
                <div className="text-[9px] text-muted-foreground font-medium">{session.type}</div>
              </div>
            </div>
            <div className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-semibold text-zinc-300">
              {session.count} Exercises
            </div>
          </motion.div>
        ))}
      </div>
    )
  },
  {
    id: "begin",
    title: "Your Journey Begins",
    subtitle: "Ready",
    description: "Customize your routine in Settings, or dive straight into your first Push workflow.",
    icon: Sparkles,
    color: "from-amber-400 to-orange-500",
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