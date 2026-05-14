// User Applications API
// ترشيحات المستخدم

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserAuth } from '@/lib/auth/user-guard';

const VALID_STATUSES = ['لم أبدأ', 'أحضّر', 'قدّمت', 'قيد المراجعة', 'مقبول', 'مرفوض'];

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const applications = await db.userApplication.findMany({
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
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ data: applications });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الترشيحات' },
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
    const { competitionId, status, notes, appliedDate } = body;

    if (!competitionId) {
      return NextResponse.json(
        { error: 'معرف المباراة مطلوب' },
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

    const appStatus = status || 'لم أبدأ';
    if (!VALID_STATUSES.includes(appStatus)) {
      return NextResponse.json(
        { error: 'حالة الترشيح غير صالحة' },
        { status: 400 }
      );
    }

    // Upsert - create or update
    const application = await db.userApplication.upsert({
      where: {
        userId_competitionId: {
          userId: authResult.user.id,
          competitionId,
        },
      },
      create: {
        userId: authResult.user.id,
        competitionId,
        status: appStatus,
        notes: notes || null,
        appliedDate: appliedDate ? new Date(appliedDate) : null,
      },
      update: {
        status: appStatus,
        notes: notes !== undefined ? notes || null : undefined,
        appliedDate: appliedDate !== undefined ? (appliedDate ? new Date(appliedDate) : null) : undefined,
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

    return NextResponse.json({ data: application });
  } catch (error) {
    console.error('Add/update application error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الترشيح' },
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
      const existing = await db.userApplication.findFirst({
        where: { id, userId: authResult.user.id },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'الترشيح غير موجود' },
          { status: 404 }
        );
      }

      await db.userApplication.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (competitionId) {
      await db.userApplication.deleteMany({
        where: {
          userId: authResult.user.id,
          competitionId,
        },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'معرف الترشيح أو المباراة مطلوب' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Delete application error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الترشيح' },
      { status: 500 }
    );
  }
}
