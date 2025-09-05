"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogHeader,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Flame } from "lucide-react"
import { LucideProps } from "lucide-react"
import {
  Dumbbell,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Calendar,
  Plus,
  Minus,
  Activity,
  Timer,
  Award,
  Lightbulb,
  Users,
  Settings,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react"

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon?: React.ComponentType<LucideProps>; // Made icon optional
  color: string;
  content: React.ReactNode;
}

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to wrkout",
    subtitle: "Your minimalist strength companion",
    description: "Designed for progressive overload training with clean, distraction-free tracking based on the PPL (Push, Pull, Legs) split.",
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    content: (
      <div className="space-y-4 text-center pt-8">
        <div className="space-y-5">
          <motion.div 
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Sparkles className="h-10 w-10 text-white" />
          </motion.div>
          
          <div className="space-y-3">
            <motion.div 
              className="flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            >
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
              <span className="text-sm font-medium text-muted-foreground">Progressive Overload</span>
              <div className="w-2 h-2 rounded-full bg-cyan-500" />
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
            >
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-sm font-medium text-muted-foreground">PPL Split</span>
              <div className="w-2 h-2 rounded-full bg-purple-500" />
            </motion.div>
            
            <motion.div 
              className="flex items-center justify-center gap-2.5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5, ease: "easeOut" }}
            >
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="text-sm font-medium text-muted-foreground">Clean Interface</span>
              <div className="w-2 h-2 rounded-full bg-pink-500" />
            </motion.div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "ppl-philosophy",
    title: "Push • Pull • Legs",
    subtitle: "Your evolving training system",
    description: "Built on the proven PPL split with three organizational layers for flexible workout planning.",
    icon: Target,
    color: "from-blue-500 to-cyan-600",
    content: (
      <div className="space-y-3 pt-2">
        <motion.div 
          className="grid grid-cols-1 gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Workout Structure */}
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 flex-shrink-0 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm leading-tight">Workout Routines</h4>
                  <p className="text-xs text-muted-foreground truncate">High-level programs</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-500" />
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-teal-400 to-teal-500" />
              </div>
            </CardContent>
          </Card>

          {/* Workout Days */}
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-600 flex-shrink-0 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm leading-tight">Workout Days</h4>
                  <p className="text-xs text-muted-foreground truncate">Push, Pull, Legs</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500" />
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Exercises */}
          <Card className="border-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-500 to-orange-600 flex-shrink-0 flex items-center justify-center">
                  <Dumbbell className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm leading-tight">Exercises</h4>
                  <p className="text-xs text-muted-foreground truncate">Individual movements</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500" />
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500" />
                <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-rose-400 to-rose-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          className="p-3 rounded-lg bg-muted/50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-medium">Simple Tracking</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Log weights and average reps for simplicity. Sets are consistent at 2-3 per exercise.
          </p>
        </motion.div>
      </div>
    )
  },
  {
    id: "progressive-overload",
    title: "Progressive Overload",
    subtitle: "The key to growth",
    description: "Gradually increase weight or reps to continuously challenge your muscles.",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-600",
    content: (
      <div className="space-y-6 mb-4">
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Progress visualization */}
          <div className="relative h-32 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-4">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl" />
            
            {/* Week markers */}
            <div className="relative h-full flex items-end justify-between">
              {[1, 2, 3, 4].map((week) => (
                <motion.div
                  key={week}
                  className="flex flex-col items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: week * 0.1, duration: 0.6 }}
                >
                  <div 
                    className="w-6 rounded-t-lg bg-gradient-to-t from-emerald-500 to-teal-500"
                    style={{ height: `${20 + week * 15}px` }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">W{week}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
            <Plus className="h-4 w-4 text-emerald-600" />
            <span className="text-sm">Add weight next session</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-950/20">
            <TrendingUp className="h-4 w-4 text-teal-600" />
            <span className="text-sm">Increase reps if weight stays same</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-950/20">
            <Target className="h-4 w-4 text-cyan-600" />
            <span className="text-sm">Track progress with clean charts</span>
          </div>
        </motion.div>
      </div>
    )
  },
  {
    id: "logging-workflow",
    title: "Smart Logging",
    subtitle: "Track what matters",
    description: "Log weights and average reps for simplicity. Sets are consistent at 2-3 per exercise.",
    icon: Zap,
    color: "from-orange-500 to-red-600",
    content: (
      <div className="space-y-4 mb-4">
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Workout completion flow */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0 flex items-center justify-center">
                <Play className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm leading-tight">Complete Workout</h4>
                <p className="text-xs text-muted-foreground truncate">Mark exercises as done</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm leading-tight">Log Performance</h4>
                <p className="text-xs text-muted-foreground truncate">Weight & average reps</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex-shrink-0 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm leading-tight">View Progress</h4>
                <p className="text-xs text-muted-foreground truncate">Charts & trends</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 ml-2" />
          </div>
        </motion.div>

        <motion.div 
          className="p-3 rounded-lg bg-muted/50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
            <span className="text-xs font-medium">Smart Defaults</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Previous weights and reps are pre-filled to speed up logging. Just adjust what changed.
          </p>
        </motion.div>
      </div>
    )
  },
  {
    id: "progress-visualization",
    title: "Progress Charts",
    subtitle: "See your growth",
    description: "Clean, touch-friendly charts showing your strength progression over time based on volume (weight × average reps).",
    icon: BarChart3,
    color: "from-purple-500 to-pink-600",
    content: (
      <div className="space-y-3 mb-4">
        <motion.div 
          className="relative h-32 bg-gradient-to-b from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 rounded-xl flex flex-col justify-start overflow-visible shadow-sm"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Soft vertical bars for days */}
          <div className="absolute inset-x-0 bottom-8 top-2 flex justify-between px-4 pointer-events-none select-none z-0">
            {[0,1,2,3,4,5,6].map(i => (
              <div
                key={i}
                className="h-full w-5 rounded-lg"
                style={{
                  background:
                    i === 4
                      ? 'rgba(180,180,220,0.11)' // Highlight Friday
                      : 'rgba(180,180,220,0.05)'
                }}
              />
            ))}
          </div>
          {/* Single, smooth, thin gradient line */}
          <svg className="relative z-10 w-full h-32" viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2e90fa" />
                <stop offset="0.5" stopColor="#22d3ee" />
                <stop offset="0.85" stopColor="#e056b2" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,40 C40,15 60,65 90,30 S160,10 180,10"
              stroke="url(#chart-gradient)"
              strokeWidth="1.75"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          {/* Weekday labels */}
          <div className="absolute left-0 right-0 bottom-1 h-4 pointer-events-none select-none" style={{ width: '100%' }}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
              const lefts = [20, 70, 115, 165, 215, 260, 307];
              return (
                <span
                  key={i}
                  className={
                    (i === 4 ? "text-zinc-700 dark:text-zinc-50 font-semibold " : "") + "absolute text-[10px] text-zinc-400 font-medium tracking-wide"
                  }
                  style={{
                    left: `${lefts[i]}px`,
                    textAlign: 'center'
                  }}
                >
                  {d}
                </span>
              );
            })}
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-3 gap-1.5 mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/20 dark:to-purple-950/10 border border-purple-100 dark:border-purple-900/30">
            <div className="flex items-center gap-1 mb-1">
              <div className="p-0.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-[9px] font-medium text-muted-foreground">WEIGHT</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-semibold">+5.2</span>
              <span className="text-[9px] text-emerald-500 font-medium">kg</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">This month</p>
          </div>
          
          <div className="p-2 rounded-lg bg-gradient-to-br from-pink-50 to-pink-50/50 dark:from-pink-950/20 dark:to-pink-950/10 border border-pink-100 dark:border-pink-900/30">
            <div className="flex items-center gap-1 mb-1">
              <div className="p-0.5 rounded-md bg-pink-100 dark:bg-pink-900/30">
                <Activity className="h-3 w-3 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-[9px] font-medium text-muted-foreground">REPS</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-semibold">+12</span>
              <span className="text-[9px] text-emerald-500 font-medium">total</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">Last 7 days</p>
          </div>
          
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/20 dark:to-blue-950/10 border border-blue-100 dark:border-blue-900/30">
            <div className="flex items-center gap-1 mb-1">
              <div className="p-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                <Award className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-[9px] font-medium text-muted-foreground">PRs</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm font-semibold">3</span>
              <span className="text-[9px] text-emerald-500 font-medium">new</span>
            </div>
            <p className="text-[9px] text-muted-foreground mt-0.5">This week</p>
          </div>
        </motion.div>

        <motion.div 
          className="p-3 rounded-lg bg-muted/50"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
            <span className="text-xs font-medium">Volume Calculation</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Progress is calculated using volume (weight × average reps) for accurate strength tracking.
          </p>
        </motion.div>
      </div>
    )
  },
  {
    id: "get-started",
    title: "You're All Set!",
    subtitle: "Ready to crush your fitness goals?",
    description: "Your fitness journey starts now. Track, improve, and celebrate your progress with every rep.",
    icon: CheckCircle,
    color: "from-emerald-500 to-teal-600",
    content: (
      <div className="space-y-4 text-center">
        <motion.div 
          className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <CheckCircle className="h-10 w-10 text-white" />
        </motion.div>
        
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h3 className="text-base font-semibold">Start Tracking Your Workouts</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Progress is saved and synced across devices.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 gap-3 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <Zap className="h-5 w-5 mx-auto text-emerald-600 mb-1" />
              <h4 className="font-medium text-sm">Quick Start</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Begin first workout</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-center">
              <Settings className="h-5 w-5 mx-auto text-amber-600 mb-1" />
              <h4 className="font-medium text-sm">Customize</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Set preferences</p>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }
]

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Mark onboarding as completed in localStorage
    if (user?.id) {
      localStorage.setItem(`onboarding-completed-${user.id}`, 'true')
    }
    onClose()
  }

  const handleSkip = () => {
    handleComplete()
  }

  const currentStepData = onboardingSteps[currentStep]
  const isLastStep = currentStep === onboardingSteps.length - 1
  const isFirstStep = currentStep === 0

  const renderIcon = () => {
    const Icon = currentStepData.icon || Sparkles;
    return <Icon className="h-4.5 w-4.5 text-white" />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="w-[calc(100%-1.5rem)] max-w-md p-0 overflow-hidden rounded-3xl shadow-2xl border-0 bg-background/95 backdrop-blur-xl"
        hideCloseButton={true}
      >
        <DialogTitle className="sr-only">Onboarding Guide</DialogTitle>
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted/20 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Header */}
        <div className="p-5 pb-3 pt-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div 
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-lg`}
                key={currentStep}
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {React.cloneElement(renderIcon(), { className: 'h-4.5 w-4.5 text-white' })}
              </motion.div>
              <div>
                <span className="text-xs font-medium text-muted-foreground">
                  {currentStep + 1} of {onboardingSteps.length}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground px-4 py-1.5 h-8 absolute right-4 top-4"
            >
              <span className="text-sm">Skip</span>
            </Button>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 className="text-2xl font-bold mb-2 leading-tight">{currentStepData.title}</h2>
              <p className="text-sm font-medium text-muted-foreground mb-1">{currentStepData.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentStepData.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-[300px]"
            >
              {currentStepData.content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-0.5 space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex-1 h-12 text-sm font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              type="button"
              onClick={handleNext}
              className="flex-1 h-12 text-sm font-medium bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 hover:from-violet-600 hover:via-blue-600 hover:to-emerald-600 transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              {isLastStep ? (
                <span className="flex items-center gap-2">
                  Get Started
                  <Sparkles className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 