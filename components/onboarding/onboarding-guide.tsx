"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth"
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion"
import { ArrowLeft, ArrowRight, BarChart3, BicepsFlexed, Dumbbell, Footprints, Hand, PlusCircle } from "lucide-react"
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
    description: "Organize your routine around Push, Pull, and Legs. Customize it anytime in Settings.",
    icon: Dumbbell,
    iconClass: "text-push-dark",
    barClass: "bg-push-dark",
    buttonClass: "bg-push-dark hover:bg-[#4d3f0a]",
    buttonTextClass: "text-zinc-950",
    content: (
      <div className="mx-auto max-w-[280px] space-y-2.5">
        {[
          {
            label: "Push",
            desc: "Chest • Shoulders • Triceps",
            tone: "bg-push-dark/10 text-push-dark",
            icon: Hand,
          },
          {
            label: "Pull",
            desc: "Back • Biceps • Traps",
            tone: "bg-pull-dark/10 text-pull-dark",
            icon: BicepsFlexed,
          },
          {
            label: "Legs",
            desc: "Quads • Hamstrings • Calves",
            tone: "bg-leg-dark/10 text-leg-dark",
            icon: Footprints,
          },
        ].map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.12 + 0.15, duration: 0.35 }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
          >
            <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full", item.tone)}>
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">{item.label}</div>
              <div className="text-[11px] leading-5 text-zinc-500">{item.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: "logging",
    title: "Log the set",
    subtitle: "",
    description: "Record your final working set.",
    icon: PlusCircle,
    iconClass: "text-pull-dark",
    barClass: "bg-pull-dark",
    buttonClass: "bg-pull-dark hover:bg-[#366b39]",
    buttonTextClass: "text-white",
    content: (
      <div className="mx-auto max-w-[290px] rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Quick log
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Weight", value: "52.5", tone: "text-push-dark" },
            { label: "Reps", value: "8", tone: "text-pull-dark" },
            { label: "Sets", value: "3", tone: "text-leg-dark" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-2 text-center">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">{stat.label}</div>
              <div className={cn("mt-1 text-[15px] font-semibold tabular-nums", stat.tone)}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "progress",
    title: "Track progress",
    subtitle: "",
    description: "See today's logged workout and your volume trend.",
    icon: BarChart3,
    iconClass: "text-leg-dark",
    barClass: "bg-leg-dark",
    buttonClass: "bg-[#8f2f2f] hover:bg-[#b45a5a]",
    buttonTextClass: "text-white",
    content: (
      <div className="mx-auto max-w-[290px] rounded-2xl border border-white/10 bg-zinc-950/60 p-4">
        <div className="space-y-2">
          {[
            "Today: view everything you logged in this session.",
            "Trend: compare workout volume against your most recent logged workout.",
          ].map((item, index) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.12 + 0.15, duration: 0.35 }}
              className="flex items-start gap-2.5 text-sm leading-6 text-zinc-300"
            >
              <span
                className={cn(
                  "mt-2 h-1.5 w-1.5 rounded-full",
                  index === 0 ? "bg-push-dark" : "bg-leg-dark"
                )}
              />
              <span>{item}</span>
            </motion.div>
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
  const minSwipeDistance = 50

  const dragX = useMotionValue(0)
  const dragOpacity = useTransform(dragX, [-100, 0, 100], [0.5, 1, 0.5])

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
        className="w-[calc(100%-1rem)] max-w-[380px] overflow-hidden rounded-[30px] border border-white/12 bg-zinc-950/96 p-0 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-xl outline-none ring-1 ring-white/5 sm:w-[calc(100%-1.5rem)] sm:rounded-[28px]"
      >
        <DialogTitle className="sr-only">Onboarding</DialogTitle>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,217,73,0.05),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/[0.02] to-transparent" />

        <div className="absolute top-0 left-0 right-0 z-10 h-1 bg-white/5">
          <motion.div
            className={cn("h-full", currentData.barClass)}
            animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>

        <motion.div
          className="flex min-h-[520px] max-h-[calc(100dvh-1rem)] flex-col sm:max-h-[88vh]"
          style={{ opacity: dragOpacity }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="relative z-10 px-6 pb-2 pt-8 text-center sm:pt-9">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.09] to-white/[0.03] shadow-[0_12px_34px_rgba(0,0,0,0.22)] ring-1 ring-white/5"
            >
              <currentData.icon className={cn("h-7 w-7", currentData.iconClass)} />
            </motion.div>

            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Welcome to wrkout
            </p>

            <motion.div
              key={`text-${currentStep}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              {currentData.subtitle && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {currentData.subtitle}
                </p>
              )}
              <h2 className="text-[1.35rem] font-semibold tracking-tight text-foreground sm:text-xl">
                {currentData.title}
              </h2>
              <p className="mx-auto flex min-h-[44px] max-w-[290px] items-center justify-center text-[13px] leading-6 text-zinc-400 sm:text-xs">
                {currentData.description}
              </p>
            </motion.div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-2 pt-4 sm:px-6 sm:pt-5">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
                layout="position"
              >
                {currentData.content}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-5 sm:pb-5">
            {isFirst && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mb-3 text-center text-[10px] text-zinc-500"
              >
                Swipe to continue
              </motion.p>
            )}

            <div className="grid grid-cols-[72px_1fr_92px] items-center gap-3">
              {isFirst ? (
                <button
                  onClick={handleComplete}
                  className="justify-self-start rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-200"
                >
                  Skip
                </button>
              ) : (
                <motion.button
                  onClick={handlePrev}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 items-center justify-center justify-self-start rounded-full border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                </motion.button>
              )}

              <div className="flex justify-center gap-1.5">
                {onboardingSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className="group -m-1 p-1.5"
                    aria-label={`Go to step ${index + 1}`}
                  >
                    <span
                      className={cn(
                        "block h-1.5 rounded-full transition-all duration-300 group-hover:scale-110",
                        index === currentStep
                          ? `w-5 ${currentData.barClass}`
                          : "w-1.5 bg-white/20 group-hover:bg-white/35"
                      )}
                    />
                  </button>
                ))}
              </div>

              <motion.button
                onClick={handleNext}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "justify-self-end flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all duration-200 shadow-[0_10px_24px_rgba(0,0,0,0.18)]",
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
