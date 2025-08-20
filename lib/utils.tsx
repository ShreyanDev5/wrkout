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
  // Add new leg exercises here. Include both singular and plural forms if needed.
  const legKeywords = [
    // User's leg routine
    'lying leg curl', // Lying Leg Curl
    'hack squat', // Hack Squat
    'romanian deadlift', 'rdl', // Romanian Deadlift (RDL)
    'leg extension', // Leg Extension
    'smith machine squat', // Smith Machine Squat
    'walking lunges', // Walking Lunges
    'goblet squat', // Goblet Squat
    'seated leg curl', // Seated Leg Curl
    'barbell hip thrust', // Barbell Hip Thrust
    'cable kickbacks', // Cable Kickbacks
    'standing calf raise', // Standing Calf Raise
    'seated calf raise', // Seated Calf Raise
    'leg press calf raise', // Leg Press Calf Raise
    'wrist curls', 'wrist curl', // Wrist Curls (Barbell)
    'wrist extension', // Wrist Extension (Barbell)
    'farmer’s carry', 'farmers carry', // Farmer's Carry (apostrophe and non-apostrophe)
    // Existing generic leg terms
    'leg press', 'bulgarian', 'hip thrust', 'leg curl',
    'seated calf', 'standing calf', 'hip abduction', 'hip adduction', 'step[- ]?up',
    'squat', 'leg', 'calf', 'thigh', 'hamstring', 'glute', 'quad', 'lunge'
  ]
  
  // Push exercises (chest, shoulders, triceps)
  // Add new push exercises here. Include both singular and plural forms if needed.
  const pushKeywords = [
    // User's push routine
    'machine chest press', // Flat & Incline
    'machine chest press (flat)',
    'machine chest press (incline)',
    'peck deck fly',
    'dumbbell bench press (flat)',
    'dumbbell bench press (incline)',
    'push-ups', 'push-ups (weighted optional)', 'push ups',
    'dips',
    'machine shoulder press',
    'dumbbell shoulder press',
    'dumbbell lateral raise',
    'machine lateral raise',
    'dumbbell front raise',
    'arnold press',
    'triceps pushdown', 'triceps pushdown (bar)', 'triceps pushdown (rope)',
    'overhead triceps extension', 'overhead triceps extension (v-bar)', 'overhead triceps extension (rope)',
    'skull crushers',
    'close-grip bench press',
    // Existing generic push terms
    'bench', 'press', 'push', 'chest', 'shoulder', 'tricep', 'incline', 'decline',
    'fly', 'dip', 'overhead', 'ohp', 'lateral', 'front raise', 'lateral raise',
    'overhead rope extension', 'rope triceps extension'
  ]
  
  // Pull exercises (back, biceps, rear delts, traps, core)
  // Add new pull exercises here. Include both singular and plural forms if needed.
  const pullKeywords = [
    // User's pull routine
    'lat pulldown', 'lat pulldown (cable)',
    'seated cable row',
    'chest supported row',
    'barbell bent-over row', 'barbell bent over row',
    'pull-ups', 'pull-ups (assisted or weighted)', 'pull ups',
    't-bar row', 't bar row',
    'reverse peck deck',
    'face pulls', 'face pull',
    'rear delt cable fly', 'rear delt fly',
    'machine preacher curl',
    'barbell biceps curl',
    'hammer curl', 'hammer curl (dumbbell)',
    'concentration curl',
    'cable curl', 'cable curl (ez bar or rope)',
    'dumbbell shrug',
    'barbell shrug',
    'cable crunch',
    'hanging leg raises',
    'decline sit-ups', 'decline sit ups',
    'leg raises on bench',
    'plank', 'plank (timed)',
    'russian twists',
    // Existing generic pull terms
    'row', 'pull', 'curl', 'back', 'bicep', 'trap', 'lat', 'pull[- ]?up', 'chin[- ]?up',
    'face pull', 'rear delt', 'shrug', 'rack pull', 't-bar', 't bar'
  ]
  
  // Match full phrase first for push/pull, then leg
  if (pushKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'push'
  if (pullKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'pull'
  if (legKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'leg'
  
  return null
}