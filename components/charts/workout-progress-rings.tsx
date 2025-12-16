"use client"
import { CircularProgress } from "@/components/ui/circular-progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface WorkoutProgressRingsProps {
  className?: string
  pushProgress: number
  pullProgress: number
  legProgress: number
  showLabels?: boolean
  size?: "sm" | "md" | "lg"
}

export function WorkoutProgressRings({
  className,
  pushProgress,
  pullProgress,
  legProgress,
  showLabels = true,
  size = "md",
}: WorkoutProgressRingsProps) {
  return (
    <Card className={cn("border shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Your Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center">
            <CircularProgress
              value={pushProgress}
              category="push"
              size={size}
              labelText={showLabels ? "Push" : undefined}
              showLabel={showLabels}
            />
            {showLabels && <span className="text-xs text-muted-foreground mt-2">{100 - pushProgress}% left</span>}
          </div>

          <div className="flex flex-col items-center">
            <CircularProgress
              value={pullProgress}
              category="pull"
              size={size}
              labelText={showLabels ? "Pull" : undefined}
              showLabel={showLabels}
            />
            {showLabels && <span className="text-xs text-muted-foreground mt-2">{100 - pullProgress}% left</span>}
          </div>

          <div className="flex flex-col items-center">
            <CircularProgress
              value={legProgress}
              category="leg"
              size={size}
              labelText={showLabels ? "Legs" : undefined}
              showLabel={showLabels}
            />
            {showLabels && <span className="text-xs text-muted-foreground mt-2">{100 - legProgress}% left</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
