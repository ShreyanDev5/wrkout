import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ArrowUp, ArrowDown, Dumbbell, Footprints } from "lucide-react"
import { ReactNode } from "react"

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

export function getWorkoutDayIcon(dayId: string, modern = false): ReactNode {
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

export function getExerciseWorkoutType(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase()
  
  // Leg exercises (check first to avoid conflicts with generic terms)
  const legKeywords = [
    'leg press', 'hack squat', 'bulgarian', 'romanian', 'rdl', 'hip thrust', 'leg curl',
    'seated calf', 'standing calf', 'hip abduction', 'hip adduction', 'step[- ]?up',
    'squat', 'leg', 'calf', 'thigh', 'hamstring', 'glute', 'quad', 'lunge', 'extension'
  ]
  
  // Push exercises (chest, shoulders, triceps)
  const pushKeywords = [
    'bench', 'press', 'push', 'chest', 'shoulder', 'tricep', 'incline', 'decline',
    'fly', 'dip', 'overhead', 'ohp', 'lateral', 'front raise', 'lateral raise'
  ]
  
  // Pull exercises (back, biceps, rear delts)
  const pullKeywords = [
    'row', 'pull', 'curl', 'back', 'bicep', 'trap', 'lat', 'pull[- ]?up', 'chin[- ]?up',
    'face pull', 'rear delt', 'shrug', 'rack pull', 't-bar', 't bar'
  ]
  
  if (legKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'leg'
  if (pushKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'push'
  if (pullKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'pull'
  
  return null
} 