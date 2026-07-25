"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, BicepsFlexed, Dot, Dumbbell, Footprints, Hand, Minus, Plus, PlusCircle, TrendingUp, Zap } from "lucide-react"
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
    description: "Organize Push, Pull, Legs, and Custom days in Settings.",
    icon: Dumbbell,
    iconClass: "text-push-dark",
    barClass: "bg-push-dark",
    buttonClass: "bg-push-dark hover:opacity-90 active:scale-95 shadow-sm",
    buttonTextClass: "text-white font-bold",
    content: (
      <div className="mx-auto w-full max-w-[305px] space-y-3 select-none">
        {/* Weekly Calendar Widget - Symmetrical Sunday Custom */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3">
          <div className="mb-2 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-400">
            Weekly Split Schedule
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {[
              { day: "M", type: "Push", color: "bg-push-dark text-white font-bold" },
              { day: "T", type: "Rest", color: "bg-zinc-800/60 text-zinc-500" },
              { day: "W", type: "Pull", color: "bg-pull-dark text-zinc-950 font-bold" },
              { day: "T", type: "Rest", color: "bg-zinc-800/60 text-zinc-500" },
              { day: "F", type: "Legs", color: "bg-leg-dark text-white font-bold" },
              { day: "S", type: "Rest", color: "bg-zinc-800/60 text-zinc-500" },
              { day: "S", type: "Custom", color: "bg-flex-dark text-white font-bold" },
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

        {/* Split cards list - Clean & Uncluttered Descriptions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Push",
              desc: "Chest & Delts",
              tone: "bg-push-dark/15 text-push-dark border-push-dark/30",
              icon: Hand,
            },
            {
              label: "Pull",
              desc: "Back & Biceps",
              tone: "bg-pull-dark/15 text-pull-dark border-pull-dark/30",
              icon: BicepsFlexed,
            },
            {
              label: "Legs",
              desc: "Quads & Calves",
              tone: "bg-leg-dark/15 text-leg-dark border-leg-dark/30",
              icon: Footprints,
            },
            {
              label: "Custom",
              desc: "Arms & Core",
              tone: "bg-flex-dark/15 text-flex-dark border-flex-dark/30",
              icon: Zap,
            },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 + 0.1, duration: 0.3 }}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 px-2.5 min-h-[50px]"
            >
              <span className={cn("inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border", item.tone)}>
                <item.icon className="h-3.5 w-3.5" fill={item.label === "Custom" ? "currentColor" : "none"} aria-hidden="true" />
              </span>
              <div className="text-left min-w-0 flex-1">
                <div className="text-[11px] font-bold text-foreground leading-none">{item.label}</div>
                <div className="text-[9.5px] text-zinc-400 font-medium leading-tight mt-1 break-words">{item.desc}</div>
              </div>
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
    description: "Record weight, reps, and target sets in one clean entry.",
    icon: PlusCircle,
    iconClass: "text-pull-dark",
    barClass: "bg-pull-dark",
    buttonClass: "bg-pull-dark hover:opacity-90 active:scale-95 shadow-sm",
    buttonTextClass: "text-zinc-950 font-bold",
    content: (
      <div className="mx-auto w-full max-w-[305px] rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5 select-none">
        {/* Exercise Header - Sleek reduced checkmark icon before name & no Pull tag */}
        <div className="mb-3 flex items-center gap-2 border-b border-zinc-800 pb-2">
          <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-pull-dark text-zinc-950">
            <svg className="h-2.5 w-2.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <h4 className="text-xs font-extrabold text-white tracking-tight">Lat Pulldown</h4>
        </div>

        {/* Exact Replica of Inline Workout Logger UI */}
        <div className="space-y-2.5">
          {/* Top Row: Weight & Reps */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Weight Stepper */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block text-center w-full">Weight (KG)</span>
              <div className="flex h-9 items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/90 px-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  <Minus className="h-3 w-3" />
                </span>
                <span className="text-xs font-bold text-white tabular-nums">65</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  <Plus className="h-3 w-3" />
                </span>
              </div>
            </div>

            {/* Reps Stepper */}
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block text-center w-full">Reps</span>
              <div className="flex h-9 items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/90 px-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  <Minus className="h-3 w-3" />
                </span>
                <span className="text-xs font-bold text-white tabular-nums">10</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  <Plus className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Sets & Done Button */}
          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
            {/* Sets Stepper */}
            <div className="flex flex-col justify-end space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 block text-center w-full">Sets</span>
              <div className="flex h-9 items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/90 px-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  <Minus className="h-3 w-3" />
                </span>
                <span className="text-xs font-bold text-white tabular-nums">3</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  <Plus className="h-3 w-3" />
                </span>
              </div>
            </div>

            {/* Done Button - Exact Styling Match */}
            <div className="flex flex-col justify-end">
              <div
                style={{
                  backgroundColor: "color-mix(in srgb, hsl(var(--pull-dark)) 14%, transparent)",
                  borderColor: "color-mix(in srgb, hsl(var(--pull-dark)) 30%, transparent)",
                  color: "hsl(var(--pull-dark))"
                }}
                className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border font-bold text-xs shadow-none cursor-pointer"
              >
                <svg className="h-3.5 w-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-bold text-xs tracking-wide">DONE</span>
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
    description: "Track progressive overload with visual trend indicators.",
    icon: TrendingUp,
    iconClass: "text-leg-dark",
    barClass: "bg-leg-dark",
    buttonClass: "bg-leg-dark hover:opacity-90 active:scale-95 shadow-sm",
    buttonTextClass: "text-white font-bold",
    content: (
      <div className="mx-auto w-full max-w-[305px] space-y-3 select-none">
        {/* Progress Exercise Card Mockup */}
        <div
          className="relative bg-zinc-900/60 rounded-2xl p-3 border overflow-hidden backdrop-blur-md"
          style={{
            borderColor: "color-mix(in srgb, hsl(var(--leg-dark)) 25%, #27272a)",
            backgroundColor: "color-mix(in srgb, hsl(var(--leg-dark)) 6%, #18181b)",
          }}
        >
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-leg-dark flex-shrink-0" />
                <h3 className="text-xs font-bold text-white leading-none tracking-tight truncate">
                  Barbell Squat
                </h3>
              </div>
              <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-900/80 text-zinc-400">
                <ArrowUpRight className="h-3 w-3" strokeWidth={2.25} />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-zinc-950/85 rounded-xl p-1.5 border border-zinc-800/90 flex flex-col items-center justify-center">
                <span className="text-[9px] font-semibold text-zinc-400">Weight</span>
                <div className="flex items-baseline gap-0.5 mt-0.5">
                  <span className="text-xs font-bold text-white">100</span>
                  <span className="text-[8px] font-medium text-zinc-400">kg</span>
                </div>
              </div>
              <div className="bg-zinc-950/85 rounded-xl p-1.5 border border-zinc-800/90 flex flex-col items-center justify-center">
                <span className="text-[9px] font-semibold text-zinc-400">Reps</span>
                <span className="text-xs font-bold text-white mt-0.5">6</span>
              </div>
              <div className="bg-zinc-950/85 rounded-xl p-1.5 border border-zinc-800/90 flex flex-col items-center justify-center">
                <span className="text-[9px] font-semibold text-zinc-400">Sets</span>
                <span className="text-xs font-bold text-white mt-0.5">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decluttered Clean 4 Trend Indicators Breakdown Guide */}
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              icon: ArrowUpRight,
              label: "Volume Up",
              desc: "More weight/reps",
            },
            {
              icon: ArrowRight,
              label: "Same Volume",
              desc: "Same performance",
            },
            {
              icon: ArrowDownRight,
              label: "Volume Down",
              desc: "Less weight/reps",
            },
            {
              icon: Dot,
              label: "New Exercise",
              desc: "First log entry",
            },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-2 px-2.5 min-h-[44px]">
              <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-950 text-zinc-300">
                <item.icon className="h-2.5 w-2.5" strokeWidth={2.5} />
              </span>
              <div className="text-left min-w-0">
                <div className="text-[10px] font-bold text-zinc-200 leading-none">{item.label}</div>
                <div className="text-[8.5px] text-zinc-400 font-medium leading-tight mt-1 break-words">{item.desc}</div>
              </div>
            </div>
          ))}
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
        className="w-[calc(100%-1.5rem)] max-w-[360px] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-0 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl outline-none select-none my-auto"
      >
        <DialogTitle className="sr-only">Onboarding Guide</DialogTitle>

        {/* Segmented Progress Bar */}
        <div className="absolute top-3.5 left-6 right-6 z-10 flex gap-2">
          {onboardingSteps.map((step, index) => (
            <div key={step.id} className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
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
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 shadow-sm">
                      <StepIcon className={cn("h-5 w-5", step.iconClass)} />
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="space-y-1 mb-5 select-none">
                      <h2 className="text-[1.2rem] font-extrabold tracking-tight text-foreground sm:text-lg">
                        {step.title}
                      </h2>
                      <p className="mx-auto max-w-[280px] w-full px-1 text-[11px] font-medium leading-relaxed text-zinc-400">
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
          <div className="px-6 pb-5 pt-4">
            <div className="grid grid-cols-[68px_1fr_88px] items-center gap-3">
              {/* Back / Skip Action */}
              {isFirst ? (
                <button
                  onClick={handleComplete}
                  className="justify-self-start rounded-full border border-zinc-800 bg-zinc-900/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 cursor-pointer"
                >
                  Skip
                </button>
              ) : (
                <motion.button
                  onClick={handlePrev}
                  whileTap={{ scale: 0.94 }}
                  className="flex h-9 w-9 items-center justify-center justify-self-start rounded-full border border-zinc-800 bg-zinc-900/80 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white cursor-pointer"
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
                  "justify-self-end flex h-9 items-center justify-center gap-1 rounded-full px-4 text-xs font-bold transition-all duration-200 cursor-pointer",
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
