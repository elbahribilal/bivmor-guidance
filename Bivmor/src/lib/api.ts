// API Helper Functions for Moroccan Educational Platform
// منصة المباريات والفرص التعليمية في المغرب

import type {
  Competition,
  School,
  Category,
  City,
  Level,
  Region,
  Notification,
  News,
  ActivityLog,
  PaginatedResponse,
  DashboardStats,
  SiteSettingsMap,
  SearchResult,
  CompetitionFilters,
  SchoolFilters,
  SearchFilters,
  NewsFilters,
} from '@/types';

const BASE_URL = '/api';

// Get auth cookies for authenticated requests
function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('غير مصرح بالوصول - يجب تسجيل الدخول أولاً');
    }
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================
// COMPETITIONS API
// ============================================

export const competitionsApi = {
  list: async (filters: CompetitionFilters = {}): Promise<PaginatedResponse<Competition>> => {
    const params = new URLSearchParams();
    if (filters.cityId) params.set('cityId', filters.cityId);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.levelId) params.set('levelId', filters.levelId);
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    if (filters.search) params.set('search', filters.search);
    if (filters.isFeatured) params.set('isFeatured', 'true');
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.sort) params.set('sort', filters.sort);

    return fetchApi<PaginatedResponse<Competition>>(`/competitions?${params.toString()}`);
  },

  get: async (id: string): Promise<{ data: Competition }> => {
    return fetchApi<{ data: Competition }>(`/competitions/${id}`);
  },

  create: async (data: Partial<Competition>): Promise<{ data: Competition }> => {
    return fetchApi<{ data: Competition }>('/competitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Competition>): Promise<{ data: Competition }> => {
    return fetchApi<{ data: Competition }>(`/competitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchApi<{ success: boolean }>(`/competitions/${id}`, {
      method: 'DELETE',
    });
  },

  autoUpdateStatus: async (): Promise<{ success: boolean; updatedCount: number; details: { expiredFromOpen: number; closedByRegistration: number; upcomingToOpen: number; upcomingExpired: number; closingSoon: number } }> => {
    return fetchApi<{ success: boolean; updatedCount: number; details: { expiredFromOpen: number; closedByRegistration: number; upcomingToOpen: number; upcomingExpired: number; closingSoon: number } }>('/competitions/auto-update-status', {
      method: 'POST',
    });
  },
};

// ============================================
// SCHOOLS API
// ============================================

export const schoolsApi = {
  list: async (filters: SchoolFilters = {}): Promise<PaginatedResponse<School>> => {
    const params = new URLSearchParams();
    if (filters.cityId) params.set('cityId', filters.cityId);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.levelId) params.set('levelId', filters.levelId);
    if (filters.type) params.set('type', filters.type);
    if (filters.search) params.set('search', filters.search);
    if (filters.isFeatured) params.set('isFeatured', 'true');
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));

    return fetchApi<PaginatedResponse<School>>(`/schools?${params.toString()}`);
  },

  get: async (id: string): Promise<{ data: School }> => {
    return fetchApi<{ data: School }>(`/schools/${id}`);
  },

  create: async (data: Partial<School>): Promise<{ data: School }> => {
    return fetchApi<{ data: School }>('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<School>): Promise<{ data: School }> => {
    return fetchApi<{ data: School }>(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchApi<{ success: boolean }>(`/schools/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// REFERENCE DATA API
// ============================================

export const categoriesApi = {
  list: async (): Promise<{ data: Category[] }> => {
    return fetchApi<{ data: Category[] }>('/categories');
  },

  create: async (data: Partial<Category>): Promise<{ data: Category }> => {
    return fetchApi<{ data: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const citiesApi = {
  list: async (): Promise<{ data: City[] }> => {
    return fetchApi<{ data: City[] }>('/cities');
  },
};

export const levelsApi = {
  list: async (): Promise<{ data: Level[] }> => {
    return fetchApi<{ data: Level[] }>('/levels');
  },
};

export const regionsApi = {
  list: async (): Promise<{ data: Region[] }> => {
    return fetchApi<{ data: Region[] }>('/regions');
  },
};

// ============================================
// SEARCH API
// ============================================

export const searchApi = {
  search: async (filters: SearchFilters = {}): Promise<{ data: SearchResult[] }> => {
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.cityId) params.set('cityId', filters.cityId);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.levelId) params.set('levelId', filters.levelId);
    if (filters.type) params.set('type', filters.type);

    return fetchApi<{ data: SearchResult[] }>(`/search?${params.toString()}`);
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  stats: async (): Promise<{ data: DashboardStats }> => {
    return fetchApi<{ data: DashboardStats }>('/dashboard/stats');
  },
};

// ============================================
// SETTINGS API
// ============================================

export const settingsApi = {
  get: async (): Promise<{ data: SiteSettingsMap }> => {
    return fetchApi<{ data: SiteSettingsMap }>('/settings');
  },

  update: async (settings: SiteSettingsMap): Promise<{ data: SiteSettingsMap }> => {
    return fetchApi<{ data: SiteSettingsMap }>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const notificationsApi = {
  list: async (options?: { limit?: number; unreadOnly?: boolean }): Promise<{ data: Notification[]; unreadCount: number }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    return fetchApi<{ data: Notification[]; unreadCount: number }>(`/notifications?${params.toString()}`);
  },

  markRead: async (id: string): Promise<{ success: boolean }> => {
    return fetchApi<{ success: boolean }>('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ markReadId: id }),
    });
  },

  markAllRead: async (): Promise<{ success: boolean }> => {
    return fetchApi<{ success: boolean }>('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ markAllRead: true }),
    });
  },

  create: async (data: { title: string; message: string; type?: string }): Promise<{ data: Notification }> => {
    return fetchApi<{ data: Notification }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchApi<{ success: boolean }>(`/notifications?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ADMIN AUTH API
// ============================================

export const adminAuthApi = {
  checkSession: async (): Promise<{ authenticated: boolean; user?: { id: string; email: string; name: string | null; role: string } }> => {
    try {
      const res = await fetch('/api/admin/session');
      if (res.ok) {
        return await res.json();
      }
      return { authenticated: false };
    } catch {
      return { authenticated: false };
    }
  },

  login: async (email: string, password: string): Promise<boolean> => {
    try {
      // Get CSRF token
      const csrfRes = await fetch('/api/auth/csrf');
      const csrfData = await csrfRes.json();

      // Sign in with credentials
      await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: csrfData.csrfToken,
        }),
        redirect: 'manual',
      });

      // Check session after login
      const sessionRes = await fetch('/api/admin/session');
      const sessionData = await sessionRes.json();
      return sessionData.authenticated === true;
    } catch {
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Ignore
    }
  },
};

// ============================================
// NEWS API
// ============================================

export const newsApi = {
  list: async (filters: NewsFilters = {}): Promise<PaginatedResponse<News>> => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.publishedOnly === false) params.set('publishedOnly', 'false');

    return fetchApi<PaginatedResponse<News>>(`/news?${params.toString()}`);
  },

  get: async (id: string): Promise<{ data: News }> => {
    return fetchApi<{ data: News }>(`/news/${id}`);
  },

  create: async (data: Partial<News>): Promise<{ data: News }> => {
    return fetchApi<{ data: News }>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<News>): Promise<{ data: News }> => {
    return fetchApi<{ data: News }>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    return fetchApi<{ success: boolean }>(`/news/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ACTIVITY LOG API
// ============================================

export const activityApi = {
  list: async (options?: { limit?: number; entity?: string; action?: string }): Promise<{ data: ActivityLog[]; pagination: { total: number; limit: number } }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.entity) params.set('entity', options.entity);
    if (options?.action) params.set('action', options.action);
    return fetchApi<{ data: ActivityLog[]; pagination: { total: number; limit: number } }>(`/admin/activity?${params.toString()}`);
  },

  create: async (data: { action: string; entity: string; entityId?: string; details?: string }): Promise<{ data: ActivityLog }> => {
    return fetchApi<{ data: ActivityLog }>('/admin/activity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
