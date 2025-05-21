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
  accentColor?: string
}

export function WeightSlider({
  value,
  onChange,
  min,
  max,
  step,
  label = "Weight",
  className = "",
  accentColor,
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
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-muted-foreground">{label}</label>
        <span
          className={cn("text-sm font-medium transition-all", isPlaying && "scale-110 text-accent")}
          style={isPlaying ? { color: accentColor } : undefined}
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
        className={cn("cursor-pointer", isPlaying && "slider-active")}
        trackClassName="bg-muted"
        thumbClassName={cn("border-2 focus-visible:ring-offset-2 transition-all", isPlaying && "scale-110")}
        style={{
          "--track-active-color": accentColor || "hsl(var(--accent))",
        }}
      />
    </div>
  )
}
