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
}

export function NumberStepper({ value, onChange, min, max, step = 1, className }: NumberStepperProps) {
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
          aria-label="Decrease value"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span
          className={cn(
            "text-center font-medium w-12 transition-all text-white",
            isPlaying && "scale-110 text-accent"
          )}
        >
          {value}
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
          aria-label="Increase value"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
