// Keys for localStorage
const WORKOUT_SECTION_KEY = 'lastWorkoutSection';
const SELECTED_WORKOUT_KEY = 'selectedWorkout';

export async function saveLastWorkoutSection(section: string): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(WORKOUT_SECTION_KEY, section);
  }
}

export async function loadLastWorkoutSection(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(WORKOUT_SECTION_KEY);
  }
  return null;
}

export async function saveSelectedWorkout(workoutId: string): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SELECTED_WORKOUT_KEY, workoutId);
  }
}

export async function loadSelectedWorkout(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(SELECTED_WORKOUT_KEY);
  }
  return null;
} 