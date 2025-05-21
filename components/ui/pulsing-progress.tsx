"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

interface PulsingProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number
  max?: number
  dayColor?: string
}

export function PulsingProgress({ className, value, max = 100, dayColor, ...props }: PulsingProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div
      className={cn("relative h-3 w-full overflow-hidden rounded-full bg-secondary dark:bg-opacity-30", className)}
      role="progressbar"
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{
          width: `${percentage}%`,
          backgroundColor: dayColor || "hsl(var(--accent))",
        }}
      />
    </div>
  )
}
