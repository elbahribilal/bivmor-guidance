// Admin API Client - Standalone admin-specific API wrapper
// عميل API الخاص بنظام الإدارة (مستقل)

import type {
  Competition,
  School,
  Category,
  City,
  Level,
  DashboardStats,
  CompetitionStatus,
  CompetitionType,
  SchoolType,
  SiteSettingsMap,
  Notification,
  NotificationType,
  News,
  ActivityLog,
  PaginatedResponse,
  CompetitionFilters,
  SchoolFilters,
  NewsFilters,
} from '@/types';
import { logAdminAction } from './admin-logger';

// ============================================
// CONFIGURATION
// ============================================

let adminApiBaseUrl = '/api';

/**
 * Configure the admin API base URL.
 * This allows pointing to a different server when admin is deployed separately.
 */
export function configureAdminApi(config: { baseUrl: string }) {
  adminApiBaseUrl = config.baseUrl;
}

/**
 * Get the current admin API base URL.
 */
export function getAdminApiBaseUrl(): string {
  return adminApiBaseUrl;
}

// ============================================
// INTERNAL HELPERS
// ============================================

function getAuthHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
  };
}

async function fetchAdminApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${adminApiBaseUrl}${endpoint}`, {
    credentials: 'include', // <=== أضف هذا السطر السحري هنا!
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

export const adminCompetitionsApi = {
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

    return fetchAdminApi<PaginatedResponse<Competition>>(`/competitions?${params.toString()}`);
  },

  get: async (id: string): Promise<{ data: Competition }> => {
    return fetchAdminApi<{ data: Competition }>(`/competitions/${id}`);
  },

  create: async (data: Partial<Competition>): Promise<{ data: Competition }> => {
    logAdminAction('CREATE', 'competition', undefined, { title: data.title });
    return fetchAdminApi<{ data: Competition }>('/competitions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<Competition>): Promise<{ data: Competition }> => {
    logAdminAction('UPDATE', 'competition', id, { title: data.title });
    return fetchAdminApi<{ data: Competition }>(`/competitions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    logAdminAction('DELETE', 'competition', id);
    return fetchAdminApi<{ success: boolean }>(`/competitions/${id}`, {
      method: 'DELETE',
    });
  },

  autoUpdateStatus: async (): Promise<{
    success: boolean;
    updatedCount: number;
    details: {
      expiredFromOpen: number;
      closedByRegistration: number;
      upcomingToOpen: number;
      upcomingExpired: number;
      closingSoon: number;
    };
  }> => {
    logAdminAction('STATUS_UPDATE', 'competition', undefined, { action: 'auto-update-status' });
    return fetchAdminApi('/competitions/auto-update-status', {
      method: 'POST',
    });
  },
};

// ============================================
// SCHOOLS API
// ============================================

export const adminSchoolsApi = {
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

    return fetchAdminApi<PaginatedResponse<School>>(`/schools?${params.toString()}`);
  },

  get: async (id: string): Promise<{ data: School }> => {
    return fetchAdminApi<{ data: School }>(`/schools/${id}`);
  },

  create: async (data: Partial<School>): Promise<{ data: School }> => {
    logAdminAction('CREATE', 'school', undefined, { name: data.name });
    return fetchAdminApi<{ data: School }>('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<School>): Promise<{ data: School }> => {
    logAdminAction('UPDATE', 'school', id, { name: data.name });
    return fetchAdminApi<{ data: School }>(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    logAdminAction('DELETE', 'school', id);
    return fetchAdminApi<{ success: boolean }>(`/schools/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// REFERENCE DATA API
// ============================================

export const adminCategoriesApi = {
  list: async (): Promise<{ data: Category[] }> => {
    return fetchAdminApi<{ data: Category[] }>('/categories');
  },
  create: async (data: Partial<Category>): Promise<{ data: Category }> => {
    logAdminAction('CREATE', 'category', undefined, { name: data.name });
    return fetchAdminApi<{ data: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const adminCitiesApi = {
  list: async (): Promise<{ data: City[] }> => {
    return fetchAdminApi<{ data: City[] }>('/cities');
  },
};

export const adminLevelsApi = {
  list: async (): Promise<{ data: Level[] }> => {
    return fetchAdminApi<{ data: Level[] }>('/levels');
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const adminDashboardApi = {
  stats: async (): Promise<{ data: DashboardStats }> => {
    return fetchAdminApi<{ data: DashboardStats }>('/dashboard/stats');
  },
};

// ============================================
// SETTINGS API
// ============================================

export const adminSettingsApi = {
  get: async (): Promise<{ data: SiteSettingsMap }> => {
    return fetchAdminApi<{ data: SiteSettingsMap }>('/settings');
  },
  update: async (settings: SiteSettingsMap): Promise<{ data: SiteSettingsMap }> => {
    logAdminAction('UPDATE', 'settings', undefined, { keys: Object.keys(settings) });
    return fetchAdminApi<{ data: SiteSettingsMap }>('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    });
  },
};

// ============================================
// NOTIFICATIONS API
// ============================================

export const adminNotificationsApi = {
  list: async (options?: { limit?: number; unreadOnly?: boolean }): Promise<{ data: Notification[]; unreadCount: number }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.unreadOnly) params.set('unreadOnly', 'true');
    return fetchAdminApi<{ data: Notification[]; unreadCount: number }>(`/notifications?${params.toString()}`);
  },

  markRead: async (id: string): Promise<{ success: boolean }> => {
    return fetchAdminApi<{ success: boolean }>('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ markReadId: id }),
    });
  },

  markAllRead: async (): Promise<{ success: boolean }> => {
    return fetchAdminApi<{ success: boolean }>('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ markAllRead: true }),
    });
  },

  create: async (data: { title: string; message: string; type?: NotificationType }): Promise<{ data: Notification }> => {
    logAdminAction('CREATE', 'notification', undefined, { title: data.title });
    return fetchAdminApi<{ data: Notification }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    logAdminAction('DELETE', 'notification', id);
    return fetchAdminApi<{ success: boolean }>(`/notifications?id=${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// NEWS API
// ============================================

export const adminNewsApi = {
  list: async (filters: NewsFilters = {}): Promise<PaginatedResponse<News>> => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.publishedOnly === false) params.set('publishedOnly', 'false');

    return fetchAdminApi<PaginatedResponse<News>>(`/news?${params.toString()}`);
  },

  get: async (id: string): Promise<{ data: News }> => {
    return fetchAdminApi<{ data: News }>(`/news/${id}`);
  },

  create: async (data: Partial<News>): Promise<{ data: News }> => {
    logAdminAction('CREATE', 'news', undefined, { title: data.title });
    return fetchAdminApi<{ data: News }>('/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<News>): Promise<{ data: News }> => {
    logAdminAction('UPDATE', 'news', id, { title: data.title });
    return fetchAdminApi<{ data: News }>(`/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<{ success: boolean }> => {
    logAdminAction('DELETE', 'news', id);
    return fetchAdminApi<{ success: boolean }>(`/news/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// ACTIVITY LOG API
// ============================================

export const adminActivityApi = {
  list: async (options?: { limit?: number; entity?: string; action?: string }): Promise<{ data: ActivityLog[]; pagination: { total: number; limit: number } }> => {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.entity) params.set('entity', options.entity);
    if (options?.action) params.set('action', options.action);
    return fetchAdminApi<{ data: ActivityLog[]; pagination: { total: number; limit: number } }>(`/admin/activity?${params.toString()}`);
  },

  create: async (data: { action: string; entity: string; entityId?: string; details?: string }): Promise<{ data: ActivityLog }> => {
    return fetchAdminApi<{ data: ActivityLog }>('/admin/activity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// ADMIN AUTH API
// ============================================

export const adminAuthApi = {
  checkSession: async (): Promise<{ authenticated: boolean; user?: { id: string; email: string; name: string | null; role: string } }> => {
    try {
      const res = await fetch(`${adminApiBaseUrl}/admin/session`);
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
      const csrfRes = await fetch(`${adminApiBaseUrl}/auth/csrf`);
      const csrfData = await csrfRes.json();

      // Sign in with credentials
      await fetch(`${adminApiBaseUrl}/auth/callback/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: csrfData.csrfToken,
        }),
        redirect: 'manual',
      });

      logAdminAction('LOGIN', 'user', undefined, { email });

      // Check session after login
      const sessionRes = await fetch(`${adminApiBaseUrl}/admin/session`);
      const sessionData = await sessionRes.json();
      return sessionData.authenticated === true;
    } catch {
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      logAdminAction('LOGOUT', 'user');
      await fetch(`${adminApiBaseUrl}/auth/signout`, { method: 'POST' });
    } catch {
      // Ignore
    }
  },

  seedAdmin: async (): Promise<void> => {
    try {
      await fetch(`${adminApiBaseUrl}/admin/seed`, {
        method: 'POST',
        headers: { 'x-admin-init': 'bivmor-init-2024' },
      });
    } catch {
      // Ignore
    }
  },
};
