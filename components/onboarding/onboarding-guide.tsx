"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
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
  AlertTriangle,
  Users,
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
          { label: "PULL", desc: "Back • Biceps • Traps", color: "from-emerald-400 to-teal-500", icon: Target },
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
              <p className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">{item.desc}</p>
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
    description: "By default, log your final working set. You can also enter a rough average of your sets based on your judgment.",
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
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wide">Quick Entry</span>
            </div>
          </div>

          {/* Inline Input Visualization */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-zinc-900/80 rounded-lg p-2 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground uppercase">Weight</span>
              <span className="text-sm font-bold text-emerald-400">52.5</span>
            </div>
            <div className="flex-1 bg-zinc-900/80 rounded-lg p-2 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] text-muted-foreground uppercase">Reps</span>
              <span className="text-sm font-bold text-white">8</span>
            </div>
          </div>

          <p className="text-[11px] text-center text-zinc-400 leading-snug">
            Example: If your sets were 9, 9, 8 reps — log 8 or 9 based on feel.
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
            desc: "Aim to add weight or reps over time as your body adapts.",
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
          },
          {
            title: "Weekly Volume",
            meta: "Working Sets",
            desc: "10-20 working sets (not warm-ups) per muscle/week. Start lower, build up.",
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
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/30 ${item.color} uppercase`}>{item.meta}</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
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
    description: "General guidelines for intermediate trainers. Adjust based on your experience level.",
    icon: List,
    color: "from-violet-500 to-fuchsia-500",
    content: (
      <div className="pt-2 max-w-[300px] mx-auto space-y-3">

        {/* Progression Goal Card */}
        <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-fuchsia-500/20 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5 text-fuchsia-400" />
            </div>
            <h4 className="text-[11px] font-bold text-fuchsia-100 uppercase tracking-wide">Progression Goal</h4>
          </div>
          <p className="text-[12px] text-zinc-300 leading-relaxed">
            Aim for <span className="text-white font-bold">+1-2.5kg</span> OR <span className="text-white font-bold">+1-2 reps</span> when ready
          </p>
        </div>

        {/* Rep Ranges Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-3 text-center">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Compounds</span>
            <div className="text-xl font-bold text-white">6-10</div>
            <span className="text-[10px] font-medium text-zinc-500">reps</span>
            <p className="text-[10px] text-zinc-600 mt-1.5">Chest, Back, Legs</p>
          </div>
          <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-3 text-center">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-1">Isolation</span>
            <div className="text-xl font-bold text-white">10-15</div>
            <span className="text-[10px] font-medium text-zinc-500">reps</span>
            <p className="text-[10px] text-zinc-600 mt-1.5">Arms, Delts, Calves</p>
          </div>
        </div>

      </div>
    )
  },
  {
    id: "volume",
    title: "Training Volume",
    subtitle: "Smart Scaling",
    description: "Match your volume to your experience. Start conservative and build up as you adapt.",
    icon: Users,
    color: "from-violet-500 to-fuchsia-500",
    content: (
      <div className="pt-1 max-w-[280px] mx-auto">
        {/* Volume by Experience */}
        <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="h-6 w-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <BarChart3 className="h-3.5 w-3.5 text-violet-400" />
            </div>
            <h4 className="text-[11px] font-bold text-violet-100 uppercase tracking-wide">Sets per Muscle / Week</h4>
          </div>

          <div className="space-y-1.5">
            {[
              { level: "Beginner", sets: "6-10", desc: "Build work capacity", color: "text-emerald-400", bg: "bg-emerald-500/10", active: false },
              { level: "Intermediate", sets: "12-15", desc: "Growth sweet spot", color: "text-amber-400", bg: "bg-amber-500/15", active: true },
              { level: "Advanced", sets: "18-22", desc: "High volume phase", color: "text-red-400", bg: "bg-red-500/10", active: false },
            ].map((tier, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg transition-all",
                  tier.active ? `${tier.bg} border border-amber-500/20` : "bg-zinc-800/30"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[11px] font-bold w-20",
                    tier.active ? tier.color : "text-zinc-500"
                  )}>{tier.level}</span>
                  <span className={cn(
                    "text-[10px]",
                    tier.active ? "text-zinc-300" : "text-zinc-600"
                  )}>{tier.desc}</span>
                </div>
                <span className={cn(
                  "text-[11px] font-bold tabular-nums",
                  tier.active ? "text-white" : "text-zinc-500"
                )}>{tier.sets}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: "rir",
    title: "RIR & Safety",
    subtitle: "The Guardrails",
    description: "RIR = Reps in Reserve (how many reps you could still do). Manage fatigue smartly.",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    content: (
      <div className="pt-1 max-w-[300px] mx-auto">
        <div className="bg-zinc-900/50 rounded-xl border border-white/5 p-3 space-y-3">

          {/* Safety Rule */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/10">
            <div className="mt-0.5 h-5 w-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-amber-200 uppercase mb-0.5">Be Cautious</h4>
              <p className="text-[11px] text-amber-200/70 leading-snug">
                For heavy compounds without a spotter, consider keeping 1-2 reps in reserve. Go to failure safely on machines and isolation.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { rir: "3+", action: "Consider ↑ Weight", desc: "Room to grow", color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { rir: "1-2", action: "Maintain or +1 Rep", desc: "Effective effort", color: "text-amber-500", bg: "bg-amber-500/10" },
              { rir: "0", action: "Repeat weight", desc: "Maximal effort", color: "text-red-400", bg: "bg-red-500/10" },
            ].map((rule, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${rule.bg}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-zinc-300 w-12">RIR {rule.rir}</span>
                  <span className="text-[10px] text-zinc-500">{rule.desc}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="h-2.5 w-2.5 text-zinc-600" />
                  <span className={`text-[11px] font-bold ${rule.color}`}>{rule.action}</span>
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
      <div className="pt-1 max-w-[280px] mx-auto relative cursor-default select-none">

        {/* Header Mock */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="h-7 w-7 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white">Today's Focus</div>
            <div className="text-[9px] font-bold text-zinc-500 tracking-wider uppercase">Today</div>
          </div>
        </div>

        {/* Cards Mock */}
        <div className="space-y-1.5">
          {[
            { label: "PUSH", name: "Chest Press", w: "37.5", r: "10", s: "3", rir: "3", bar: "bg-amber-500", text: "text-amber-500" }
          ].map((card, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg bg-zinc-900 border border-white/5 p-2 pl-3"
            >
              {/* Colored Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${card.bar}`} />

              <div className="flex flex-col gap-1.5">
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${card.text}`}>{card.label}</span>
                  <h4 className="text-[12px] font-bold text-white truncate">{card.name}</h4>
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
                      <span className={cn("text-[10px] font-bold text-zinc-300", stat.l === "RIR" && "text-emerald-500")}>{stat.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    id: "begin",
    title: "Your Journey Begins",
    subtitle: "Ready",
    description: "Customize your routine in Settings, or dive straight into your first Push workout.",
    icon: CheckCircle,
    color: "from-emerald-500 to-green-600",
    iconColor: "text-white",
    content: (
      <div className="pt-1 max-w-[280px] mx-auto">
        {/* Motivational text */}
        <div className="text-center mb-3">
          <p className="text-[13px] text-foreground/90 font-medium">Everything is set.</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Make today count.</p>
        </div>

        {/* Disclaimer */}
        <div className="px-3 py-2.5 rounded-lg bg-zinc-800/50 border border-white/5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              <span className="text-zinc-300 font-medium">Disclaimer:</span> These guidelines are personal recommendations and a starting point only. Do your own research, consult professionals, and adapt to your needs and health conditions.
            </p>
          </div>
        </div>
      </div>
    )
  }
]

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()

  // Touch/swipe support with visual feedback
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 50
  const dragX = useMotionValue(0)
  const dragOpacity = useTransform(dragX, [-100, 0, 100], [0.5, 1, 0.5])

  useEffect(() => {
    if (isOpen) setCurrentStep(0)
  }, [isOpen])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

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

  const handleDotClick = useCallback((index: number) => {
    setCurrentStep(index)
  }, [])

  // Touch handlers for swipe support
  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
    // Update drag value for visual feedback
    if (touchStartX.current) {
      const diff = touchEndX.current - touchStartX.current
      dragX.set(diff)
    }
  }

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      handleNext()
    } else if (isRightSwipe) {
      handlePrev()
    }

    // Reset drag value
    dragX.set(0)
  }

  const currentData = onboardingSteps[currentStep]
  const isLast = currentStep === onboardingSteps.length - 1
  const isFirst = currentStep === 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100%-1.5rem)] max-w-[380px] p-0 overflow-hidden rounded-[28px] border-0 bg-[#121212] shadow-2xl outline-none"
        hideCloseButton
      >
        <DialogTitle className="sr-only">Onboarding</DialogTitle>

        {/* Progress System - Color matches current slide */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-10">
          <motion.div
            className={`h-full bg-gradient-to-r ${currentData.color}`}
            animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        {/* Increased height with more breathing room */}
        <motion.div
          className="flex flex-col min-h-[560px] max-h-[88vh]"
          style={{ opacity: dragOpacity }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
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
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mb-1.5">{currentData.subtitle}</p>
                <h2 className="text-xl font-bold tracking-tight text-white mb-2">{currentData.title}</h2>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-[280px] mx-auto min-h-[40px] flex items-center justify-center">
                  {currentData.description}
                </p>
              </motion.div>
            </div>
          </div>

          {/* Dynamic Content Area - Centered & Spaced */}
          <div className="flex-1 px-6 relative flex flex-col justify-center overflow-y-auto min-h-[200px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
                layout="position"
              >
                {currentData.content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer / Navigation - Increased spacing above */}
          <div className="px-5 pt-6 pb-6">
            {/* Swipe hint on first slide */}
            {isFirst && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="text-[10px] text-zinc-600 text-center mb-3"
              >
                Swipe or tap to navigate
              </motion.p>
            )}
            <div className="grid grid-cols-[72px_1fr_90px] items-center">
              {/* Left: Back Button (or Skip on first slide) */}
              {isFirst ? (
                <button
                  onClick={handleComplete}
                  className="justify-self-start text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors px-3 py-2 -ml-1 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-white/5"
                >
                  Skip
                </button>
              ) : (
                <motion.button
                  onClick={handlePrev}
                  whileTap={{ scale: 0.95 }}
                  className="justify-self-start h-10 w-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              )}

              {/* Center: Clickable Dots - smaller and more compact */}
              <div className="flex gap-1.5 justify-center">
                {onboardingSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handleDotClick(i)}
                    className="p-1.5 -m-1 group"
                    aria-label={`Go to step ${i + 1}`}
                  >
                    <span
                      className={cn(
                        "block h-1.5 w-1.5 rounded-full transition-all duration-300 group-hover:scale-125",
                        i === currentStep
                          ? "bg-white scale-125 shadow-[0_0_6px_2px_rgba(255,255,255,0.3)]"
                          : "bg-white/20 group-hover:bg-white/40"
                      )}
                    />
                  </button>
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
        </motion.div>

      </DialogContent>
    </Dialog>
  )
}