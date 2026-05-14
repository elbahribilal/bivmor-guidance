// User Notifications API
// تنبيهات المستخدم

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserAuth } from '@/lib/auth/user-guard';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where: Record<string, unknown> = { userId: authResult.user.id };
    if (unreadOnly) where.isRead = false;

    const notifications = await db.userNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await db.userNotification.count({
      where: {
        userId: authResult.user.id,
        isRead: false,
      },
    });

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    console.error('Get user notifications error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل التنبيهات' },
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
    const { markReadId, markAllRead } = body;

    if (markAllRead) {
      await db.userNotification.updateMany({
        where: {
          userId: authResult.user.id,
          isRead: false,
        },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (markReadId) {
      const notification = await db.userNotification.findFirst({
        where: {
          id: markReadId,
          userId: authResult.user.id,
        },
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'التنبيه غير موجود' },
          { status: 404 }
        );
      }

      await db.userNotification.update({
        where: { id: markReadId },
        data: { isRead: true },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'حدد التنبيه المطلوب تحديثه' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Update user notification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التنبيهات' },
      { status: 500 }
    );
  }
}
