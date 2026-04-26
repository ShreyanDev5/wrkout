import { isBodyweightExerciseName } from "./bodyweight-utils"
import type { WorkoutLog } from "./types"

export type VolumeTrend = "up" | "same" | "down" | "new"

export interface ExerciseVolumeTrend {
	key: string
	exerciseName: string
	workoutDayId: string | null
	todayVolume: number
	previousVolume: number | null
	trend: VolumeTrend
}

export function calculateWorkoutVolume(
	weight: number,
	reps: number,
	sets: number,
	exerciseName?: string,
): number {
	const safeWeight = Number.isFinite(weight) ? Math.max(0, weight) : 0
	const safeReps = Number.isFinite(reps) ? Math.max(0, reps) : 0
	const safeSets = Number.isFinite(sets) ? Math.max(0, sets) : 0

	if (safeWeight === 0 && exerciseName && isBodyweightExerciseName(exerciseName)) {
		return safeReps * safeSets
	}

	return safeWeight * safeReps * safeSets
}

export function createExerciseTrendKey(exerciseId: string): string {
	return exerciseId;
}

function hasValidSetAndRepData(log: WorkoutLog): boolean {
	return (log.avg_reps ?? 0) > 0 && (log.sets ?? 0) > 0
}

function resolveTrend(todayVolume: number, previousVolume: number | null): VolumeTrend {
	if (previousVolume === null) {
		return "new"
	}

	const threshold = Math.max(1, Math.abs(previousVolume) * 0.01)
	const delta = todayVolume - previousVolume

	if (Math.abs(delta) <= threshold) {
		return "same"
	}

	return delta > 0 ? "up" : "down"
}

export function buildExerciseVolumeTrendMap(
	logs: WorkoutLog[],
	today: string,
): Map<string, ExerciseVolumeTrend> {
	const dailyVolumeByKey = new Map<string, Map<string, number>>()

	for (const log of logs) {
		if (!hasValidSetAndRepData(log)) {
			continue
		}

		const key = createExerciseTrendKey(log.exercise_id)
		const volume = calculateWorkoutVolume(log.weight, log.avg_reps, log.sets, log.exercise_name)

		const byDate = dailyVolumeByKey.get(key) ?? new Map<string, number>()
		byDate.set(log.performed_at, (byDate.get(log.performed_at) ?? 0) + volume)
		dailyVolumeByKey.set(key, byDate)
	}

	const trendMap = new Map<string, ExerciseVolumeTrend>()

	for (const [key, byDate] of dailyVolumeByKey.entries()) {
		const todayVolume = byDate.get(today)

		if (todayVolume === undefined) {
			continue
		}

		let previousDate: string | null = null
		for (const date of byDate.keys()) {
			if (date < today && (previousDate === null || date > previousDate)) {
				previousDate = date
			}
		}

		const previousVolume = previousDate ? (byDate.get(previousDate) ?? null) : null
		const exerciseId = key
		// We don't have exerciseName and workoutDayId directly from the key anymore,
		// but the frontend UI just needs the trend. We can pass the key back as exerciseId.
		
		trendMap.set(key, {
			key,
			exerciseName: "", // Will be pulled from log in progress-screen
			workoutDayId: null, // No longer strictly tied to a day ID
			todayVolume,
			previousVolume,
			trend: resolveTrend(todayVolume, previousVolume),
		})
	}

	return trendMap
}
