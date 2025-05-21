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
  label?: string
  accentColor?: string
}

export function NumberStepper({ value, onChange, min, max, step = 1, label = "", accentColor }: NumberStepperProps) {
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
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-muted-foreground">{label}</label>}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={value <= min}
          className={cn("h-8 w-8 rounded-md transition-all", isPlaying && "bg-accent/10")}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span
          className={cn("text-center font-medium w-12 transition-all", isPlaying && "scale-110 text-accent")}
          style={isPlaying ? { color: accentColor } : undefined}
        >
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={value >= max}
          className={cn("h-8 w-8 rounded-md transition-all", isPlaying && "bg-accent/10")}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
