
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.2:8000/api';

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
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface NutritionTarget {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealFoodEntry {
  id: number;
  food_item: number;
  food_name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealInfo {
  id: number;
  name: string;
  meal_type: string;
  date: string;
  notes?: string;
  foods: MealFoodEntry[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface MacroSummary {
  date: string;
  target: NutritionTarget;
  consumed: NutritionTarget;
  remaining: NutritionTarget;
  meals: MealInfo[];
}

export interface FoodItem {
  id: number;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export const AuthAPI = {
  async login(email: string, password: string): Promise<AuthTokens> {
    const tokens = await apiFetch<AuthTokens>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, username: email, password }),
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

export const NutritionAPI = {
  async getMacroSummary(): Promise<MacroSummary> {
    return apiFetch<MacroSummary>('/nutrition/macros-summary/');
  },

  async getMeals(): Promise<MealInfo[]> {
    return apiFetch<MealInfo[]>('/nutrition/meals/');
  },

  async createMeal(name: string, meal_type = 'Breakfast'): Promise<MealInfo> {
    const today = new Date().toISOString().slice(0, 10);
    return apiFetch<MealInfo>('/nutrition/meals/', {
      method: 'POST',
      body: JSON.stringify({ name, meal_type, date: today }),
    });
  },

  async createFoodItem(payload: Omit<FoodItem, 'id'>): Promise<FoodItem> {
    return apiFetch<FoodItem>('/nutrition/foods/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async addFoodToMeal(mealId: number, foodItemId: number, quantityGrams: number) {
    return apiFetch<MealFoodEntry>(`/nutrition/meals/${mealId}/foods/`, {
      method: 'POST',
      body: JSON.stringify({ food_item: foodItemId, quantity_grams: quantityGrams }),
    });
  },

  async deleteMeal(mealId: number): Promise<void> {
    await apiFetch<void>(`/nutrition/meals/${mealId}/`, {
      method: 'DELETE',
    }, false);
  },
};
