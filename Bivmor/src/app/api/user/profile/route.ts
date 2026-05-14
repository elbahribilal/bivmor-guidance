// User Profile API
// ملف المستخدم الشخصي

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserAuth } from '@/lib/auth/user-guard';
import { setUserCookie, createUserToken } from '@/lib/auth/user-auth';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const user = await db.platformUser.findUnique({
      where: { id: authResult.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        preferredCityId: true,
        notificationPrefs: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        preferredCity: {
          select: { id: true, name: true, nameAr: true },
        },
        _count: {
          select: {
            favorites: true,
            userReminders: true,
            userApplications: true,
            userNotifications: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'لم يتم العثور على الحساب' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الملف الشخصي' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { name, phone, preferredCityId, notificationPrefs } = body;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (preferredCityId !== undefined) updateData.preferredCityId = preferredCityId || null;
    if (notificationPrefs !== undefined) updateData.notificationPrefs = notificationPrefs;

    const user = await db.platformUser.update({
      where: { id: authResult.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        preferredCityId: true,
        notificationPrefs: true,
      },
    });

    // Refresh session token with updated name
    const token = await createUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    await setUserCookie(token);

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الملف الشخصي' },
      { status: 500 }
    );
  }
}
