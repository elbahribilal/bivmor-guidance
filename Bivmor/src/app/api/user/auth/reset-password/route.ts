// User Password Reset API
// تغيير كلمة مرور المستخدم

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireUserAuth } from '@/lib/auth/user-guard';
import { verifyPassword, hashPassword, setUserCookie, createUserToken } from '@/lib/auth/user-auth';

export async function PUT(request: NextRequest) {
  try {
    const authResult = await requireUserAuth(request);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    // Validate
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'كلمة المرور الحالية والجديدة مطلوبتان' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await db.platformUser.findUnique({
      where: { id: authResult.user.id },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'لم يتم العثور على الحساب' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'كلمة المرور الحالية غير صحيحة' },
        { status: 401 }
      );
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await db.platformUser.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Refresh session token with updated data
    const token = await createUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    await setUserCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تغيير كلمة المرور' },
      { status: 500 }
    );
  }
}
