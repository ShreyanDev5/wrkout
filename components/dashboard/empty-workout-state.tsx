"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-context"
import { ArrowRight, Settings } from "lucide-react"
import { getWorkoutDayColor, getWorkoutDayIcon } from "@/lib/utils"

interface EmptyWorkoutStateProps {
  dayId: string
  dayName?: string
  onStart?: () => void
}

export function EmptyWorkoutState({ dayId, dayName, onStart }: EmptyWorkoutStateProps) {
  const { colorMode } = useTheme()
  const dayColor = getWorkoutDayColor(dayId, colorMode)

  // Get human-friendly day title
  const getCategoryTitle = () => {
    if (dayName && dayName.trim()) {
      if (dayName.toLowerCase().includes("flex")) return "Custom Day"
      return dayName
    }
    switch (dayId.toLowerCase()) {
      case "push":
        return "Push Day"
      case "pull":
        return "Pull Day"
      case "leg":
      case "legs":
        return "Legs Day"
      case "flex":
      case "flexible":
      case "custom":
        return "Custom Day"
      default:
        return `${dayId.charAt(0).toUpperCase() + dayId.slice(1)} Workout`
    }
  }

  // Get exercise type label for the description
  const getExerciseTypeLabel = () => {
    if (dayName && dayName.trim()) {
      if (dayName.toLowerCase().includes("flex")) return "Custom"
      const cleaned = dayName.replace(/day|workout/gi, "").trim()
      return cleaned || dayName
    }
    switch (dayId.toLowerCase()) {
      case "push":
        return "Push"
      case "pull":
        return "Pull"
      case "leg":
      case "legs":
        return "Leg"
      case "flex":
      case "flexible":
      case "custom":
        return "Custom"
      default:
        return dayId.charAt(0).toUpperCase() + dayId.slice(1)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px] rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border border-zinc-800 shadow-sm"
        style={{
          backgroundColor: `color-mix(in srgb, ${dayColor} 12%, #18181b)`,
          borderColor: `color-mix(in srgb, ${dayColor} 25%, #27272a)`,
          color: dayColor
        }}
      >
        {getWorkoutDayIcon(dayId, true, "h-7 w-7")}
      </div>

      <h3 className="text-lg font-bold text-zinc-100 mb-1.5 tracking-tight">
        No exercises in {getCategoryTitle()}
      </h3>

      <p className="text-zinc-400 text-xs max-w-xs mb-5 leading-snug font-medium">
        Add {getExerciseTypeLabel()} exercises in Settings to get started.
      </p>

      {onStart && (
        <Button
          onClick={onStart}
          className="h-9 px-4 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 shadow-sm transition-all flex items-center gap-2 active:scale-95"
          aria-label={`Open Settings for ${getCategoryTitle()}`}
        >
          <Settings className="h-3.5 w-3.5 text-zinc-400" />
          <span>Open Settings</span>
        </Button>
      )}
    </div>
  )
}
