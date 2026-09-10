"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { motion, useMotionValue, useTransform } from "framer-motion"
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Dumbbell,
  Minus,
  Plus,
  TrendingUp,
} from "lucide-react"
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
    description: "Organize your routines and split days in Settings.",
    icon: Dumbbell,
    iconClass: "text-push-dark",
    barClass: "bg-push-dark",
    buttonClass: "bg-push-dark hover:opacity-90 active:scale-95 shadow-sm",
    buttonTextClass: "text-white font-bold",
    content: (
      <div className="mx-auto w-full max-w-[285px] select-none text-left">
        {/* Routines Card Mockup */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3 shadow-sm space-y-2">
          {/* Routine Header */}
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11.5px] font-bold text-zinc-100 tracking-tight">
              Routine 1
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 rotate-180" />
          </div>

          {/* Divider matching settings screen */}
          <div className="w-full h-px bg-zinc-800/80 mb-1.5" />

          {/* Routine Days Stack - All Collapsed */}
          <div className="space-y-1.5">
            {/* Push Day - Collapsed */}
            <div
              className="flex items-center justify-between py-1.5 px-2.5 rounded-[9px] border border-zinc-700/60 bg-zinc-800/70"
              style={{ borderLeftWidth: "3px", borderLeftColor: "hsl(var(--push-dark))" }}
            >
              <span className="text-[11px] font-semibold text-zinc-100">Push Day</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </div>

            {/* Pull Day - Collapsed */}
            <div
              className="flex items-center justify-between py-1.5 px-2.5 rounded-[9px] border border-zinc-700/60 bg-zinc-800/70"
              style={{ borderLeftWidth: "3px", borderLeftColor: "hsl(var(--pull-dark))" }}
            >
              <span className="text-[11px] font-semibold text-zinc-100">Pull Day</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </div>

            {/* Legs Day - Collapsed */}
            <div
              className="flex items-center justify-between py-1.5 px-2.5 rounded-[9px] border border-zinc-700/60 bg-zinc-800/70"
              style={{ borderLeftWidth: "3px", borderLeftColor: "hsl(var(--leg-dark))" }}
            >
              <span className="text-[11px] font-semibold text-zinc-100">Legs Day</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </div>

            {/* Flex Day - Collapsed */}
            <div
              className="flex items-center justify-between py-1.5 px-2.5 rounded-[9px] border border-zinc-700/60 bg-zinc-800/70"
              style={{ borderLeftWidth: "3px", borderLeftColor: "hsl(var(--flex-dark))" }}
            >
              <span className="text-[11px] font-semibold text-zinc-100">Flex Day</span>
              <ChevronDown className="h-3 w-3 text-zinc-400" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "logging",
    title: "Log the set",
    subtitle: "",
    description: "Record your weight, reps, and sets in seconds.",
    icon: CheckCircle2,
    iconClass: "text-pull-dark",
    barClass: "bg-pull-dark",
    buttonClass: "bg-pull-dark hover:opacity-90 active:scale-95 shadow-sm",
    buttonTextClass: "text-zinc-950 font-bold",
    content: (
      <div className="mx-auto w-full max-w-[305px] select-none text-left">
        {/* Exercise Row + Expanded Logger Container */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 backdrop-blur-xl p-3 shadow-sm space-y-2.5">
          {/* Exercise Header Row */}
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-[6px]"
                style={{
                  backgroundColor: "hsl(var(--pull-dark))",
                }}
              >
                <Check className="h-3.5 w-3.5 stroke-[3.5px] text-zinc-950" />
              </span>
              <span className="text-xs font-bold text-white tracking-tight truncate">Lat Pulldown</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-300 rotate-180 flex-shrink-0 ml-1.5" />
          </div>

          {/* Stepper Controls */}
          <div className="space-y-2">
            {/* Top Row: Weight & Reps */}
            <div className="grid grid-cols-2 gap-2">
              {/* Weight */}
              <div className="space-y-1">
                <span className="text-[10.5px] font-medium text-zinc-400 block text-center">
                  Weight (kg)
                </span>
                <div className="flex h-9 items-center justify-between rounded-[10px] border border-white/[0.06] bg-black/35 px-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400">
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-bold text-pull-dark tabular-nums">65</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Reps */}
              <div className="space-y-1">
                <span className="text-[10.5px] font-medium text-zinc-400 block text-center">
                  Reps
                </span>
                <div className="flex h-9 items-center justify-between rounded-[10px] border border-white/[0.06] bg-black/35 px-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400">
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-bold text-pull-dark tabular-nums">10</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Row: Sets & Done */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {/* Sets */}
              <div className="space-y-1">
                <span className="text-[10.5px] font-medium text-zinc-400 block text-center">
                  Sets
                </span>
                <div className="flex h-9 items-center justify-between rounded-[10px] border border-white/[0.06] bg-black/35 px-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400">
                    <Minus className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm font-bold text-pull-dark tabular-nums">3</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-400">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Done Button */}
              <div className="flex flex-col justify-end">
                <div
                  style={{
                    backgroundColor: "color-mix(in srgb, hsl(var(--pull-dark)) 24%, #18181b)",
                    borderColor: "color-mix(in srgb, hsl(var(--pull-dark)) 45%, #27272a)",
                    color: "hsl(var(--pull-dark))",
                  }}
                  className="flex h-9 w-full items-center justify-center gap-1.5 rounded-[10px] border font-bold text-xs shadow-sm cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span className="font-bold text-xs tracking-wide">DONE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "progress",
    title: "Track progress",
    subtitle: "",
    description: "Track volume and performance trends across workouts.",
    icon: TrendingUp,
    iconClass: "text-leg-dark",
    barClass: "bg-leg-dark",
    buttonClass: "bg-leg-dark hover:opacity-90 active:scale-95 shadow-sm",
    buttonTextClass: "text-white font-bold",
    content: (
      <div className="mx-auto w-full max-w-[305px] space-y-2.5 select-none text-left">
        {/* Session Summary Strip - Aligned with Progress Screen */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/70 border border-zinc-800/90 text-xs select-none shadow-sm whitespace-nowrap">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-bold text-white tracking-tight">1</span>
            <span className="text-zinc-400 font-medium">Exercise</span>
          </div>
          <span className="text-zinc-600 font-bold flex-shrink-0">•</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-bold text-white tracking-tight">3</span>
            <span className="text-zinc-400 font-medium">Sets</span>
          </div>
          <span className="text-zinc-600 font-bold flex-shrink-0">•</span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="font-bold text-white tracking-tight">1,800</span>
            <span className="text-zinc-400 font-medium">
              <span className="sm:hidden">kg Vol</span>
              <span className="hidden sm:inline">kg Volume</span>
            </span>
          </div>
        </div>

        {/* Progress Exercise Card - Clean 3-Column Stats Row */}
        <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-sm p-3 space-y-2">
          <div className="flex items-center justify-between gap-2 min-h-5 px-0.5">
            <h3 className="text-xs font-bold text-zinc-100 tracking-tight truncate flex-1 min-w-0">
              Squat
            </h3>
            <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 select-none">
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.25} />
            </span>
          </div>

          {/* Borderless 3-Column Stats Row */}
          <div className="grid grid-cols-3 pt-2 border-t border-zinc-800/70">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10.5px] font-medium text-zinc-400">Weight</span>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="text-sm font-bold text-white tracking-tight">60</span>
                <span className="text-[10px] font-medium text-zinc-400">kg</span>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10.5px] font-medium text-zinc-400">Reps</span>
              <span className="text-sm font-bold text-white tracking-tight mt-0.5">10</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10.5px] font-medium text-zinc-400">Sets</span>
              <span className="text-sm font-bold text-white tracking-tight mt-0.5">3</span>
            </div>
          </div>
        </div>

        {/* Trend Indicators Breakdown */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2 px-2.5 min-h-[42px]">
            <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <ArrowUpRight className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold text-zinc-200 leading-tight">Higher volume</div>
              <div className="text-[8.5px] text-zinc-400 font-medium leading-tight mt-0.5">Weight or reps up</div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2 px-2.5 min-h-[42px]">
            <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
              <ArrowDownRight className="h-2.5 w-2.5" strokeWidth={2.5} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold text-zinc-200 leading-tight">Lower volume</div>
              <div className="text-[8.5px] text-zinc-400 font-medium leading-tight mt-0.5">Weight or reps down</div>
            </div>
          </div>
        </div>
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
        centerMobile={true}
        className="w-[calc(100%-1.5rem)] max-w-[360px] overflow-hidden rounded-2xl border border-zinc-800/90 bg-zinc-950/95 p-0 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-2xl outline-none select-none my-auto"
      >
        <DialogTitle className="sr-only">Onboarding Guide</DialogTitle>

        {/* Segmented Progress Bar */}
        <div className="absolute top-3.5 left-6 right-6 z-10 flex gap-2">
          {onboardingSteps.map((step, index) => (
            <div key={step.id} className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800/80">
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
          className="relative flex min-h-[385px] max-h-[82dvh] flex-col overflow-hidden pt-7 sm:max-h-[75vh]"
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
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800/90 bg-zinc-900/80 shadow-sm">
                      <StepIcon className={cn("h-5 w-5", step.iconClass)} />
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="space-y-1 mb-4 select-none">
                      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white">
                        {step.title}
                      </h2>
                      <p className="mx-auto max-w-[290px] w-full px-2 text-xs font-medium leading-snug text-zinc-400 text-center">
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
          <div className="px-6 pb-5 pt-3">
            <div className="grid grid-cols-[72px_1fr_72px] items-center gap-2">
              {/* Back / Skip Action */}
              {isFirst ? (
                <button
                  onClick={handleComplete}
                  className="justify-self-start flex h-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer active:scale-95"
                >
                  Skip
                </button>
              ) : (
                <motion.button
                  onClick={handlePrev}
                  whileTap={{ scale: 0.94 }}
                  className="justify-self-start flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
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
                      className="relative h-1.5 focus:outline-none cursor-pointer"
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
                          isActive ? "opacity-0" : "bg-zinc-800 hover:bg-zinc-700"
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
                  "justify-self-end flex h-8 items-center justify-center gap-1 rounded-full px-3.5 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shadow-sm",
                  currentData.buttonClass,
                  currentData.buttonTextClass
                )}
              >
                <span>{isLast ? "Start" : "Next"}</span>
                {!isLast && <ArrowRight className="h-3 w-3" />}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
