// User Reminders API
// تذكيرات المستخدم

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserAuth } from '@/lib/auth/user-guard';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const reminders = await db.userReminder.findMany({
      where: { userId: authResult.user.id },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            slug: true,
            deadline: true,
            status: true,
            school: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { reminderDate: 'asc' },
    });

    return NextResponse.json({ data: reminders });
  } catch (error) {
    console.error('Get reminders error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل التذكيرات' },
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
    const { competitionId, reminderDate, notes } = body;

    if (!competitionId || !reminderDate) {
      return NextResponse.json(
        { error: 'معرف المباراة وتاريخ التذكير مطلوبان' },
        { status: 400 }
      );
    }

    // Check if competition exists
    const competition = await db.competition.findUnique({
      where: { id: competitionId },
    });

    if (!competition) {
      return NextResponse.json(
        { error: 'المباراة غير موجودة' },
        { status: 404 }
      );
    }

    const reminder = await db.userReminder.create({
      data: {
        userId: authResult.user.id,
        competitionId,
        reminderDate: new Date(reminderDate),
        notes: notes || null,
      },
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            slug: true,
            deadline: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ data: reminder }, { status: 201 });
  } catch (error) {
    console.error('Add reminder error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة التذكير' },
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
    const { id, reminderDate, notes, isNotified } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'معرف التذكير مطلوب' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await db.userReminder.findFirst({
      where: { id, userId: authResult.user.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'التذكير غير موجود' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (reminderDate !== undefined) updateData.reminderDate = new Date(reminderDate);
    if (notes !== undefined) updateData.notes = notes || null;
    if (isNotified !== undefined) updateData.isNotified = isNotified;

    const reminder = await db.userReminder.update({
      where: { id },
      data: updateData,
      include: {
        competition: {
          select: {
            id: true,
            title: true,
            slug: true,
            deadline: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ data: reminder });
  } catch (error) {
    console.error('Update reminder error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث التذكير' },
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
    const id = searchParams.get('id');
    const competitionId = searchParams.get('competitionId');

    if (id) {
      const existing = await db.userReminder.findFirst({
        where: { id, userId: authResult.user.id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'التذكير غير موجود' },
          { status: 404 }
        );
      }

      await db.userReminder.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (competitionId) {
      // Delete all reminders for a competition
      await db.userReminder.deleteMany({
        where: {
          userId: authResult.user.id,
          competitionId,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'معرف التذكير أو المباراة مطلوب' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete reminder error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف التذكير' },
      { status: 500 }
    );
  }
}
