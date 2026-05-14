// Auth System Configuration
// Separate admin auth from user auth

import { envConfig } from './env';

export const authConfig = {
  // Admin authentication (NextAuth.js)
  admin: {
    provider: 'nextauth' as const,
    sessionStrategy: 'jwt' as const,
    sessionMaxAge: envConfig.adminAuth.sessionMaxAge,
    secret: envConfig.adminAuth.secret,
    pages: {
      login: '/?admin=true',
      error: '/?admin=true',
    },
    allowedRoles: ['ADMIN', 'EDITOR', 'MODERATOR'],
  },

  // User authentication (Custom JWT)
  user: {
    provider: 'custom-jwt' as const,
    sessionMaxAge: envConfig.userAuth.sessionMaxAge,
    jwtSecret: envConfig.userAuth.jwtSecret,
    bcryptRounds: envConfig.userAuth.bcryptRounds,
    cookieName: 'bivmor_user_session',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: envConfig.userAuth.sessionMaxAge,
    },
  },
} as const;
