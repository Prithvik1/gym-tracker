const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export class ApiError extends Error {}

export interface User {
  id: string;
  email: string;
  name: string;
  training_level: string | null;
  goal: string | null;
  weight: number | null;
  height: number | null;
  age: number | null;
  sex: string | null;
  created_at: string;
}

export interface AuthResult {
  access_token: string;
  user: User;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
}

export interface WorkoutEntryInput {
  exercise_id: string;
  weight?: number;
  weight_unit: 'kg' | 'lb';
  sets: number;
  reps: number;
  notes?: string;
}

export interface CoachExercise {
  name: string;
  sets: number;
  reps: number;
  notes?: string;
}

export interface CoachSuggestion {
  title: string;
  focus_area: string;
  exercises: CoachExercise[];
  rationale: string;
}

export interface Insights {
  detected_split: string | null;
  muscle_volume_7d: Record<string, number>;
  imbalances: string[];
}

export interface WorkoutLogEntry {
  exercise: { name: string } | null;
  sets: number;
  reps: number;
  weight: number | null;
  weight_unit: string;
  notes: string | null;
}

export interface WorkoutLog {
  id: string;
  date: string;
  notes: string | null;
  entries: WorkoutLogEntry[];
}

class ApiClient {
  token: string | null = null;

  private get headers() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    return headers;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers: this.headers });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = body.message;
      throw new ApiError(Array.isArray(message) ? message.join(', ') : message || 'Request failed');
    }
    return body as T;
  }

  signup(email: string, password: string, name: string) {
    return this.request<AuthResult>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  login(email: string, password: string) {
    return this.request<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  getMe() {
    return this.request<User>('/users/me');
  }

  setTrainingLevel(level: string) {
    return this.request<User>('/users/me/training-level', {
      method: 'PUT',
      body: JSON.stringify({ training_level: level }),
    });
  }

  getExercises(muscleGroup?: string) {
    const query = muscleGroup ? `?muscle_group=${encodeURIComponent(muscleGroup)}` : '';
    return this.request<Exercise[]>(`/exercises${query}`);
  }

  createWorkoutLog(date: string, entries: WorkoutEntryInput[], notes?: string) {
    return this.request<WorkoutLog>('/workout-logs', {
      method: 'POST',
      body: JSON.stringify({ date, entries, ...(notes ? { notes } : {}) }),
    });
  }

  getWorkoutLogs(range: 'week' | 'month' = 'week') {
    return this.request<WorkoutLog[]>(`/workout-logs?range=${range}`);
  }

  getInsights() {
    return this.request<Insights>('/workout-logs/insights');
  }

  suggestWorkout(focus?: string) {
    return this.request<CoachSuggestion>('/coach/suggest-workout', {
      method: 'POST',
      body: JSON.stringify(focus ? { focus } : {}),
    });
  }
}

export const api = new ApiClient();
