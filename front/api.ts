
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.0.45:8000/api';

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
  await AsyncStorage.setItem('access_token', data.access);
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

  if (res.status === 401 && retry) {
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
  default_location?: string;
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

  async updateMe(data: Partial<Pick<UserProfile, 'first_name' | 'last_name' | 'username' | 'default_location'>>): Promise<UserProfile> {
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

export interface Task {
  id: number;
  title: string;
  category: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  transport_mode: string;
  estimated_transit_time: number;
}

export interface UserPreferences {
  default_transport_mode: string;
  transit_notifications: boolean;
  hobby_notifications: boolean;
}

export const DashboardAPI = {
  async getTimeline(date?: string): Promise<Task[]> {
    const path = date ? `/dashboard/timeline/?date=${date}` : '/dashboard/timeline/';
    const cacheKey = `@timeline_cache_${date || 'today'}`;

    const isOffline = await AsyncStorage.getItem('offline_mode') === 'true';

    if (isOffline) {
      console.log("Mod Offline activat: Citim datele din cache-ul telefonului.");
      const cachedData = await AsyncStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : [];
    }

    try {
      const data = await apiFetch<Task[]>(path);
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (error) {
      console.log("Eroare de rețea. Încercăm să încărcăm din cache...");
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) return JSON.parse(cachedData);
      throw error;
    }
  },

  async deleteTask(taskId: number): Promise<void> {
    return apiFetch(`/dashboard/tasks/${taskId}/`, {
      method: 'DELETE',
    });
  },
  async createTask(data: Partial<Task>): Promise<Task> {
    return apiFetch<Task>('/dashboard/tasks/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async estimateTransit(data: Partial<Task>): Promise<{ estimated_transit_time: number }> {
    return apiFetch<{ estimated_transit_time: number }>('/dashboard/tasks/estimate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async suggestLocations(query: string): Promise<string[]> {
    return apiFetch<string[]>(`/dashboard/locations/suggest/?q=${encodeURIComponent(query)}`);
  }
};

export const SettingsAPI = {
  async getPreferences(): Promise<UserPreferences> {
    return apiFetch<UserPreferences>('/settings/preferences/');
  },
  async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
    return apiFetch<UserPreferences>('/settings/preferences/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  async suggestLocations(query: string): Promise<string[]> {
    return apiFetch<string[]>(`/dashboard/locations/suggest/?q=${encodeURIComponent(query)}`);
  }
};