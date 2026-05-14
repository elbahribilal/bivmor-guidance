// User Auth Store - Client-side state management
// مخزن حالة مصادقة المستخدم العادي

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  phone?: string | null;
  preferredCityId?: string | null;
  notificationPrefs?: string | null;
}

interface UserAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  showAuthModal: boolean;
  authMode: 'login' | 'signup';
  error: string | null;

  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; preferredCityId?: string; notificationPrefs?: string }) => Promise<boolean>;
  resetPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  setShowAuthModal: (show: boolean, mode?: 'login' | 'signup') => void;
  setError: (error: string | null) => void;
}

export const useUserAuthStore = create<UserAuthState>((set, get) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  showAuthModal: false,
  authMode: 'login',
  error: null,

  checkSession: async () => {
    try {
      const res = await fetch('/api/user/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          set({
            isAuthenticated: true,
            user: data.user,
            isLoading: false,
            showAuthModal: false,
          });
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
      set({ error: null });
      const res = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'حدث خطأ أثناء تسجيل الدخول' });
        return false;
      }

      set({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        showAuthModal: false,
        error: null,
      });
      return true;
    } catch {
      set({ error: 'حدث خطأ في الاتصال بالخادم' });
      return false;
    }
  },

  signup: async (email: string, password: string, name: string) => {
    try {
      set({ error: null });
      const res = await fetch('/api/user/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'حدث خطأ أثناء إنشاء الحساب' });
        return false;
      }

      set({
        isAuthenticated: true,
        user: data.user,
        isLoading: false,
        showAuthModal: false,
        error: null,
      });
      return true;
    } catch {
      set({ error: 'حدث خطأ في الاتصال بالخادم' });
      return false;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/user/auth/logout', { method: 'POST' });
    } catch {
      // Ignore errors
    }
    set({
      isAuthenticated: false,
      user: null,
      showAuthModal: false,
      error: null,
    });
  },

  updateProfile: async (profileData) => {
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok) {
        return false;
      }

      const currentUser = get().user;
      set({
        user: currentUser ? { ...currentUser, ...data.user } : data.user,
      });
      return true;
    } catch {
      return false;
    }
  },

  resetPassword: async (currentPassword: string, newPassword: string) => {
    try {
      const res = await fetch('/api/user/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        set({ error: data.error || 'حدث خطأ أثناء تغيير كلمة المرور' });
        return false;
      }

      set({ error: null });
      return true;
    } catch {
      set({ error: 'حدث خطأ في الاتصال بالخادم' });
      return false;
    }
  },

  setShowAuthModal: (show: boolean, mode?: 'login' | 'signup') => {
    set({
      showAuthModal: show,
      authMode: mode || get().authMode,
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
