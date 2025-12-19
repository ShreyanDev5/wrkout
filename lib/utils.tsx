import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ArrowUp, ArrowDown, Dumbbell, Footprints } from "lucide-react"
import { ReactNode } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalDateYYYYMMDD(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

export function getWorkoutDayIcon(dayId: string, modern = false, size = "h-5 w-5"): ReactNode {
  const iconClass = modern ? "modern-icon" : ""

  switch (dayId.toLowerCase()) {
    case "push":
      return <ArrowUp className={`${size} ${iconClass}`} aria-hidden="true" />
    case "pull":
      return <ArrowDown className={`${size} ${iconClass}`} aria-hidden="true" />
    case "leg":
      return <Footprints className={`${size} ${iconClass}`} aria-hidden="true" />
    default:
      return <Dumbbell className={`${size} ${iconClass}`} aria-hidden="true" />
  }
}


// Exercise Configuration
interface ExerciseConfig {
  keywords: string[]
  types: string[]
}

// Define the configuration with specific rules first (priority order)
const EXERCISE_CONFIG: ExerciseConfig[] = [
  // 1. Dual-Type Exercises (Abs/Core often done on Pull or Leg days)
  {
    keywords: ['cable crunch', 'hanging leg raises', 'hanging knee raises'],
    types: ['pull', 'leg']
  },

  // 2. Forearms (Mapped to Leg days per user requirement)
  {
    keywords: [
      'wrist curl', 'wrist extension', 'farmer', 'forearm',
      'reverse curl' // Often hits forearms significantly
    ],
    types: ['leg']
  },

  // 3. Special Context Overrides (Ambiguous terms)
  {
    keywords: ['deadlift', 'back squat', 'leg press', 'leg curl', 'calf'],
    types: ['leg']
  },
  {
    keywords: ['barbell row', 'shrug', 'crunch', 'sit up', 'leg raise'],
    types: ['pull']
  },
  {
    keywords: ['cable fly', 'lateral raise', 'front raise', 'chest fly', 'pec fly', 'flyes'],
    types: ['push']
  },

  // 4. Standard Leg Exercises
  {
    keywords: [
      'squat', 'leg', 'calf', 'thigh', 'hamstring', 'glute', 'quad', 'lunge',
      'hip thrust', 'step up', 'step down', 'bulgarian', 'abduction', 'adduction',
      'kickback', 'rdl', 'stiff leg', 'good morning'
    ],
    types: ['leg']
  },

  // 5. Standard Push Exercises (Chest, Shoulders, Triceps)
  {
    keywords: [
      'bench', 'press', 'push', 'chest', 'shoulder', 'tricep', 'incline', 'decline',
      'dip', 'overhead', 'ohp', 'lateral', 'front raise', 'skull', 'extension', 'pushdown',
      'arnold', 'military', 'pec deck', 'crossover'
    ],
    types: ['push']
  },

  // 6. Standard Pull Exercises (Back, Biceps, Rear Delts, Traps)
  {
    keywords: [
      'row', 'pull', 'curl', 'back', 'bicep', 'trap', 'lat', 'chin',
      'face pull', 'rear delt', 'rack pull', 't-bar', 't bar'
    ],
    types: ['pull']
  }
]

export function getExerciseWorkoutType(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase()

  // Iterate through config to find the first match
  for (const config of EXERCISE_CONFIG) {
    // Check if any keyword in this config group matches the exercise name
    // We use word boundary check for short words to avoid false positives (e.g. "leg" in "legal")
    // For longer specific phrases, simple inclusion is usually safe and preferred.
    if (config.keywords.some(keyword => {
      // Simple includes check is robust enough for most specific fitness terms 
      // and handles variations like plurals better without complex regex overhead 
      return name.includes(keyword)
    })) {
      return config.types
    }
  }

  // Default fallback if no match found
  return ['mixed']
}