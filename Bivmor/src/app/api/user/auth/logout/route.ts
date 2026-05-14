// User Logout API
// تسجيل خروج المستخدم

import { NextResponse } from 'next/server';
import { clearUserCookie } from '@/lib/auth/user-auth';

export async function POST() {
  try {
    await clearUserCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تسجيل الخروج' },
      { status: 500 }
    );
  }
}
