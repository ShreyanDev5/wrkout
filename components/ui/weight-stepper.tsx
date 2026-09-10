"use client"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioFeedback } from "@/hooks/use-audio-feedback"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface WeightStepperProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  className?: string
  dayColor?: string
  size?: "default" | "large"
}

export function WeightStepper({ value, onChange, min, max, step = 2.5, className, dayColor, size = "default" }: WeightStepperProps) {
  const { playSound, isPlaying } = useAudioFeedback({ debounceMs: 100 })
  const lastValueRef = useRef(value)

  // Update lastValueRef when value prop changes externally
  useEffect(() => {
    lastValueRef.current = value
  }, [value])

  const increment = () => {
    if (value < max) {
      const newValue = Math.min(max, Number((value + step).toFixed(1)))

      // Only play sound and update if the value actually changes
      if (newValue !== lastValueRef.current) {
        playSound()
        lastValueRef.current = newValue
        onChange(newValue)
      }
    }
  }

  const decrement = () => {
    if (value > min) {
      const newValue = Math.max(min, Number((value - step).toFixed(1)))

      // Only play sound and update if the value actually changes
      if (newValue !== lastValueRef.current) {
        playSound()
        lastValueRef.current = newValue
        onChange(newValue)
      }
    }
  }

  return (
    <div
      className={cn(
        "w-full flex items-center justify-between px-1.5 bg-black/40 rounded-xl border border-white/[0.08] transition-all",
        size === "large" ? "h-11" : "h-10",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={decrement}
        disabled={value <= min}
        className={cn(
          "rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.14] active:scale-90 transition-all duration-150 flex-shrink-0 disabled:opacity-25 disabled:pointer-events-none cursor-pointer",
          size === "large" ? "h-8 w-8" : "h-7 w-7",
          isPlaying && "bg-accent/20 text-accent"
        )}
        aria-label="Decrease weight"
      >
        <Minus className={cn(size === "large" ? "h-4 w-4" : "h-3.5 w-3.5")} />
      </Button>

      <div className="flex flex-col items-center justify-center px-1 truncate select-none">
        <span
          className={cn(
            "font-bold tracking-tight transition-all",
            size === "large"
              ? (value === 0 ? "text-lg sm:text-xl tracking-normal" : "text-xl sm:text-2xl")
              : (value === 0 ? "text-sm sm:text-base tracking-normal" : "text-base sm:text-lg")
          )}
          style={{ color: dayColor }}
        >
          {value === 0 ? "B.W." : value}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={increment}
        disabled={value >= max}
        className={cn(
          "rounded-md text-zinc-400 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.14] active:scale-90 transition-all duration-150 flex-shrink-0 disabled:opacity-25 disabled:pointer-events-none cursor-pointer",
          size === "large" ? "h-8 w-8" : "h-7 w-7",
          isPlaying && "bg-accent/20 text-accent"
        )}
        aria-label="Increase weight"
      >
        <Plus className={cn(size === "large" ? "h-4 w-4" : "h-3.5 w-3.5")} />
      </Button>
    </div>
  )
}