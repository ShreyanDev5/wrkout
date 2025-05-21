"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const circularProgressVariants = cva("relative flex items-center justify-center rounded-full", {
  variants: {
    size: {
      sm: "h-20 w-20",
      md: "h-28 w-28",
      lg: "h-36 w-36",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularProgressVariants> {
  value: number
  maxValue?: number
  category?: "push" | "pull" | "leg" | "default"
  showLabel?: boolean
  labelText?: string
  strokeWidth?: number
  animated?: boolean
}

export function CircularProgress({
  className,
  size,
  value,
  maxValue = 100,
  category = "default",
  showLabel = true,
  labelText,
  strokeWidth = 8,
  animated = true,
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100))
  const [animatedPercentage, setAnimatedPercentage] = React.useState(0)
  const [isComplete, setIsComplete] = React.useState(false)
  const [isScaling, setIsScaling] = React.useState(false)
  const prevPercentageRef = React.useRef(0)

  // Get color based on category
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "push":
        return "var(--push-color, #F9D949)" // Yellow
      case "pull":
        return "var(--pull-color, #4CAF50)" // Green
      case "leg":
        return "var(--leg-color, #F44336)" // Red
      default:
        return "var(--accent-color, #3B82F6)" // Default blue
    }
  }

  const trackColor = "var(--track-color, #E5E7EB)" // Light muted gray
  const progressColor = getCategoryColor(category)

  // Animation effect with forward-only transition
  React.useEffect(() => {
    if (!animated) {
      setAnimatedPercentage(percentage)
      setIsComplete(percentage >= 100)
      return
    }

    // Only animate if the new percentage is higher than the previous one
    // or if we're resetting to 0
    if (percentage > prevPercentageRef.current || percentage === 0) {
      const animationDuration = 600 // ms
      const steps = 30
      const increment = (percentage - prevPercentageRef.current) / steps
      let currentPercentage = prevPercentageRef.current

      const interval = setInterval(() => {
        currentPercentage += increment
        if ((increment > 0 && currentPercentage >= percentage) || (increment < 0 && currentPercentage <= percentage)) {
          clearInterval(interval)
          setAnimatedPercentage(percentage)
          prevPercentageRef.current = percentage

          // Check if we've reached 100%
          if (percentage >= 100 && !isComplete) {
            setIsComplete(true)
            setIsScaling(true)
            setTimeout(() => setIsScaling(false), 600) // Reset scaling after animation
          } else if (percentage < 100) {
            setIsComplete(false)
          }
        } else {
          setAnimatedPercentage(currentPercentage)
        }
      }, animationDuration / steps)

      return () => clearInterval(interval)
    } else {
      // If new percentage is lower, just set it without animation
      setAnimatedPercentage(percentage)
      prevPercentageRef.current = percentage
      setIsComplete(percentage >= 100)
    }
  }, [percentage, animated, isComplete])

  // SVG parameters
  const radius = 50 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference

  return (
    <div
      className={cn(circularProgressVariants({ size }), className, isScaling ? "scale-105" : "")}
      style={{
        transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      {...props}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Background track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="opacity-20"
        />
        {/* Progress arc */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn("text-2xl font-medium tabular-nums", size === "sm" && "text-xl", size === "lg" && "text-3xl")}
          style={{ color: isComplete ? progressColor : "inherit" }}
        >
          {Math.round(animatedPercentage)}%
        </span>
        {showLabel && labelText && (
          <span className={cn("text-xs text-muted-foreground mt-1", size === "lg" && "text-sm")}>{labelText}</span>
        )}
      </div>
    </div>
  )
}
