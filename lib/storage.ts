// Keys for localStorage
const PROGRESS_STATE_KEY = 'lastProgressState';
const WORKOUT_SECTION_KEY = 'lastWorkoutSection';

type ProgressState = {
  mainFilter: string;
  chartExerciseFilter: string;
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