import type { WorkoutLog } from "@/lib/types"

// Number of weeks to display in the progress view
export const PROGRESS_WEEKS = 4

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
 * Groups logs by week starting from the most recent Monday
 */
function groupLogsByWeek(logs: WorkoutLog[]) {
  if (!logs.length) return { weeklyGroups: new Map<string, WorkoutLog[]>() }

  // Sort logs by date (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
  )

  // Get the most recent Monday
  const now = new Date()
  const mostRecentMonday = new Date(now)
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  mostRecentMonday.setDate(diff)
  mostRecentMonday.setHours(0, 0, 0, 0)

  // Group logs by week
  const weeklyGroups = new Map<string, WorkoutLog[]>()
  
  sortedLogs.forEach(log => {
    const logDate = new Date(log.performed_at)
    const weekStart = new Date(logDate)
    const dayOfWeek = logDate.getDay()
    const diff = logDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Get Monday of the log's week
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)
    
    const weekKey = weekStart.toISOString().split('T')[0]
    
    if (!weeklyGroups.has(weekKey)) {
      weeklyGroups.set(weekKey, [])
    }
    weeklyGroups.get(weekKey)?.push(log)
  })

  return { weeklyGroups }
}

/**
 * Processes workout logs into a progression-based weekly data structure
 * where entries for the same exercise show progress over weeks
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
      // Keep the one with the highest volume (weight * reps)
      const existingLog = acc[existingIndex]
      const currentVolume = current.weight * current.avg_reps
      const existingVolume = existingLog.weight * existingLog.avg_reps
      
      if (currentVolume > existingVolume) {
        acc[existingIndex] = current
      }
    }
    return acc
  }, [])

  // Group logs by exercise_name
  const exerciseGroups: Record<string, WorkoutLog[]> = {}
  deduplicatedLogs.forEach((log) => {
    if (!exerciseGroups[log.exercise_name]) {
      exerciseGroups[log.exercise_name] = []
    }
    exerciseGroups[log.exercise_name].push(log)
  })

  // Group logs by week
  const { weeklyGroups } = groupLogsByWeek(deduplicatedLogs)
  
  // Generate week labels (most recent week first)
  const weekLabels = Array.from(weeklyGroups.keys())
    .sort()
    .reverse()
    .slice(0, PROGRESS_WEEKS)
    .map((_, index) => `Week ${index + 1}`)

  // If no weeks found, default to current week
  if (weekLabels.length === 0) {
    weekLabels.push('Current Week')
  }

  // Process each exercise's data
  const weeklyData = Object.entries(exerciseGroups).map(([exerciseName, exerciseLogs]) => {
    // Sort exercise logs by date (newest first)
    const sortedExerciseLogs = [...exerciseLogs].sort((a, b) => 
      new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime()
    )

    // Group logs by week
    const logsByWeek = new Map<string, WorkoutLog[]>()
    
    sortedExerciseLogs.forEach(log => {
      const logDate = new Date(log.performed_at)
      const weekStart = new Date(logDate)
      const dayOfWeek = logDate.getDay()
      const diff = logDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Get Monday of the log's week
      weekStart.setDate(diff)
      weekStart.setHours(0, 0, 0, 0)
      
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!logsByWeek.has(weekKey)) {
        logsByWeek.set(weekKey, [])
      }
      logsByWeek.get(weekKey)?.push(log)
    })

    // Get the most recent weeks
    const recentWeeks = Array.from(logsByWeek.entries())
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, PROGRESS_WEEKS)

    // Initialize weeks object with null values
    const weeks: Record<string, { reps: number; weight: number; date: string } | null> = {}
    weekLabels.forEach(label => {
      weeks[label] = null
    })

    // Fill in the weeks with data
    recentWeeks.forEach(([_, weekLogs], index) => {
      if (index < weekLabels.length) {
        // Find the best set for this week (highest volume)
        const bestSet = weekLogs.reduce((best, current) => {
          const currentVolume = current.weight * current.avg_reps
          const bestVolume = best ? best.weight * best.avg_reps : 0
          return currentVolume > bestVolume ? current : best
        }, weekLogs[0])

        weeks[weekLabels[index]] = {
          reps: bestSet.avg_reps,
          weight: bestSet.weight,
          date: bestSet.performed_at,
        }
      }
    })

    return {
      exerciseName,
      weeks,
    }
  })

  // Sort exercises by name
  weeklyData.sort((a, b) => a.exerciseName.localeCompare(b.exerciseName))

  return { weeklyData, weekLabels }
}

/**
 * Formats a date range for display
 */
export function formatWeekRange(weekIndex: number, mostRecentDate: Date): string {
  const startDate = new Date(mostRecentDate)
  startDate.setDate(mostRecentDate.getDate() - (6 - weekIndex) * 7)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  return `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`
}

/**
 * Gets the date range for a specific week label
 */
export function getWeekDateRange(weekLabel: string, mostRecentDate: Date): string {
  const weekIndex = parseInt(weekLabel.substring(1)) - 1
  const startDate = new Date(mostRecentDate)
  startDate.setDate(mostRecentDate.getDate() - (6 - weekIndex) * 7)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 6)

  return `${startDate.getDate()}/${startDate.getMonth() + 1} - ${endDate.getDate()}/${endDate.getMonth() + 1}`
}
