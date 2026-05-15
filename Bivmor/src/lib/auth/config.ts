// Admin Authentication Configuration
// نظام المصادقة الخاص بالأدمين

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // قمنا بتغيير المعرف ليتطابق مع طلب الـ Fetch في الواجهة الأمامية
      id: 'credentials', 
      name: 'Admin Login',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        // إذا لم يوجد المستخدم أو لا يملك كلمة مرور
        if (!user || !user.password) {
          return null;
        }

        // التحقق من حالة الحساب
        if (!user.isActive) {
          return null;
        }

        // مقارنة كلمة المرور
        const isValidPassword = await compare(credentials.password, user.password);
        if (!isValidPassword) {
          return null;
        }

        // التحقق من الرتبة (ADMIN أو EDITOR)
        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/?admin=true',
    error: '/?admin=true',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 ساعة
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
