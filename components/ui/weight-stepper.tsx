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
}

export function WeightStepper({ value, onChange, min, max, step = 2.5, className }: WeightStepperProps) {
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
    <div className={cn("space-y-2 w-full", className)}>
      <div className="flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className={cn(
            "h-8 w-8 rounded-full bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-[#1a1a1a]/80 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all",
            isPlaying && "bg-accent/10"
          )}
          aria-label="Decrease weight"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span
          className={cn(
            "text-center font-medium w-16 transition-all text-white",
            isPlaying && "scale-110 text-accent"
          )}
        >
          {value} <span className="text-muted-foreground text-xs">kg</span>
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className={cn(
            "h-8 w-8 rounded-full bg-[#1a1a1a] border-[#1a1a1a] text-white hover:bg-[#1a1a1a]/80 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all",
            isPlaying && "bg-accent/10"
          )}
          aria-label="Increase weight"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}