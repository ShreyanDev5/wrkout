"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BicepsFlexed, Dumbbell, Footprints, Hand, Minus, Plus, PlusCircle } from "lucide-react"
import { LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingStep {
  id: string
  title: string
  subtitle: string
  description: string
  icon: React.ComponentType<LucideProps>
  iconClass: string
  barClass: string
  buttonClass: string
  buttonTextClass: string
  content: React.ReactNode
}

interface OnboardingGuideProps {
  isOpen: boolean
  onClose: () => void
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "split",
    title: "Build your split",
    subtitle: "",
    description: "Set up your routine around Push, Pull, and Legs. Easily customize your training split in Settings.",
    icon: Dumbbell,
    iconClass: "text-push-dark",
    barClass: "bg-push-dark",
    buttonClass: "bg-push-dark hover:opacity-90 active:scale-95 shadow-[0_4px_16px_rgba(249,217,73,0.2)]",
    buttonTextClass: "text-zinc-950 font-bold",
    content: (
      <div className="mx-auto w-full max-w-[285px] space-y-3.5 select-none">
        {/* Weekly Calendar Widget */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 shadow-inner">
          <div className="mb-2.5 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
            Weekly Split Schedule
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {[
              { day: "M", type: "Push", color: "bg-push-dark text-zinc-950 font-bold" },
              { day: "T", type: "Rest", color: "bg-white/5 text-zinc-500" },
              { day: "W", type: "Pull", color: "bg-pull-dark text-white font-bold" },
              { day: "T", type: "Rest", color: "bg-white/5 text-zinc-500" },
              { day: "F", type: "Legs", color: "bg-leg-dark text-white font-bold" },
              { day: "S", type: "Rest", color: "bg-white/5 text-zinc-500" },
              { day: "S", type: "Rest", color: "bg-white/5 text-zinc-500" },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-semibold text-zinc-500">{item.day}</span>
                <span className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] transition-all",
                  item.color
                )}>
                  {item.type !== "Rest" ? item.type[0] : "•"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Split cards list */}
        <div className="space-y-2">
          {[
            {
              label: "Push",
              desc: "Chest • Shoulders • Triceps",
              tone: "bg-push-dark/10 text-push-dark border-push-dark/25",
              icon: Hand,
            },
            {
              label: "Pull",
              desc: "Back • Biceps • Traps",
              tone: "bg-pull-dark/10 text-pull-dark border-pull-dark/25",
              icon: BicepsFlexed,
            },
            {
              label: "Legs",
              desc: "Quads • Hamstrings • Calves",
              tone: "bg-leg-dark/10 text-leg-dark border-leg-dark/25",
              icon: Footprints,
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 + 0.15, duration: 0.3 }}
              className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-2 px-3"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg border", item.tone)}>
                  <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-foreground">{item.label}</div>
                  <div className="text-[10px] text-zinc-500 leading-none mt-0.5">{item.desc}</div>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.05]">
                Active
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "logging",
    title: "Log the set",
    subtitle: "",
    description: "Record just one entry per exercise: either your final working set or the average of all sets. No need to log warm-ups.",
    icon: PlusCircle,
    iconClass: "text-pull-dark",
    barClass: "bg-pull-dark",
    buttonClass: "bg-pull-dark hover:opacity-90 active:scale-95 shadow-[0_4px_16px_rgba(74,222,128,0.2)]",
    buttonTextClass: "text-zinc-950 font-bold",
    content: (
      <div className="mx-auto w-full max-w-[285px] rounded-2xl border border-white/[0.08] bg-zinc-950/80 p-4 shadow-xl select-none">
        <div className="mb-4 flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <div className="text-left">
            <span className="inline-block rounded bg-push-dark/10 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-push-dark">
              Chest
            </span>
            <h4 className="text-[12px] font-bold text-foreground">Incline Dumbbell Press</h4>
          </div>
          <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.05]">
            Single Set
          </span>
        </div>

        <div className="space-y-4">
          {/* Steppers Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Weight Stepper Mock */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Weight</span>
              <div className="mt-1 flex items-center justify-between px-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-zinc-400 border border-white/5 transition-all hover:bg-white/10 active:scale-90">
                  <Minus className="h-2.5 w-2.5 text-zinc-400" />
                </span>
                <span className="text-[13px] font-bold text-foreground tabular-nums">24 <span className="text-[9px] font-normal text-zinc-500">kg</span></span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-zinc-400 border border-white/5 transition-all hover:bg-white/10 active:scale-90">
                  <Plus className="h-2.5 w-2.5 text-zinc-400" />
                </span>
              </div>
            </div>

            {/* Reps Stepper Mock */}
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Reps</span>
              <div className="mt-1 flex items-center justify-between px-1">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-zinc-400 border border-white/5 transition-all hover:bg-white/10 active:scale-90">
                  <Minus className="h-2.5 w-2.5 text-zinc-400" />
                </span>
                <span className="text-[13px] font-bold text-foreground tabular-nums">8</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/5 text-zinc-400 border border-white/5 transition-all hover:bg-white/10 active:scale-90">
                  <Plus className="h-2.5 w-2.5 text-zinc-400" />
                </span>
              </div>
            </div>
          </div>

          {/* Large Log Button */}
          <motion.div
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-between rounded-xl border border-pull-dark/30 bg-pull-dark/[0.05] p-2.5 px-3.5 text-xs text-foreground shadow-[0_0_12px_rgba(74,222,128,0.06)]"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pull-dark text-zinc-950">
                <svg className="h-2.5 w-2.5 stroke-[3px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="font-bold text-[10.5px] text-zinc-200">Log Final Working Set</span>
            </div>
            <span className="text-[9px] font-bold text-pull-dark uppercase tracking-wider">Logged</span>
          </motion.div>
        </div>
      </div>
    ),
  },
  {
    id: "progress",
    title: "Track progress",
    subtitle: "",
    description: "Compare today's workout volume directly to your previous session. Simple visual indicators show if you are progressively overloading.",
    icon: BarChart3,
    iconClass: "text-leg-dark",
    barClass: "bg-leg-dark",
    buttonClass: "bg-leg-dark hover:opacity-90 active:scale-95 shadow-[0_4px_16px_rgba(239,68,68,0.2)]",
    buttonTextClass: "text-white font-bold",
    content: (
      <div className="mx-auto w-full max-w-[285px] space-y-3.5 select-none">
        {/* Progress Screen Exercise Card Mockup */}
        <div
          className="relative bg-zinc-900/30 backdrop-blur-md rounded-[18px] px-3.5 py-4 overflow-hidden"
          style={{
            border: "1px solid rgba(249, 217, 73, 0.25)",
            boxShadow: "0 0 0 1px rgba(249, 217, 73, 0.1)"
          }}
        >
          {/* Faint gold tint overlay */}
          <div className="absolute inset-0 bg-push-dark/[0.02] pointer-events-none" />

          <div className="flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 py-0.5">
              <h3 className="text-[12px] font-extrabold text-zinc-100 leading-none tracking-tight">
                Incline Dumbbell Press
              </h3>
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                aria-label="Volume trend up"
              >
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} />
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/40 flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider">Weight</span>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="text-[13px] font-bold text-zinc-100">24</span>
                  <span className="text-[8px] font-medium text-zinc-500">kg</span>
                </div>
              </div>
              <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/40 flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider">Reps</span>
                <span className="text-[13px] font-bold text-zinc-100 mt-0.5">8</span>
              </div>
              <div className="bg-zinc-950/60 rounded-lg p-1.5 border border-zinc-800/40 flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-wider">Sets</span>
                <span className="text-[13px] font-bold text-zinc-100 mt-0.5">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation visual summary */}
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-2.5 px-3 text-left">
          <div className="flex items-center justify-between text-[9px] font-semibold text-zinc-500">
            <span>PROGRESS INDICATOR</span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 shadow-sm">
              <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.75} />
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-center border-t border-white/[0.03] pt-2">
            <div className="text-left">
              <div className="text-[8px] text-zinc-500 font-semibold uppercase leading-none">Today</div>
              <div className="text-[11px] font-bold text-zinc-300 mt-0.5">24 <span className="text-[8px] font-normal text-zinc-500">kg</span></div>
            </div>
            <div className="text-right">
              <div className="text-[8px] text-zinc-500 font-semibold uppercase leading-none">Prev Session</div>
              <div className="text-[11px] font-bold text-zinc-500 mt-0.5">20 <span className="text-[8px] font-normal text-zinc-500">kg</span></div>
            </div>
          </div>
        </div>

        {/* Small disclaimer */}
        <p className="text-[8px] text-zinc-600/70 italic text-center leading-none mt-1">
          *For illustration purposes only
        </p>
      </div>
    ),
  },
]

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()

  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const minSwipeDistance = 45

  const dragX = useMotionValue(0)
  const dragOpacity = useTransform(dragX, [-120, 0, 120], [0.65, 1, 0.65])

  useEffect(() => {
    if (isOpen) setCurrentStep(0)
  }, [isOpen])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }, [currentStep])

  const handleComplete = useCallback(() => {
    if (user?.id) {
      localStorage.setItem(`onboarding-completed-${user.id}`, "true")
    }
    onClose()
  }, [user?.id, onClose])

  const handleNext = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleComplete()
    }
  }, [currentStep, handleComplete])

  const handleDotClick = useCallback((index: number) => {
    setCurrentStep(index)
  }, [])

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null
    touchStartX.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
    if (touchStartX.current !== null && touchEndX.current !== null) {
      dragX.set(touchEndX.current - touchStartX.current)
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

    dragX.set(0)
  }

  const currentData = onboardingSteps[currentStep]
  const isLast = currentStep === onboardingSteps.length - 1
  const isFirst = currentStep === 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        style={{ top: "50%" }}
        className="w-[calc(100%-1rem)] max-w-[360px] overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/98 p-0 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none ring-1 ring-white/5 sm:rounded-[26px] select-none"
      >
        <DialogTitle className="sr-only">Onboarding Guide</DialogTitle>

        {/* Dynamic Glow Overlay - shift color beautifully */}
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-700 ease-in-out"
          style={{
            background: `radial-gradient(circle at top, ${
              currentStep === 0
                ? "rgba(249,217,73,0.06)"
                : currentStep === 1
                ? "rgba(74,222,128,0.06)"
                : "rgba(239,68,68,0.08)"
            }, transparent 45%)`
          }}
        />

        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        {/* Premium Segmented Progress Bar (Apple style) */}
        <div className="absolute top-3.5 left-6 right-6 z-10 flex gap-2">
          {onboardingSteps.map((step, index) => (
            <div key={step.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className={cn("h-full", step.barClass)}
                initial={{ width: "0%" }}
                animate={{
                  width: index < currentStep ? "100%" : index === currentStep ? "100%" : "0%"
                }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              />
            </div>
          ))}
        </div>

        {/* Slider & Swipe Content Container */}
        <motion.div
          className="relative flex min-h-[460px] max-h-[82dvh] flex-col overflow-hidden pt-7 sm:max-h-[75vh]"
          style={{ opacity: dragOpacity }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Horizontal Slide Track */}
          <div className="relative flex-1 overflow-hidden">
            <motion.div
              className="flex h-full w-full touch-none"
              animate={{ x: `-${currentStep * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              {onboardingSteps.map((step) => {
                const StepIcon = step.icon
                return (
                  <div
                    key={step.id}
                    className="flex h-full w-full shrink-0 flex-col px-6 pb-2 pt-5 text-center"
                  >
                    {/* Floating Icon Box */}
                    <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
                      <StepIcon className={cn("h-5.5 w-5.5", step.iconClass)} />
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="space-y-1 mb-4 select-none">
                      <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">
                        Welcome to wrkout
                      </p>
                      <h2 className="text-[1.2rem] font-extrabold tracking-tight text-foreground sm:text-lg">
                        {step.title}
                      </h2>
                      <p className="mx-auto max-w-[260px] text-[11px] leading-relaxed text-zinc-400">
                        {step.description}
                      </p>
                    </div>

                    {/* Component Widget Content */}
                    <div className="flex-1 flex items-center justify-center py-0.5">
                      <div className="w-full">
                        {step.content}
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Footer Controls Container */}
          <div className="px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-4 sm:pb-5">
            {isFirst && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0 }}
                className="mb-3 text-center text-[9px] font-semibold text-zinc-500 uppercase tracking-wider"
              >
                Swipe to continue
              </motion.p>
            )}

            <div className="grid grid-cols-[68px_1fr_88px] items-center gap-3">
              {/* Back / Skip Action */}
              {isFirst ? (
                <button
                  onClick={handleComplete}
                  className="justify-self-start rounded-full border border-white/8 bg-white/[0.02] px-3.5 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"
                >
                  Skip
                </button>
              ) : (
                <motion.button
                  onClick={handlePrev}
                  whileTap={{ scale: 0.94 }}
                  className="flex h-9 w-9 items-center justify-center justify-self-start rounded-full border border-white/8 bg-white/[0.02] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              )}

              {/* Dynamic Sliding Dot Indicators */}
              <div className="flex justify-center gap-2">
                {onboardingSteps.map((_, index) => {
                  const isActive = index === currentStep
                  return (
                    <button
                      key={index}
                      onClick={() => handleDotClick(index)}
                      className="relative h-1.5 focus:outline-none"
                      style={{ width: isActive ? "18px" : "6px" }}
                      aria-label={`Go to step ${index + 1}`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeDot"
                          className={cn("absolute inset-0 rounded-full", currentData.barClass)}
                          transition={{ type: "spring", stiffness: 320, damping: 24 }}
                        />
                      )}
                      <span
                        className={cn(
                          "absolute inset-0 rounded-full transition-colors duration-300",
                          isActive ? "opacity-0" : "bg-white/20 hover:bg-white/35"
                        )}
                      />
                    </button>
                  )
                })}
              </div>

              {/* Next / Start Action */}
              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "justify-self-end flex h-9 items-center gap-1 rounded-full px-4 text-xs font-bold transition-all duration-200",
                  currentData.buttonClass,
                  currentData.buttonTextClass
                )}
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
