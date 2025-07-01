import type { WorkoutLog } from "@/lib/types"

// Number of weeks to display in the progress view
export const PROGRESS_WEEKS = 1

/**
 * Helper function to check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Processes workout logs into a progression-based weekly data structure
 * where entries for the same exercise progress from W1 (oldest) to W4 (newest)
 * and same-day entries update existing data instead of creating new entries
 */
export function processWorkoutData(logs: WorkoutLog[]) {
  if (!logs.length) return { weeklyData: [], weekLabels: [] }

  // First, handle same-day duplicates by keeping only the most recent entry for each exercise per day
  const deduplicatedLogs = logs.reduce((acc: WorkoutLog[], current) => {
    const currentDate = new Date(current.performed_at)
    // Find if there's an existing entry for the same exercise on the same day
    const existingIndex = acc.findIndex(log => {
      const logDate = new Date(log.performed_at)
      return log.exercise_name === current.exercise_name && isSameDay(logDate, currentDate)
    })
    if (existingIndex === -1) {
      acc.push(current)
    } else {
      acc[existingIndex] = current
    }
    return acc
  }, [])

  // Sort all logs by date (oldest first)
  const sortedLogs = [...deduplicatedLogs].sort((a, b) => {
    return new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
  })

  // Group logs by exercise_name
  const exerciseGroups: Record<string, WorkoutLog[]> = {}
  sortedLogs.forEach((log) => {
    if (!exerciseGroups[log.exercise_name]) {
      exerciseGroups[log.exercise_name] = []
    }
    exerciseGroups[log.exercise_name].push(log)
  })

  // Process each exercise's data
  const weeklyData: {
    exerciseName: string
    weeks: {
      [weekKey: string]: {
        reps: number
        weight: number
        date: string
      } | null
    }
  }[] = []

  // Generate week labels (W1 to W4)
  const weekLabels = ['Current Week']

  Object.entries(exerciseGroups).forEach(([exerciseName, exerciseLogs]) => {
    // Sort exercise logs by date (oldest first)
    const sortedExerciseLogs = [...exerciseLogs].sort((a, b) => {
      return new Date(a.performed_at).getTime() - new Date(b.performed_at).getTime()
    })

    // Initialize weeks object with null values
    const weeks: Record<string, { reps: number; weight: number; date: string } | null> = {}
    weekLabels.forEach(label => {
      weeks[label] = null
    })

    // For each exercise, we need to determine if we're in progression mode or shift mode
    const totalLogs = sortedExerciseLogs.length
    const isInProgressionMode = totalLogs <= PROGRESS_WEEKS

    if (isInProgressionMode) {
      // In progression mode: oldest log goes to W1, second oldest to W2, etc.
      sortedExerciseLogs.forEach((log, index) => {
        const weekLabel = weekLabels[index]
        weeks[weekLabel] = {
          reps: log.avg_reps,
          weight: log.weight,
          date: log.performed_at,
        }
      })
    } else {
      // In shift mode: maintain a rolling window of the most recent logs
      // but ensure the oldest log is always in W1
      const recentLogs = sortedExerciseLogs.slice(-PROGRESS_WEEKS)
      recentLogs.forEach((log, index) => {
        const weekLabel = weekLabels[index]
        weeks[weekLabel] = {
          reps: log.avg_reps,
          weight: log.weight,
          date: log.performed_at,
        }
      })
    }

    weeklyData.push({
      exerciseName,
      weeks,
    })
  })

  // Sort by exercise name
  return {
    weeklyData: weeklyData.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName)),
    weekLabels,
  }
}

/**
 * Formats a date range for display
 */
export function formatWeekRange(weekIndex: number, mostRecentDate: Date): string {
  const weekEnd = new Date(mostRecentDate)
  weekEnd.setDate(mostRecentDate.getDate() - weekIndex * 7)

  const weekStart = new Date(weekEnd)
  weekStart.setDate(weekEnd.getDate() - 6)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`
}

/**
 * Gets the date range for a specific week label
 */
export function getWeekDateRange(weekLabel: string, mostRecentDate: Date): string {
  // Extract week number from label (e.g., "W3" -> 3)
  const weekNumber = Number.parseInt(weekLabel.replace("W", ""))

  // Calculate week index (0-based, where 0 is the oldest week)
  const weekIndex = PROGRESS_WEEKS - weekNumber

  return formatWeekRange(weekIndex, mostRecentDate)
}
