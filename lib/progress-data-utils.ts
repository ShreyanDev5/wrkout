import type { WorkoutSession } from "@/lib/types"

// Number of weeks to display in the progress view
export const PROGRESS_WEEKS = 2

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
 * Processes workout sessions into a progression-based weekly data structure
 * where entries for the same exercise progress from W1 (oldest) to W4 (newest)
 * and same-day entries update existing data instead of creating new entries
 */
export function processWorkoutData(sessions: WorkoutSession[]) {
  if (!sessions.length) return { weeklyData: [], weekLabels: [] }

  // First, handle same-day duplicates by keeping only the most recent entry for each exercise per day
  const deduplicatedSessions = sessions.reduce((acc: WorkoutSession[], current) => {
    const currentDate = new Date(current.date)
    
    // Find if there's an existing entry for the same exercise on the same day
    const existingIndex = acc.findIndex(session => {
      const sessionDate = new Date(session.date)
      return session.exerciseId === current.exerciseId && isSameDay(sessionDate, currentDate)
    })

    if (existingIndex === -1) {
      // No existing entry for this exercise on this day, add it
      acc.push(current)
    } else {
      // Replace the existing entry with the current one (which is more recent)
      acc[existingIndex] = current
    }

    return acc
  }, [])

  // Sort all sessions by date (oldest first)
  const sortedSessions = [...deduplicatedSessions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Group sessions by exercise
  const exerciseGroups: Record<string, WorkoutSession[]> = {}

  sortedSessions.forEach((session) => {
    if (!exerciseGroups[session.exerciseId]) {
      exerciseGroups[session.exerciseId] = []
    }
    exerciseGroups[session.exerciseId].push(session)
  })

  // Process each exercise's data
  const weeklyData: {
    exerciseId: string
    exerciseName: string
    dayId: string
    weeks: {
      [weekKey: string]: {
        sets: number
        reps: number
        weight: number
        date: string
      } | null
    }
  }[] = []

  // Generate week labels (W1 to W4)
  const weekLabels = Array.from({ length: PROGRESS_WEEKS }, (_, i) => `W${i + 1}`)

  Object.entries(exerciseGroups).forEach(([exerciseId, exerciseSessions]) => {
    // Sort exercise sessions by date (oldest first)
    const sortedExerciseSessions = [...exerciseSessions].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

    // Initialize weeks object with null values
    const weeks: Record<string, { sets: number; reps: number; weight: number; date: string } | null> = {}
    weekLabels.forEach(label => {
      weeks[label] = null
    })

    // For each exercise, we need to determine if we're in progression mode or shift mode
    const totalSessions = sortedExerciseSessions.length
    const isInProgressionMode = totalSessions <= PROGRESS_WEEKS

    if (isInProgressionMode) {
      // In progression mode: oldest session goes to W1, second oldest to W2, etc.
      sortedExerciseSessions.forEach((session, index) => {
        const weekLabel = weekLabels[index]
        weeks[weekLabel] = {
          sets: session.sets,
          reps: session.reps,
          weight: session.weight,
          date: session.date,
        }
      })
    } else {
      // In shift mode: maintain a rolling window of the most recent sessions
      // but ensure the oldest session is always in W1
      const recentSessions = sortedExerciseSessions.slice(-PROGRESS_WEEKS)
      
      // Assign sessions in order (oldest to newest)
      // W1 = oldest, W2 = second oldest, etc.
      recentSessions.forEach((session, index) => {
        const weekLabel = weekLabels[index]
        weeks[weekLabel] = {
          sets: session.sets,
          reps: session.reps,
          weight: session.weight,
          date: session.date,
        }
      })
    }

    weeklyData.push({
      exerciseId,
      exerciseName: exerciseSessions[0].exerciseName,
      dayId: exerciseSessions[0].dayId,
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
