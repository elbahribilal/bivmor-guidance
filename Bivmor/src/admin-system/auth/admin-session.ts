// Admin Session Utilities - Standalone Copy
// أدوات جلسة نظام الإدارة (نسخة مستقلة)

import { getServerSession } from 'next-auth';
import { adminAuthOptions } from './admin-config';
import type { AdminSession } from '../types/admin';

/**
 * Get the current admin session from the server side.
 * Returns null if not authenticated or not an admin/editor.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(adminAuthOptions);

  if (!session?.user) return null;

  const user = session.user as { id: string; email: string; name: string | null; role: string };

  if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Require an admin session. Throws if not authenticated.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error('غير مصرح بالوصول');
  }

  return session;
}
