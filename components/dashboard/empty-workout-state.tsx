"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-context"
import { Dumbbell, Settings } from "lucide-react"
import { getWorkoutDayColor } from "@/lib/utils"

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

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[280px] rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md select-none">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3.5 border shadow-sm transition-colors"
        style={{
          backgroundColor: `color-mix(in srgb, ${dayColor} 10%, #18181b)`,
          borderColor: `color-mix(in srgb, ${dayColor} 22%, #27272a)`,
          color: dayColor
        }}
      >
        <Dumbbell className="h-5 w-5" strokeWidth={1.8} />
      </div>

      <h3 className="text-base font-bold text-zinc-100 mb-1 tracking-tight">
        No exercises in {getCategoryTitle()}
      </h3>

      <p className="text-zinc-400 text-xs max-w-xs mb-4 leading-relaxed font-normal">
        Add exercises in Settings to get started.
      </p>

      {onStart && (
        <Button
          onClick={onStart}
          className="h-8 px-3.5 rounded-xl text-xs font-semibold bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700/70 shadow-sm transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          aria-label={`Open Settings for ${getCategoryTitle()}`}
        >
          <Settings className="h-3.5 w-3.5 text-zinc-400" />
          <span>Open Settings</span>
        </Button>
      )}
    </div>
  )
}
