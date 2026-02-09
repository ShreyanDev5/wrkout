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
    <div className={cn("space-y-2 w-full bg-secondary/20 rounded-2xl py-1.5 px-0.5 border border-white/5", className)}>
      <div className="flex items-center justify-between px-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className={cn(
            "rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all active:scale-95",
            size === "large" ? "h-8 w-8" : "h-7 w-7",
            isPlaying && "bg-accent/20 text-accent"
          )}
          aria-label="Decrease weight"
        >
          <Minus className={cn(size === "large" ? "h-5 w-5" : "h-4 w-4")} />
        </Button>

        <div className="flex flex-col items-center justify-center">
          <span
            className={cn(
              "font-medium tracking-tight transition-all",
              size === "large"
                ? (value === 0 ? "text-xl tracking-normal" : "text-2xl")
                : (value === 0 ? "text-base tracking-normal" : "text-lg")
            )
            }
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
            "rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all active:scale-95",
            size === "large" ? "h-8 w-8" : "h-7 w-7",
            isPlaying && "bg-accent/20 text-accent"
          )}
          aria-label="Increase weight"
        >
          <Plus className={cn(size === "large" ? "h-5 w-5" : "h-4 w-4")} />
        </Button>
      </div>
    </div>
  )
}