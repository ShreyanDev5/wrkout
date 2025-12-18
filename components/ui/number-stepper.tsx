"use client"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAudioFeedback } from "@/hooks/use-audio-feedback"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  className?: string
  dayColor?: string
}

export function NumberStepper({ value, onChange, min, max, step = 1, className, dayColor }: NumberStepperProps) {
  const { playSound, isPlaying } = useAudioFeedback({ debounceMs: 100 })
  const lastValueRef = useRef(value)

  // Update lastValueRef when value prop changes externally
  useEffect(() => {
    lastValueRef.current = value
  }, [value])

  const increment = () => {
    if (value < max) {
      const newValue = Math.min(max, value + step)

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
      const newValue = Math.max(min, value - step)

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
      <div className="flex items-center justify-between px-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className={cn(
            "h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all active:scale-95",
            isPlaying && "bg-accent/20 text-accent"
          )}
          aria-label="Decrease value"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="text-lg font-medium tracking-tight" style={{ color: dayColor }}>
          {value}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className={cn(
            "h-7 w-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all active:scale-95",
            isPlaying && "bg-accent/20 text-accent"
          )}
          aria-label="Increase value"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
