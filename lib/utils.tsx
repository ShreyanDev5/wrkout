import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Hand, BicepsFlexed, Dumbbell, Footprints } from "lucide-react"
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
      return <Hand className={`${size} ${iconClass}`} aria-hidden="true" />
    case "pull":
      return <BicepsFlexed className={`${size} ${iconClass}`} aria-hidden="true" />
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
// Define the configuration with specific rules first (priority order)
// This list works as a priority cascade. The first matching block determines the type.
// Simplified Exercise Config
// We now rely primarily on the routine context (workout_day_id) for classification.
// These fallbacks are only for new/unassigned exercises.

const EXERCISE_CONFIG: ExerciseConfig[] = [
  // 1. CORE / ABS (Mapped to PULL based on user precedent)
  {
    keywords: [
      'crunch', 'sit up', 'situp', 'plank', 'russian twist', 'leg raise', 'ab wheel',
      'rollout', 'toes to bar', 'v-up', 'hollow', 'dragon flag', 'flutter kick',
      'scissor kick', 'cocoon', 'vacuum', 'oblique', 'core', 'woodchopper', 'cable chop', 'twist'
    ],
    types: ['pull']
  },

  // 2. CARDIO
  {
    keywords: [
      'run', 'jog', 'treadmill', 'elliptical', 'bike', 'cycle', 'cycling',
      'swim', 'rowing', 'ski erg', 'assault bike', 'jump rope', 'skipping', 'burpee'
    ],
    types: ['cardio']
  },

  // 3. BROAD MATCH: LEGS
  {
    keywords: [
      'squat', 'leg', 'calf', 'calves', 'thigh', 'quad', 'hamstring', 'glute',
      'lunge', 'step up', 'step down', 'jump', 'plyo', 'tibialis', 'deadlift', 'romanian', 'rdl'
    ],
    types: ['leg']
  },

  // 4. BROAD MATCH: PUSH (Chest, Shoulders, Triceps)
  {
    keywords: [
      'bench', 'press', 'push', 'chest', 'pec', 'fly', 'flyes', 'crossover',
      'shoulder', 'deltoid', 'delt', 'lateral', 'front raise',
      'tricep', 'skull', 'extension', 'dip', 'kickback'
    ],
    types: ['push']
  },

  // 5. BROAD MATCH: PULL (Back, Biceps)
  {
    keywords: [
      'row', 'pull', 'lat', 'back', 'trap', 'rhomboid', 'erector',
      'chin', 'bicep', 'curl', 'shrug'
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

/**
 * Determines if an exercise is a compound (multi-joint) movement.
 * Compound exercises typically involve multiple muscle groups and joints.
 * Used for smart progression logic with different rep thresholds.
 */
export function isCompoundExercise(exerciseName: string): boolean {
  const name = exerciseName.toLowerCase()

  // Compound exercises: multi-joint movements
  const compoundKeywords = [
    // Chest compounds
    'bench press', 'bench', 'push up', 'pushup', 'dip',
    // Back compounds
    'row', 'pull up', 'pullup', 'chin up', 'chinup', 'lat pulldown', 'deadlift',
    'rack pull', 'barbell row', 'pendlay', 't-bar',
    // Shoulder compounds
    'overhead press', 'ohp', 'military press', 'shoulder press', 'push press',
    'arnold press', 'landmine press', 'viking press',
    // Leg compounds
    'squat', 'leg press', 'lunge', 'split squat', 'bulgarian',
    'hip thrust', 'romanian', 'rdl', 'good morning', 'step up',
    'hack squat', 'goblet squat', 'front squat', 'back squat',
    // Full body compounds
    'clean', 'snatch', 'thruster', 'muscle up', 'burpee', 'farmer'
  ]

  // Isolation exercises: single-joint movements (returns false)
  const isolationKeywords = [
    // Biceps isolation
    'curl', 'bicep',
    // Triceps isolation
    'tricep extension', 'skull crusher', 'kickback', 'pushdown',
    // Shoulder isolation
    'lateral raise', 'side raise', 'front raise', 'rear delt', 'reverse fly', 'face pull', 'shrug',
    // Chest isolation
    'fly', 'flye', 'crossover', 'pec deck',
    // Leg isolation
    'leg curl', 'leg extension', 'calf', 'calves', // Covers 'calf raise', 'calf press'
    'hip abduction', 'hip adduction', 'adductor', 'abductor', 'glute bridge',
    // Back isolation
    'pullover', 'straight arm', 'back extension', 'hyperextension',
    // Core / Abs (High rep targets)
    'crunch', 'sit up', 'situp', 'plank', 'russian twist', 'leg raise', 'ab wheel',
    'rollout', 'toes to bar', 'v-up', 'hollow', 'dragon flag', 'flutter kick',
    'scissor kick', 'cocoon', 'vacuum', 'oblique', 'core', 'woodchopper', 'cable chop', 'twist'
  ]

  // Check isolation first (more specific matches)
  for (const keyword of isolationKeywords) {
    if (name.includes(keyword)) {
      return false
    }
  }

  // Check compound keywords
  for (const keyword of compoundKeywords) {
    if (name.includes(keyword)) {
      return true
    }
  }

  // Default: treat as compound (safer for progression)
  return true
}