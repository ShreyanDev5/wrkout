// Keys for localStorage
const PROGRESS_STATE_KEY = 'lastProgressState';
const WORKOUT_SECTION_KEY = 'lastWorkoutSection';
const SELECTED_WORKOUT_KEY = 'selectedWorkout';

type ProgressState = {
  mainFilter: string | null;
  chartExerciseFilter: string | null;
};

export async function saveLastProgressState(state: ProgressState): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROGRESS_STATE_KEY, JSON.stringify(state));
  }
}

export async function loadLastProgressState(): Promise<ProgressState | null> {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(PROGRESS_STATE_KEY);
    return data ? JSON.parse(data) : null;
  }
  return null;
}

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