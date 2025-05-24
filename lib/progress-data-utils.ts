import type { WorkoutSession } from "@/lib/types"

// Number of weeks to display in the progress view
export const PROGRESS_WEEKS = 4

/**
 * Processes workout sessions into a dynamic weekly data structure
 * that automatically shifts data when all weeks are populated
 */
export function processWorkoutData(sessions: WorkoutSession[]) {
  if (!sessions.length) return { weeklyData: [], weekLabels: [] }

  // Sort sessions by date (oldest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  // Get the most recent session date to use as reference
  const lastSessionDate = new Date(sortedSessions[sortedSessions.length - 1].date)

  // Generate week labels and date ranges
  const weekLabels: string[] = []
  const weekRanges: { start: Date; end: Date }[] = []

  // Always create PROGRESS_WEEKS number of weeks, starting from the most recent week
  for (let i = 0; i < PROGRESS_WEEKS; i++) {
    const weekNumber = i + 1
    const weekLabel = `W${weekNumber}`
    weekLabels.push(weekLabel)

    // Calculate date range for this week, working backwards from the most recent session
    const weekEnd = new Date(lastSessionDate)
    weekEnd.setDate(lastSessionDate.getDate() - (PROGRESS_WEEKS - weekNumber) * 7)

    const weekStart = new Date(weekEnd)
    weekStart.setDate(weekEnd.getDate() - 6)

    weekRanges.push({ start: weekStart, end: weekEnd })
  }

  // Group sessions by exercise
  const exerciseGroups: Record<string, WorkoutSession[]> = {}

  sortedSessions.forEach((session) => {
    if (!exerciseGroups[session.exerciseId]) {
      exerciseGroups[session.exerciseId] = []
    }
    exerciseGroups[session.exerciseId].push(session)
  })

  // Process each exercise's weekly data
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

  Object.entries(exerciseGroups).forEach(([exerciseId, exerciseSessions]) => {
    const weeks: Record<string, { sets: number; reps: number; weight: number; date: string } | null> = {}

    // Initialize all weeks as null
    weekLabels.forEach((label) => {
      weeks[label] = null
    })

    // Track the last week we assigned data to for this exercise
    let lastAssignedWeekIndex = -1

    // Fill in data for weeks that have sessions
    exerciseSessions.forEach((session) => {
      const sessionDate = new Date(session.date)

      // Find which week this session belongs to
      for (let i = 0; i < weekRanges.length; i++) {
        const { start, end } = weekRanges[i]

        if (sessionDate >= start && sessionDate <= end) {
          // Only assign to this week if it's after the last assigned week
          // This ensures chronological progression
          if (i > lastAssignedWeekIndex) {
            const weekLabel = weekLabels[i]
            weeks[weekLabel] = {
              sets: session.sets,
              reps: session.reps,
              weight: session.weight,
              date: session.date,
            }
            lastAssignedWeekIndex = i
          }
          break
        }
      }
    })

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
