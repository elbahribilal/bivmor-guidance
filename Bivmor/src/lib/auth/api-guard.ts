// API Route Protection Helper
// حماية مسارات API الخاصة بالإدارة

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

/**
 * Verify that the request comes from an authenticated admin user.
 * Returns the admin session if valid, or a 401/403 response if not.
 */
export async function requireAdminAuth(request: NextRequest): Promise<
  | { authorized: true; user: { id: string; email: string; name: string | null; role: string } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'يجب تسجيل الدخول أولاً' },
          { status: 401 }
        ),
      };
    }

    const user = session.user as { id: string; email: string; name: string | null; role: string };

    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'ليس لديك صلاحية تنفيذ هذا الإجراء' },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, user };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'حدث خطأ أثناء التحقق من الهوية' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Wrap an API handler with admin authentication.
 * Usage: export const POST = withAdminAuth(async (request) => { ... });
 */
export function withAdminAuth(
  handler: (request: NextRequest, context?: { params: Promise<{ id: string }> }) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: { params: Promise<{ id: string }> }) => {
    const authResult = await requireAdminAuth(request);

    if (!authResult.authorized) {
      return authResult.response;
    }

    return handler(request, context);
  };
}
