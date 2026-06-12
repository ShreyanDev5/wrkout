"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useTheme } from "@/components/theme-context"
import { ArrowRight, ArrowUp, ArrowDown, Footprints, Dumbbell } from "lucide-react"
import { getWorkoutDayColor } from "@/lib/utils"

interface EmptyWorkoutStateProps {
  dayId: string
  onStart: () => void
}

export function EmptyWorkoutState({ dayId, onStart }: EmptyWorkoutStateProps) {
  const { colorMode } = useTheme()
  const dayColor = getWorkoutDayColor(dayId, colorMode)

  // Get day name based on dayId
  const getDayName = (id: string) => {
    switch (id.toLowerCase()) {
      case "push":
        return "PUSH"
      case "pull":
        return "PULL"
      case "leg":
        return "LEG"
      default:
        return "workout"
    }
  }

  // Get the appropriate icon based on dayId
  const getIcon = () => {
    switch (dayId.toLowerCase()) {
      case "push":
        return <ArrowUp className="h-8 w-8 modern-icon" style={{ color: dayColor }} aria-hidden="true" />
      case "pull":
        return <ArrowDown className="h-8 w-8 modern-icon" style={{ color: dayColor }} aria-hidden="true" />
      case "leg":
        return <Footprints className="h-8 w-8 modern-icon" style={{ color: dayColor }} aria-hidden="true" />
      default:
        return <Dumbbell className="h-8 w-8 modern-icon" style={{ color: dayColor }} aria-hidden="true" />
    }
  }

  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center h-[400px] border-dashed dark:border-opacity-10">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{ backgroundColor: `color-mix(in srgb, ${dayColor} 8%, transparent)` }}
      >
        {getIcon()}
      </div>

      <h3 className="text-xl font-bold mb-3 line-height-readable">Start your {getDayName(dayId)} workout</h3>

      <p className="text-muted-foreground mb-6 max-w-md line-height-readable text-sm">
        Track your exercises and log your progress. Add exercises in Settings to get started.
      </p>

      <Button
        size="lg"
        onClick={onStart}
        className="min-touch-target focus-visible-ring px-6 text-foreground border shadow-sm transition-all"
        aria-label={`Start ${getDayName(dayId)} workout`}
        style={{
          backgroundColor: `color-mix(in srgb, ${dayColor} 10%, rgba(255, 255, 255, 0.02))`,
          borderColor: `color-mix(in srgb, ${dayColor} 20%, rgba(255, 255, 255, 0.05))`,
          color: dayColor
        }}
      >
        Start <ArrowRight className="ml-2 h-4 w-4 modern-icon" />
      </Button>
    </Card>
  )
}
