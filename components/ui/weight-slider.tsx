"use client"
import { Slider } from "@/components/ui/slider"
import { useAudioFeedback } from "@/hooks/use-audio-feedback"
import { cn } from "@/lib/utils"
import { useEffect, useRef } from "react"

interface WeightSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  label?: string
  className?: string
}

export function WeightSlider({
  value,
  onChange,
  min,
  max,
  step,
  label = "Weight",
  className = "",
}: WeightSliderProps) {
  const { playSound, isPlaying } = useAudioFeedback({ debounceMs: 50 })
  const lastValueRef = useRef(value)

  // Handle value change with audio feedback
  const handleChange = (values: number[]) => {
    const newValue = values[0]

    // Only play sound if the value has actually changed
    if (newValue !== lastValueRef.current) {
      playSound()
      lastValueRef.current = newValue
      onChange(newValue)
    }
  }

  // Update lastValueRef when value prop changes externally
  useEffect(() => {
    lastValueRef.current = value
  }, [value])

  return (
    <div className={`space-y-2 w-full px-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-white">{label}</label>
        <span
          className={cn(
            "text-sm font-medium transition-all text-white",
            isPlaying && "scale-110 text-accent"
          )}
        >
          {value} <span className="text-muted-foreground">kg</span>
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleChange}
        className={cn(
          "cursor-pointer rounded-full",
          isPlaying && "slider-active"
        )}
        trackClassName="h-2 rounded-full bg-[#1a1a1a]"
        thumbClassName={cn(
          "h-4 w-4 rounded-full border-2 border-[#1a1a1a] bg-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 transition-all",
          isPlaying && "scale-110"
        )}
      />
    </div>
  )
}
