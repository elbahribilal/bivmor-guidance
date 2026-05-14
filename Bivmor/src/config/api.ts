// API Endpoints Configuration
// Centralized API URLs for easy migration to separate backend

import { envConfig } from './env';

const API_BASE = envConfig.api.baseUrl;
const ADMIN_BASE = envConfig.api.adminPrefix;

export const apiConfig = {
  // Public endpoints
  public: {
    competitions: `${API_BASE}/competitions`,
    competition: (id: string) => `${API_BASE}/competitions/${id}`,
    schools: `${API_BASE}/schools`,
    school: (id: string) => `${API_BASE}/schools/${id}`,
    categories: `${API_BASE}/categories`,
    cities: `${API_BASE}/cities`,
    regions: `${API_BASE}/regions`,
    levels: `${API_BASE}/levels`,
    search: `${API_BASE}/search`,
    searchSuggestions: `${API_BASE}/search/suggestions`,
    news: `${API_BASE}/news`,
    notifications: `${API_BASE}/notifications`,
    settings: `${API_BASE}/settings`,
    dashboardStats: `${API_BASE}/dashboard/stats`,
    autoUpdateStatus: `${API_BASE}/competitions/auto-update-status`,
  },

  // Admin endpoints (can be pointed to external server)
  admin: {
    baseUrl: ADMIN_BASE,
    session: `${ADMIN_BASE}/session`,
    activity: `${ADMIN_BASE}/activity`,
    seed: `${ADMIN_BASE}/seed`,
  },

  // User endpoints
  user: {
    signup: `${API_BASE}/user/auth/signup`,
    login: `${API_BASE}/user/auth/login`,
    session: `${API_BASE}/user/auth/session`,
    logout: `${API_BASE}/user/auth/logout`,
    profile: `${API_BASE}/user/profile`,
    favorites: `${API_BASE}/user/favorites`,
    reminders: `${API_BASE}/user/reminders`,
    applications: `${API_BASE}/user/applications`,
    notifications: `${API_BASE}/user/notifications`,
  },

  // Auth endpoints
  auth: {
    csrf: `${API_BASE}/auth/csrf`,
    callback: `${API_BASE}/auth/callback/credentials`,
    signout: `${API_BASE}/auth/signout`,
  },
} as const;
