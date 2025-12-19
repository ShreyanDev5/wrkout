
// Mock Config (copied from utils.tsx implementation plan)
const EXERCISE_CONFIG = [
    {
        keywords: ['cable crunch', 'hanging leg raises', 'hanging knee raises'],
        types: ['pull', 'leg']
    },
    {
        keywords: [
            'wrist curl', 'wrist extension', 'farmer', 'forearm',
            'reverse curl'
        ],
        types: ['leg']
    },
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
    {
        keywords: [
            'squat', 'leg', 'calf', 'thigh', 'hamstring', 'glute', 'quad', 'lunge',
            'hip thrust', 'step up', 'step down', 'bulgarian', 'abduction', 'adduction',
            'kickback', 'rdl', 'stiff leg', 'good morning'
        ],
        types: ['leg']
    },
    {
        keywords: [
            'bench', 'press', 'push', 'chest', 'shoulder', 'tricep', 'incline', 'decline',
            'dip', 'overhead', 'ohp', 'lateral', 'front raise', 'skull', 'extension', 'pushdown',
            'arnold', 'military', 'pec deck', 'crossover'
        ],
        types: ['push']
    },
    {
        keywords: [
            'row', 'pull', 'curl', 'back', 'bicep', 'trap', 'lat', 'chin',
            'face pull', 'rear delt', 'rack pull', 't-bar', 't bar'
        ],
        types: ['pull']
    }
];

function getExerciseWorkoutType(exerciseName) {
    const name = exerciseName.toLowerCase();
    for (const config of EXERCISE_CONFIG) {
        if (config.keywords.some(keyword => name.includes(keyword))) {
            return config.types;
        }
    }
    return ['mixed'];
}

const testCases = [
    'Cable Crunch',       // Expected: ['pull', 'leg']
    'Hanging Leg Raises', // Expected: ['pull', 'leg']
    'Wrist Curl',         // Expected: ['leg']
    'Bicep Curl',         // Expected: ['pull']
    'Bench Press',        // Expected: ['push']
    'Squat',              // Expected: ['leg']
    'Unknown Exercise',   // Expected: ['mixed']
    'Forearm Roll',       // Expected: ['leg']
    'Farmer\'s Carry'     // Expected: ['leg']
];

console.log('--- Verification Results ---');
testCases.forEach(exercise => {
    const result = getExerciseWorkoutType(exercise);
    console.log(`"${exercise}" -> ${JSON.stringify(result)}`);
});
