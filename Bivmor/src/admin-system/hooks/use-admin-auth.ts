// Admin Auth Hook - Wraps the admin auth store
// خطاف مصادقة نظام الإدارة

'use client';

import { useAdminStore } from '../auth/admin-store';
import type { AdminUser } from '../types/admin';

export interface UseAdminAuthReturn {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether the auth state is still loading */
  isLoading: boolean;
  /** The current admin user, or null */
  user: AdminUser | null;
  /** Whether the login dialog should be shown */
  showLogin: boolean;
  /** Check the current session */
  checkSession: () => Promise<void>;
  /** Attempt to log in with credentials */
  login: (email: string, password: string) => Promise<boolean>;
  /** Log out the current user */
  logout: () => Promise<void>;
  /** Show or hide the login dialog */
  setShowLogin: (show: boolean) => void;
  /** Get the display name for the current user */
  displayName: string;
  /** Get the role label in Arabic */
  roleLabel: string;
  /** Whether the current user is an admin (not just editor) */
  isAdmin: boolean;
}

/**
 * Custom hook for admin authentication.
 * Wraps the Zustand store and provides computed values.
 */
export function useAdminAuth(): UseAdminAuthReturn {
  const {
    isAuthenticated,
    isLoading,
    user,
    showLogin,
    checkSession,
    login,
    logout,
    setShowLogin,
  } = useAdminStore();

  const displayName = user?.name || 'المسؤول';
  const roleLabel = user?.role === 'ADMIN' ? 'مدير' : 'محرر';
  const isAdmin = user?.role === 'ADMIN';

  return {
    isAuthenticated,
    isLoading,
    user,
    showLogin,
    checkSession,
    login,
    logout,
    setShowLogin,
    displayName,
    roleLabel,
    isAdmin,
  };
}
