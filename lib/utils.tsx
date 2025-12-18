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

export function getExerciseWorkoutType(exerciseName: string): string | null {
  const name = exerciseName.toLowerCase()

  // Handle special cases for ambiguous exercises first
  // These exercises could be classified differently based on context
  const specialCases: { [key: string]: string } = {
    // These are typically leg exercises
    'deadlift': 'leg',
    'barbell row': 'pull',
    'cable fly': 'push',  // More commonly chest fly than rear delt
    'lateral raise': 'push',
    'front raise': 'push',
    'shrug': 'pull',  // Though some might argue it's push since it's shoulders
    'crunch': 'pull',  // Core is grouped with pull
    'sit up': 'pull',  // Core is grouped with pull
    'leg raise': 'pull',  // Core is grouped with pull
    // Specific terms that might conflict with generic terms
    'barbell back squat': 'leg',
    'back squat': 'leg',
    'leg press': 'leg',
    'lying leg curl': 'leg',
    'seated leg curl': 'leg'
  }

  // Check special cases first
  for (const [specialExercise, type] of Object.entries(specialCases)) {
    if (name.includes(specialExercise)) {
      return type
    }
  }

  // Leg exercises (check first to avoid conflicts with generic terms)
  // Add new leg exercises here. Include both singular and plural forms if needed.
  const legKeywords = [
    // Comprehensive leg exercises
    'hack squat', 'squat hack',
    'romanian deadlift', 'rdl', 'romainian deadlift', 'stiff leg deadlift', 'straight leg deadlift',
    'leg extension', 'extension', // Leg Extension
    'smith machine squat', 'smith squat', // Smith Machine Squat
    'walking lunges', 'lunges walking', 'forward lunges', // Walking Lunges
    'goblet squat', 'squats goblet', // Goblet Squat
    'barbell hip thrust', 'hip thrust barbell', 'glute bridge barbell', // Barbell Hip Thrust
    'cable kickbacks', 'kickbacks cable', 'glute kickback', // Cable Kickbacks
    'standing calf raise', 'calf raise standing', // Standing Calf Raise
    'seated calf raise', 'calf raise seated', // Seated Calf Raise
    'leg press calf raise', 'calf raise leg press', // Leg Press Calf Raise
    'wrist curls', 'wrist curl', 'wrist curl barbell', // Wrist Curls (Barbell)
    'wrist extension', 'wrist extension barbell', // Wrist Extension (Barbell)
    'farmer\'s carry', 'farmers carry', 'farmer carry', // Farmer's Carry (apostrophe and non-apostrophe)
    'single leg press', 'leg press single', // Single Leg Press
    'sumo deadlift', 'deadlift sumo', // Sumo Deadlift
    'front squat', 'squat front', // Front Squat
    'bulgarian split squat', 'split squat bulgarian', // Bulgarian Split Squat
    'bulgarian', 'hip thrust', 'seated calf', 'standing calf',
    'hip abduction', 'abduction hip', 'hip adduction', 'adduction hip',
    'step[- ]?up', 'step[- ]?down',
    'squat', 'leg', 'calf', 'thigh', 'hamstring', 'glute', 'quad', 'lunge',
    'calf raise', 'leg curl machine', 'leg curl'
  ]

  // Push exercises (chest, shoulders, triceps)
  // Add new push exercises here. Include both singular and plural forms if needed.
  const pushKeywords = [
    // Comprehensive push exercises
    'machine chest press', 'chest press machine', // Flat & Incline
    'machine chest press (flat)', 'flat machine chest press',
    'machine chest press (incline)', 'incline machine chest press',
    'peck deck fly', 'pec deck fly', 'pec deck', 'peck deck',
    'dumbbell bench press (flat)', 'flat dumbbell bench press',
    'dumbbell bench press (incline)', 'incline dumbbell bench press',
    'dumbbell bench press (decline)', 'decline dumbbell bench press',
    'barbell bench press (flat)', 'flat barbell bench press',
    'barbell bench press (incline)', 'incline barbell bench press',
    'barbell bench press (decline)', 'decline barbell bench press',
    'push-ups', 'push-ups (weighted optional)', 'push ups', 'pushup',
    'dips', 'dip',
    'machine shoulder press', 'shoulder press machine', 'military press machine',
    'dumbbell shoulder press', 'shoulder press dumbbell', 'military press dumbbell',
    'barbell shoulder press', 'shoulder press barbell', 'military press barbell',
    'dumbbell lateral raise', 'lateral raise dumbbell', 'side lateral raise',
    'machine lateral raise', 'lateral raise machine',
    'dumbbell front raise', 'front raise dumbbell',
    'dumbbell rear delt raise', 'rear delt raise dumbbell',
    'arnold press', 'arnold dumbbell press',
    'triceps pushdown', 'pushdown triceps', 'triceps pushdown (bar)', 'triceps pushdown (rope)',
    'overhead triceps extension', 'triceps extension overhead', 'overhead triceps extension (v-bar)', 'overhead triceps extension (rope)',
    'skull crushers', 'skullcrusher', 'ez bar skull crushers',
    'close-grip bench press', 'bench press close grip',
    'incline dumbbell press', 'dumbbell press incline',
    'decline dumbbell press', 'dumbbell press decline',
    'incline barbell press', 'barbell press incline',
    'decline barbell press', 'barbell press decline',
    'chest fly machine', 'machine chest fly', 'pec fly machine',
    'cable chest fly', 'chest fly cable',
    'dumbbell chest fly', 'chest fly dumbbell',
    'cable crossover', 'crossover cable',
    'incline chest fly', 'chest fly incline',
    'decline chest fly', 'chest fly decline',
    'overhead press', 'press overhead',
    'bench', 'press', 'push', 'chest', 'shoulder', 'tricep', 'incline', 'decline',
    'fly', 'dip', 'overhead', 'ohp', 'lateral', 'front raise', 'lateral raise',
    'overhead rope extension', 'rope triceps extension',
    'dumbbell flyes', 'flyes'
  ]

  // Pull exercises (back, biceps, rear delts, traps, core)
  // Add new pull exercises here. Include both singular and plural forms if needed.
  const pullKeywords = [
    // Comprehensive pull exercises
    'lat pulldown', 'pulldown lat', 'lat pulldown (cable)', 'cable lat pulldown',
    'seated cable row', 'cable row seated', 'seated row',
    'chest supported row', 'row chest supported',
    'dumbbell row', 'row dumbbell', 'dumbbell bent over row',
    'pull-ups', 'pull-ups (assisted or weighted)', 'pull ups', 'pullup',
    'chin-ups', 'chin ups', 'chinup',
    't-bar row', 't bar row', 'tbar row', 'row t-bar',
    'reverse peck deck', 'peck deck reverse', 'reverse pec deck',
    'face pulls', 'face pull', 'pull face', 'cable face pull',
    'rear delt cable fly', 'cable fly rear delt', 'rear delt fly', 'fly rear delt',
    'machine preacher curl', 'preacher curl machine',
    'barbell biceps curl', 'biceps curl barbell', 'barbell curl',
    'dumbbell biceps curl', 'biceps curl dumbbell', 'dumbbell curl',
    'hammer curl', 'hammer curl (dumbbell)', 'dumbbell hammer curl',
    'concentration curl', 'curl concentration',
    'cable curl', 'curl cable', 'cable curl (ez bar or rope)',
    'incline dumbbell curl', 'dumbbell curl incline',
    'preacher curl', 'curl preacher',
    'dumbbell shrug', 'shrug dumbbell',
    'barbell shrug', 'shrug barbell',
    'cable shrug', 'shrug cable',
    'cable crunch', 'crunch cable',
    'hanging leg raises', 'leg raises hanging', 'hanging knee raises', 'knee raises hanging',
    'decline sit-ups', 'decline sit ups', 'sit ups decline', 'decline crunch',
    'leg raises on bench', 'bench leg raises', 'lying leg raise',
    'plank', 'plank (timed)', 'plank hold',
    'russian twists', 'twists russian', 'russian twist',
    'cable row', 'row cable',
    'lat pullover', 'pullover lat', 'lat pull over',
    'straight arm pulldown', 'pulldown straight arm',
    'row', 'pull', 'curl', 'back', 'bicep', 'trap', 'lat', 'pull[- ]?up', 'chin[- ]?up',
    'face pull', 'rear delt', 'rack pull', 't-bar', 't bar'
  ]

  // Match full phrase first for pull, then push, then leg
  // Order matters to avoid conflicts with generic terms
  if (pullKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'pull'
  if (pushKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'push'
  if (legKeywords.some(keyword => new RegExp(`\\b${keyword}\\b`).test(name))) return 'leg'

  return null
}