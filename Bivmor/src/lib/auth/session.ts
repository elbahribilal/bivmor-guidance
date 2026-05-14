// Admin Session Utilities
// أدوات جلسة الأدمين

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export interface AdminSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);

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

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();

  if (!session) {
    throw new Error('غير مصرح بالوصول');
  }

  return session;
}
