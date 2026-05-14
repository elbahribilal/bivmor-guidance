// Admin Authentication Configuration
// نظام المصادقة الخاص بنظام الإدارة (نسخة مستقلة)

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { db } from '@/lib/db';

/**
 * NextAuth configuration for the admin system.
 * This is a standalone copy that can be pointed to a different database
 * or auth provider when the admin system is deployed separately.
 */
export const adminAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error('بيانات الدخول غير صحيحة');
        }

        if (!user.password) {
          throw new Error('بيانات الدخول غير صحيحة');
        }

        if (!user.isActive) {
          throw new Error('هذا الحساب معطل');
        }

        const isValidPassword = await compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error('بيانات الدخول غير صحيحة');
        }

        // Only allow ADMIN and EDITOR roles
        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
          throw new Error('ليس لديك صلاحية الوصول');
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
        token.role = (user as { role: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role: string }).role = token.role as string;
        (session.user as { id: string }).id = token.id as string;
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
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

/**
 * Backward compatibility: also export as authOptions
 * to match the existing import paths.
 */
export const authOptions = adminAuthOptions;
