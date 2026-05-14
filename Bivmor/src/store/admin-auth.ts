// Admin Auth Store - Client-side state management
// مخزن حالة مصادقة الأدمين

import { create } from 'zustand';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  showLogin: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setShowLogin: (show: boolean) => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  showLogin: false,

  checkSession: async () => {
    try {
      const res = await fetch('/api/admin/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          set({ isAuthenticated: true, user: data.user, isLoading: false, showLogin: false });
          return;
        }
      }
      set({ isAuthenticated: false, user: null, isLoading: false });
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: 'placeholder',
        }),
      });

      // After attempting login, check session
      const sessionRes = await fetch('/api/admin/session');
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        if (data.authenticated) {
          set({ isAuthenticated: true, user: data.user, isLoading: false, showLogin: false });
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      // Sign out from NextAuth
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch {
      // Ignore errors
    }
    set({ isAuthenticated: false, user: null, showLogin: false });
  },

  setShowLogin: (show: boolean) => {
    set({ showLogin: show });
  },
}));
