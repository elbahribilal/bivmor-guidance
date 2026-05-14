// User Auth Guard for API Routes
// حماية مسارات API الخاصة بالمستخدمين العاديين

import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/user-auth';

export async function requireUserAuth(request: NextRequest): Promise<
  | { authorized: true; user: { id: string; email: string; name: string | null } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const session = await getUserSession();
    if (!session) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'يجب تسجيل الدخول أولاً' },
          { status: 401 }
        ),
      };
    }
    return { authorized: true, user: session };
  } catch {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'خطأ في التحقق من الهوية' },
        { status: 500 }
      ),
    };
  }
}
