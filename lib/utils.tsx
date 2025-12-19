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
// Define the configuration with specific rules first (priority order)
// This list works as a priority cascade. The first matching block determines the type.
const EXERCISE_CONFIG: ExerciseConfig[] = [
  // 1. COMPLEX DUAL-TYPE / SPECIFIC OVERRIDES
  // These must come first to prevent partial matches (e.g., 'hanging leg raises' catching 'leg' -> 'leg')
  {
    keywords: [
      'hanging leg raises', 'hanging knee raises', 'hanging raise',
      'cable crunch', 'woodchopper', 'cable chop', 'medicine ball slam'
    ],
    types: ['pull', 'leg']
  },

  // 2. FOREARMS (User Preference: Mapped to Leg)
  {
    keywords: [
      'wrist curl', 'wrist extension', 'forearm', 'farmer', 'plate pinch',
      'grip', 'reverse curl', 'zottman'
    ],
    types: ['leg']
  },

  // 3. SPECIFIC PULL OVERRIDES (Correcting potential Push/Leg misclassifications)
  {
    keywords: [
      'face pull', 'rear delt', 'reverse fly', 'band pull', 'pull apart',
      'back extension', 'hyperextension', 'rack pull',
      'shrug', 'upright row', 'clean', 'snatch', 'high pull' // Olympic/Traps often Pull
    ],
    types: ['pull']
  },
  // Note: Deadlift is tricky. User had it as LEG. It is handled in LEG block below.

  // 4. SPECIFIC PUSH OVERRIDES (Ambiguous names)
  {
    keywords: [
      'close grip bench', 'jm press', 'tate press', 'spoto press', 'floor press',
      'arnold press', 'landmine press', 'viking press', 'svend press',
      'muscle up' // Push/Pull, but often push dominant at lock out? or Pull. Let's leave mixed if generic, but usually 'Push' day skill.
    ],
    types: ['push']
  },

  // 5. SPECIFIC LEG OVERRIDES
  {
    keywords: [
      'leg press', 'leg curl', 'leg extension', 'calf press',
      'hack squat', 'goblet squat', 'sissy squat', 'safety bar', 'box squat',
      'split squat', 'bulgarian', 'nordic', 'ghr', 'glute ham',
      'hip thrust', 'hip abduction', 'hip adduction', 'bridge',
      'deadlift', 'romanian', 'rdl', 'stiff leg', 'good morning', 'sumo', 'trap bar', 'hex bar'
    ],
    types: ['leg']
  },

  // 6. CORE / ABS (Mapped to PULL based on user precedent calling 'crunch' -> 'pull')
  {
    keywords: [
      'crunch', 'sit up', 'situp', 'plank', 'russian twist', 'leg raise', 'ab wheel',
      'rollout', 'toes to bar', 'v-up', 'hollow', 'dragon flag', 'flutter kick',
      'scissor kick', 'cocoon', 'vacuum', 'oblique', 'core'
    ],
    types: ['pull']
  },

  // 7. CARDIO (Mapped to Generic/Cardio - will show as muted/gray unless colored)
  {
    keywords: [
      'run', 'jog', 'treadmill', 'elliptical', 'bike', 'cycle', 'cycling',
      'swim', 'rowing', 'ski erg', 'assault bike', 'jump rope', 'skipping', 'burpee'
    ],
    types: ['cardio']
  },

  // 8. BROAD MATCH: LEGS
  {
    keywords: [
      'squat', 'leg', 'calf', 'calves', 'thigh', 'quad', 'hamstring', 'glute',
      'lunge', 'step up', 'step down', 'jump', 'plyo', 'tibialis'
    ],
    types: ['leg']
  },

  // 9. BROAD MATCH: PUSH (Chest, Shoulders, Triceps)
  {
    keywords: [
      'bench', 'press', 'push', 'chest', 'pec', 'fly', 'flyes', 'crossover',
      'shoulder', 'deltoid', 'delt', 'lateral', 'front raise',
      'tricep', 'skull', 'extension', 'dip', 'kickback'
      // 'extension' is risky but 'leg extension' & 'back extension' are caught above.
    ],
    types: ['push']
  },

  // 10. BROAD MATCH: PULL (Back, Biceps)
  {
    keywords: [
      'row', 'pull', 'lat', 'back', 'trap', 'rhomboid', 'erector',
      'chin', 'bicep', 'curl' // 'leg curl' caught above
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