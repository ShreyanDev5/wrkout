import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ArrowUp, ArrowDown, Dumbbell, Footprints } from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function getWorkoutDayColor(dayId: string, colorMode?: string): string {
  switch (dayId.toLowerCase()) {
    case "push":
      return "hsl(var(--push-dark))" // Soft Gold
    case "pull":
      return "hsl(var(--pull-dark))" // Darker Green
    case "leg":
      return "hsl(var(--leg-dark))" // Darker Purple
    default:
      return "hsl(var(--muted))"
  }
}

export function getWorkoutDayIcon(dayId: string, modern = false) {
  const iconClass = modern ? "modern-icon" : ""

  switch (dayId.toLowerCase()) {
    case "push":
      return <ArrowUp className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
    case "pull":
      return <ArrowDown className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
    case "leg":
      return <Footprints className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
    default:
      return <Dumbbell className={`h-5 w-5 ${iconClass}`} aria-hidden="true" />
  }
}
