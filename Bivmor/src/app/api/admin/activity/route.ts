// Admin Activity Log API
// سجل نشاط المسؤولين

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth/admin-guard';

export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const entity = searchParams.get('entity') || undefined;
    const action = searchParams.get('action') || undefined;

    const where: Record<string, string> = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const logs = await db.activityLog.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const total = await db.activityLog.count(
      Object.keys(where).length > 0 ? { where } : undefined
    );

    return NextResponse.json({
      data: logs,
      pagination: {
        total,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب سجل النشاط' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (!authResult.authorized) {
    return authResult.response;
  }

  try {
    const body = await request.json();
    const { action, entity, entityId, details } = body;

    if (!action || !entity) {
      return NextResponse.json(
        { error: 'الإجراء والكيان مطلوبان' },
        { status: 400 }
      );
    }

    const log = await db.activityLog.create({
      data: {
        userId: authResult.authorized ? authResult.user.id : null,
        action,
        entity,
        entityId: entityId || null,
        details: details || null,
      },
    });

    return NextResponse.json({ data: log }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء سجل النشاط' },
      { status: 500 }
    );
  }
}
