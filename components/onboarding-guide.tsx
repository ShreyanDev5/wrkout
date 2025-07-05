"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useTheme } from "@/components/theme-context"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dumbbell,
  BarChart3,
  Settings,
  ArrowUp,
  ArrowDown,
  Footprints,
  CheckCircle,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
  Zap,
} from "lucide-react"

interface OnboardingGuideProps {
  isOpen: boolean
  onClose: () => void
}

const onboardingSteps = [
  {
    id: "welcome",
    title: "Welcome to wrkout! 💪",
    description: "Your minimalist workout tracker designed for strength training progress. Let's get you started with the basics.",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    content: (
      <div className="space-y-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <p className="text-muted-foreground">
          Track your workouts, monitor progress, and achieve your fitness goals with our clean, distraction-free interface.
        </p>
      </div>
    )
  },
  {
    id: "workout-tracking",
    title: "Track Your Workouts",
    description: "Log your Push, Pull, and Legs workouts with ease. Mark exercises as complete and track your progress.",
    icon: Dumbbell,
    color: "from-blue-500 to-cyan-500",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20">
            <ArrowUp className="h-6 w-6 text-red-500 mb-2" />
            <span className="text-xs font-medium text-red-500">Push</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
            <ArrowDown className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-xs font-medium text-blue-500">Pull</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
            <Footprints className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-xs font-medium text-green-500">Legs</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Mark exercises as complete</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="text-sm">Track sets, reps, and weights</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span className="text-sm">Quick and intuitive logging</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "progress-tracking",
    title: "Monitor Your Progress",
    description: "Visualize your strength gains with interactive charts and detailed monthly summaries.",
    icon: BarChart3,
    color: "from-green-500 to-emerald-500",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
            <h4 className="font-semibold text-sm mb-1">Progress Charts</h4>
            <p className="text-xs text-muted-foreground">Track your strength progression over time</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <Calendar className="h-8 w-8 text-blue-500 mb-2" />
            <h4 className="font-semibold text-sm mb-1">Monthly Summaries</h4>
            <p className="text-xs text-muted-foreground">Review your workout frequency and achievements</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <span className="text-sm">Interactive progress visualization</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Target className="h-5 w-5 text-blue-500" />
            <span className="text-sm">Track personal records and milestones</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "customization",
    title: "Customize Your Experience",
    description: "Set up your workouts, add exercises, and personalize your training routine.",
    icon: Settings,
    color: "from-orange-500 to-red-500",
    content: (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <Dumbbell className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium">Create custom workouts</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <Target className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium">Add your favorite exercises</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <Settings className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-medium">Organize your training split</span>
          </div>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            Perfect for Push-Pull-Legs (PPL) routines and other strength training programs
          </p>
        </div>
      </div>
    )
  },
  {
    id: "get-started",
    title: "You're All Set! 🚀",
    description: "Ready to start your fitness journey? Your data is automatically saved and synced across devices.",
    icon: CheckCircle,
    color: "from-emerald-500 to-teal-500",
    content: (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Your progress is automatically saved</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Sync across all your devices</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm">Clean, distraction-free interface</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Start by adding your first workout in the Settings tab, then begin tracking your progress!
        </p>
      </div>
    )
  }
]

export function OnboardingGuide({ isOpen, onClose }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [api, setApi] = useState<any>(null)
  const { colorMode } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
      if (api) {
        api.scrollTo(0)
      }
    }
  }, [isOpen, api])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      api?.scrollNext()
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      api?.scrollPrev()
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw] p-0 overflow-hidden">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center`}>
                  <currentStepData.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentStep + 1} of {onboardingSteps.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
            </div>
            
            <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
            <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
          </div>

          {/* Carousel Content */}
          <div className="px-6 pb-6">
            <Carousel
              setApi={setApi}
              className="w-full"
              opts={{
                align: "start",
                loop: false,
              }}
            >
              <CarouselContent>
                {onboardingSteps.map((step, index) => (
                  <CarouselItem key={step.id}>
                    <div className="min-h-[300px] flex items-center">
                      {step.content}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Sparkles className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowUp className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 