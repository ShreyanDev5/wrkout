const BODYWEIGHT_EXERCISE_KEYWORDS = [
	"pullup",
	"chinup",
	"dip",
	"hanginglegraise",
	"pushup",
	"situp",
	"crunch",
	"plank",
	"muscleup",
	"burpee",
	"lunge",
	"squat",
	"glutebridge",
	"airsquat",
	"jumpsquat",
	"calfraise",
	"stepup",
	"mountainclimber",
	"boxjump",
	"jumpingjack",
	"hollowbody",
	"vup",
	"flutterkick",
	"russiantwist",
	"superman",
	"invertedrow",
	"pistolsquat",
	"nordic",
	"bicyclecrunch",
	"toestobar",
] as const

function normalizeExerciseName(exerciseName: string): string {
	return exerciseName.toLowerCase().replace(/[^a-z0-9]+/g, "")
}

export function isBodyweightExerciseName(exerciseName: string): boolean {
	const normalizedName = normalizeExerciseName(exerciseName)

	if (!normalizedName) {
		return false
	}

	return BODYWEIGHT_EXERCISE_KEYWORDS.some((keyword) => normalizedName.includes(keyword))
}