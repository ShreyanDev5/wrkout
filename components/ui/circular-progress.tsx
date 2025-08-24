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

// Easing function for a smooth, iOS-like animation
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
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
  const [animatedPercentage, setAnimatedPercentage] = React.useState(percentage) // Initialize with actual percentage
  const [isComplete, setIsComplete] = React.useState(percentage >= 100)
  const [isScaling, setIsScaling] = React.useState(false)
  const [isPulsing, setIsPulsing] = React.useState(false)
  const prevPercentageRef = React.useRef(percentage) // Initialize with actual percentage
  const firstRenderRef = React.useRef(true)
  const dataStabilizationRef = React.useRef(false)
  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    setHasMounted(true)
  }, [])


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

  // Get text color based on category and completion status
  const getTextColor = (category: string, isComplete: boolean): string => {
    if (!hasMounted) {
      return "transparent" // Avoid flash of incorrect color on initial render
    }
    if (isComplete) {
      return getCategoryColor(category)
    }
    // For incomplete routines, use white text
    return "white"
  }

  const trackColor = "var(--track-color, #E5E7EB)" // Light muted gray
  const progressColor = getCategoryColor(category)
  const textColor = getTextColor(category, percentage >= 100)

  // Animation effect with consistent linear speed using requestAnimationFrame
  React.useEffect(() => {
    // Skip animation on first render to prevent incorrect animation on screen re-entry
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      // Set the previous percentage to current to prevent animation on re-mount
      prevPercentageRef.current = percentage
      // Mark that data has stabilized after first render
      setTimeout(() => {
        dataStabilizationRef.current = true
      }, 50)
      return
    }

    // Skip animation until data has stabilized to prevent flickering on re-mount
    if (!dataStabilizationRef.current) {
      setAnimatedPercentage(percentage)
      setIsComplete(percentage >= 100)
      prevPercentageRef.current = percentage
      // Mark that data has stabilized after short delay
      setTimeout(() => {
        dataStabilizationRef.current = true
      }, 50)
      return
    }

    if (!animated) {
      setAnimatedPercentage(percentage)
      setIsComplete(percentage >= 100)
      prevPercentageRef.current = percentage
      return
    }

    // Only animate if the new percentage is different from the previous one
    if (percentage !== prevPercentageRef.current) {
      const startPercentage = prevPercentageRef.current
      const endPercentage = percentage
      const startTime = performance.now()
      const animationDuration = 800 // Slightly longer duration for a smoother feel

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / animationDuration, 1)
        const easedProgress = easeInOutCubic(progress) // Apply easing

        // Interpolate using the eased progress
        const currentPercentage =
          startPercentage + (endPercentage - startPercentage) * easedProgress
        setAnimatedPercentage(currentPercentage)

        // Update completion state during animation for smoother visual transitions
        const currentlyComplete = currentPercentage >= 100
        if (currentlyComplete !== isComplete) {
          setIsComplete(currentlyComplete)
        }

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Animation complete
          prevPercentageRef.current = endPercentage

          // Final check for completion state
          const finalComplete = endPercentage >= 100
          if (finalComplete !== isComplete) {
            setIsComplete(finalComplete)
          }

          // Trigger completion effects only when reaching 100%
          if (endPercentage >= 100 && !isComplete) {
            setIsScaling(true)
            setIsPulsing(true)
            setTimeout(() => setIsScaling(false), 600)
            setTimeout(() => setIsPulsing(false), 1200)
          }
        }
      }

      requestAnimationFrame(animate)
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
        filter: isPulsing ? `drop-shadow(0 0 8px ${progressColor}80)` : "none",
      }}
      {...props}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        {/* Background track with enhanced styling */}
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
        {/* Progress arc with consistent animation and enhanced styling */}
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
          className="transition-none"
          style={{
            transition: "none",
            filter: isPulsing ? `drop-shadow(0 0 4px ${progressColor}B0)` : "none",
          }}
        />
        {/* Enhanced glow effect when complete */}
        {isComplete && (
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={progressColor}
            strokeWidth={strokeWidth / 2}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
            className="animate-pulse"
            style={{
              opacity: 0.4,
              filter: "blur(3px)",
            }}
          />
        )}
        {/* Subtle inner shadow for depth */}
        <circle
          cx="50"
          cy="50"
          r={radius - strokeWidth / 2}
          fill="none"
          stroke="rgba(0,0,0,0.1)"
          strokeWidth="1"
          className="opacity-30"
        />
      </svg>

      {/* Center content with enhanced styling */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-semibold tabular-nums transition-all duration-500 tracking-tight",
            size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl",
            percentage >= 100 ? "scale-110" : ""
          )}
          style={{ 
            color: textColor,
            textShadow: isPulsing ? `0 0 8px ${progressColor}80` : "none",
            transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          {Math.round(animatedPercentage)}%
        </span>
        {showLabel && labelText && (
          <span 
            className={cn(
              "text-xs text-muted-foreground mt-1 transition-all duration-500 font-medium",
              size === "lg" && "text-sm",
              percentage >= 100 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            )}
          >
            {labelText}
          </span>
        )}
      </div>
    </div>
  )
}
