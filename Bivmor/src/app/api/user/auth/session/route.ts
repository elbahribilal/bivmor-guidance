// User Session API
// الحصول على معلومات جلسة المستخدم

import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth/user-auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getUserSession();
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }

    // Get full user data from DB
    const user = await db.platformUser.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        preferredCityId: true,
        notificationPrefs: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
        preferredCityId: user.preferredCityId,
        notificationPrefs: user.notificationPrefs,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
