// User Favorites API
// مفضلات المستخدم

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
    const itemType = searchParams.get('itemType');

    const where: Record<string, unknown> = { userId: authResult.user.id };
    if (itemType) where.itemType = itemType;

    const favorites = await db.userFavorite.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل المفضلات' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { itemId, itemType } = body;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'معرف العنصر ونوعه مطلوبان' },
        { status: 400 }
      );
    }

    if (!['competition', 'school'].includes(itemType)) {
      return NextResponse.json(
        { error: 'نوع العنصر غير صالح' },
        { status: 400 }
      );
    }

    // Check if already favorited
    const existing = await db.userFavorite.findFirst({
      where: {
        userId: authResult.user.id,
        itemId,
        itemType,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'العنصر موجود بالفعل في المفضلة' },
        { status: 409 }
      );
    }

    const favorite = await db.userFavorite.create({
      data: {
        userId: authResult.user.id,
        itemId,
        itemType,
      },
    });

    return NextResponse.json({ data: favorite }, { status: 201 });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة المفضلة' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const itemType = searchParams.get('itemType');
    const favoriteId = searchParams.get('id');

    if (favoriteId) {
      // Delete by favorite ID
      const favorite = await db.userFavorite.findFirst({
        where: {
          id: favoriteId,
          userId: authResult.user.id,
        },
      });

      if (!favorite) {
        return NextResponse.json(
          { error: 'العنصر غير موجود في المفضلة' },
          { status: 404 }
        );
      }

      await db.userFavorite.delete({ where: { id: favoriteId } });
      return NextResponse.json({ success: true });
    }

    // Delete by item ID + type
    if (!itemId || !itemType) {
      return NextResponse.json(
        { error: 'معرف العنصر ونوعه أو معرف المفضلة مطلوبان' },
        { status: 400 }
      );
    }

    const favorite = await db.userFavorite.findFirst({
      where: {
        userId: authResult.user.id,
        itemId,
        itemType,
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: 'العنصر غير موجود في المفضلة' },
        { status: 404 }
      );
    }

    await db.userFavorite.delete({ where: { id: favorite.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete favorite error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المفضلة' },
      { status: 500 }
    );
  }
}
