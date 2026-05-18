
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.41.175:8000/api';

export const TokenStorage = {
  async getAccess(): Promise<string | null> {
    return AsyncStorage.getItem('access_token');
  },
  async getRefresh(): Promise<string | null> {
    return AsyncStorage.getItem('refresh_token');
  },
  async save(access: string, refresh: string): Promise<void> {
    await AsyncStorage.multiSet([
      ['access_token', access],
      ['refresh_token', refresh],
    ]);
  },
  async clear(): Promise<void> {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  },
};


async function refreshAccessToken(): Promise<string> {
  const refresh = await TokenStorage.getRefresh();
  if (!refresh) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    await TokenStorage.clear();
    throw new Error('Session expired');
  }

  const data = await res.json();
  
  if (data.refresh) {
    await TokenStorage.save(data.access, data.refresh);
  } else {
    await AsyncStorage.setItem('access_token', data.access);
  }
  
  return data.access;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const token = await TokenStorage.getAccess();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry && token) {
    const newToken = await refreshAccessToken();
    headers['Authorization'] = `Bearer ${newToken}`;
    
    const retried = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    if (!retried.ok) throw await parseError(retried);
    return retried.json();
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204 || res.status === 205) return undefined as T;
  return res.json();
}

async function parseError(res: Response): Promise<Error> {
  try {
    const body = await res.json();
    const message =
      body?.detail ||
      body?.non_field_errors?.[0] ||
      Object.values(body).flat().join(' ') ||
      `HTTP ${res.status}`;
    return new Error(message);
  } catch {
    return new Error(`HTTP ${res.status}`);
  }
}


export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'premium_user' | 'user';
  created_at: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}


export const AuthAPI = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const tokens = await apiFetch<AuthTokens>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    await TokenStorage.save(tokens.access, tokens.refresh);
    return tokens;
  },

  async register(payload: RegisterPayload): Promise<UserProfile> {
    return apiFetch<UserProfile>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, false);
  },

  async logout(): Promise<void> {
    const refresh = await TokenStorage.getRefresh();
    if (refresh) {
      try {
        await apiFetch('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh }),
        }, false);
      } catch {
      }
    }
    await TokenStorage.clear();
  },
};


export const UsersAPI = {
  async getMe(): Promise<UserProfile> {
    return apiFetch<UserProfile>('/users/me/');
  },

  async updateMe(data: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'username'>>): Promise<UserProfile> {
    return apiFetch<UserProfile>('/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(old_password: string, new_password: string): Promise<void> {
    return apiFetch('/users/me/change-password/', {
      method: 'POST',
      body: JSON.stringify({ old_password, new_password }),
    });
  },
};

export interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

export interface ExerciseSet {
  id?: number;
  exercise: number;
  exercise_name?: string;
  set_number: number;
  reps: number;
  weight_kg: string; // DecimalField vine adesea ca string în JSON
}

export interface WorkoutSession {
  id: number;
  user: number;
  date: string;
  notes: string;
  is_completed: boolean;
  sets: ExerciseSet[];
}

export interface WeeklySplit {
  id: number;
  day_of_week: string;
  muscle_group: string;
  exercises: number[]; // Array de ID-uri de exerciții
}

export const WorkoutsAPI = {
  getMuscleGroups: () => apiFetch<string[]>('/workouts/exercises/muscle_groups/'),

  getExercises: (muscleGroup?: string) => {
    const query = muscleGroup ? `?muscle_group=${muscleGroup}` : '';
    return apiFetch<Exercise[]>(`/workouts/exercises/${query}`);
  },

  getWeeklySplit: () => apiFetch<WeeklySplit[]>('/workouts/split/'),

  setWeeklySplit: (data: { day_of_week: string; muscle_group: string; exercises?: number[] }) =>
    apiFetch<WeeklySplit>('/workouts/split/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateWeeklySplit: (splitId: number, data: { day_of_week?: string; muscle_group?: string; exercises: number[] }) =>
    apiFetch<WeeklySplit>(`/workouts/split/${splitId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  startSession: (notes: string = "") =>
    apiFetch<WorkoutSession>('/workouts/start/', {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  logSet: (sessionId: number, data: { exercise_id: number; set_number: number; reps: number; weight_kg: number }) =>
    apiFetch<ExerciseSet>(`/workouts/sessions/${sessionId}/log/`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  finishSession: (sessionId: number) =>
    apiFetch<WorkoutSession>(`/workouts/sessions/${sessionId}/finish/`, {
      method: 'POST',
    }),
    getExerciseHistory: (exerciseId: number) =>
    apiFetch<{ date: string; sets: ExerciseSet[] }>(`/workouts/exercises/${exerciseId}/history/`),


  deleteSet: (setId: number) =>
    apiFetch<void>(`/workouts/sets/${setId}/`, {
      method: 'DELETE',
    }),

  deleteWeeklySplit: (splitId: number) =>
    apiFetch<void>(`/workouts/split/${splitId}/`, {
      method: 'DELETE',
    }),
};

export interface Hobby {
  id: number;
  name: string;
  description: string;
  weekly_goal: number;
  preferred_duration_mins: number;
  energy_required: 'Low' | 'Medium' | 'High';
  current_streak: number;
  progress_this_week: number;
  created_at?: string;
}

export interface HobbyLog {
  id?: number;
  hobby: number;
  date?: string;
  duration_mins: number;
  completed: boolean;
}

export const HobbiesAPI = {
  getHobbies: () => apiFetch<Hobby[]>('/hobbies/'),

  createHobby: (data: Partial<Hobby>) =>
    apiFetch<Hobby>('/hobbies/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteHobby: (id: number) =>
    apiFetch<void>(`/hobbies/${id}/`, {
      method: 'DELETE'
    }),

  suggestHobby: (minutes: number, energy: string) =>
    apiFetch<{ hobby?: string; reason?: string; error?: string }>(`/hobbies/suggest/?minutes=${minutes}&energy=${energy}`),

  logSession: (data: { hobby: number; duration_mins: number; completed?: boolean }) =>
    apiFetch<HobbyLog>('/hobbies/log/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
};
