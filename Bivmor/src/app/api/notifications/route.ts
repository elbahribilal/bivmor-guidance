import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth/api-guard';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const where = unreadOnly ? { isRead: false } : {};

    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await db.notification.count({
      where: { isRead: false },
    });

    // If no notifications exist yet, create some seed notifications
    if ((await db.notification.count()) === 0) {
      await db.notification.createMany({
        data: [
          {
            title: 'مباراة EMI 2025 مفتوحة',
            message: 'تم فتح باب التسجيل لمباراة المدرسة المحمدية للمهندسين. سارع بالتسجيل!',
            type: 'SUCCESS',
            isRead: false,
          },
          {
            title: 'اقتراب موعد مباراة ENA',
            message: 'بقي أقل من أسبوع على إغلاق باب التسجيل لمباراة المدرسة الوطنية للإدارة.',
            type: 'WARNING',
            isRead: false,
          },
          {
            title: 'مباريات جديدة متاحة',
            message: 'تمت إضافة 3 مباريات جديدة في تصنيف مدارس الهندسة.',
            type: 'INFO',
            isRead: false,
          },
          {
            title: 'انتهت مباراة ISCAE 2024',
            message: 'انتهى أجل التسجيل لمباراة المعهد الأعلى للتجارة وإدارة المقاولات.',
            type: 'ERROR',
            isRead: true,
          },
          {
            title: 'تحديث المنصة',
            message: 'تم إضافة ميزة المفضلة والبحث المحسن. جرّبها الآن!',
            type: 'INFO',
            isRead: true,
          },
        ],
      });

      const newNotifications = await db.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      const newUnreadCount = await db.notification.count({
        where: { isRead: false },
      });

      return NextResponse.json({
        data: newNotifications,
        unreadCount: newUnreadCount,
      });
    }

    return NextResponse.json({
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const body = await request.json();
    const { markAllRead, markReadId } = body;

    if (markAllRead) {
      await db.notification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    if (markReadId) {
      await db.notification.update({
        where: { id: markReadId },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const body = await request.json();
    const { title, message, type } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'العنوان والرسالة مطلوبان' }, { status: 400 });
    }

    const notification = await db.notification.create({
      data: {
        title,
        message,
        type: type || 'INFO',
        isRead: false,
      },
    });

    return NextResponse.json({ data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request)
    if (!authResult.authorized) return authResult.response

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف الإشعار مطلوب' }, { status: 400 });
    }

    await db.notification.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
