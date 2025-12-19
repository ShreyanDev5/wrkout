
const { getExerciseWorkoutType } = require('./lib/utils');

const testCases = [
    'Cable Crunch',       // Expected: ['pull', 'leg']
    'Hanging Leg Raises', // Expected: ['pull', 'leg']
    'Wrist Curl',         // Expected: ['leg']
    'Bicep Curl',         // Expected: ['pull']
    'Bench Press',        // Expected: ['push']
    'Squat',              // Expected: ['leg']
    'Unknown Exercise'    // Expected: ['mixed']
];

console.log('--- Verification Results ---');
testCases.forEach(exercise => {
    const result = getExerciseWorkoutType(exercise);
    console.log(`"${exercise}" -> ${JSON.stringify(result)}`);
});
