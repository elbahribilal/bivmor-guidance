// Seed Admin User - Run once to create default admin
// إنشاء حساب الأدمين الافتراضي

import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Verify this isn't called publicly by checking a secret header
    const authHeader = request.headers.get('x-admin-init');
    if (authHeader !== 'bivmor-init-2024') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    // Check if admin already exists
    const existingAdmin = await db.user.findUnique({
      where: { email: 'admin@bivmor.ma' },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: 'حساب الأدمين موجود بالفعل', existing: true });
    }

    // Create admin user
    const hashedPassword = await hash('Bivmor@Admin2024!', 12);

    const admin = await db.user.create({
      data: {
        email: 'admin@bivmor.ma',
        name: 'مدير المنصة',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    return NextResponse.json({
      message: 'تم إنشاء حساب الأدمين بنجاح',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Error seeding admin:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء حساب الأدمين' }, { status: 500 });
  }
}
