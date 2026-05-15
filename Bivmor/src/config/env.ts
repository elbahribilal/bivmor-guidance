// Environment Configuration
// All ENV variables centralized here for easy portability

export const envConfig = {
  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'BIVMOR',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'منصة المباريات والفرص التعليمية في المغرب',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Database
  database: {
    url: process.env.POSTGRES_PRISMA_URL || 'file:./db/custom.db',
  },

  // Admin Auth (NextAuth)
  adminAuth: {
    secret: process.env.NEXTAUTH_SECRET || 'bivmor-dev-secret-change-in-production',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    sessionMaxAge: parseInt(process.env.ADMIN_SESSION_MAX_AGE || '86400'), // 24 hours
  },

  // User Auth
  userAuth: {
    jwtSecret: process.env.USER_JWT_SECRET || 'bivmor-user-dev-secret-change-in-production',
    sessionMaxAge: parseInt(process.env.USER_SESSION_MAX_AGE || '604800'), // 7 days
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
  },

  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    adminPrefix: process.env.NEXT_PUBLIC_ADMIN_API_PREFIX || '/api/admin',
    publicPrefix: process.env.NEXT_PUBLIC_PUBLIC_API_PREFIX || '/api',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  },

  // Admin System (portable)
  admin: {
    routePath: process.env.NEXT_PUBLIC_ADMIN_ROUTE || '/admin-panel',
    apiBaseUrl: process.env.ADMIN_API_BASE_URL || '', // empty = same server, or external URL
    isSeparate: process.env.ADMIN_IS_SEPARATE === 'true', // for future subdomain deployment
  },

  // Feature Flags
  features: {
    enableUserAccounts: process.env.NEXT_PUBLIC_ENABLE_USER_ACCOUNTS !== 'false',
    enableReminders: process.env.NEXT_PUBLIC_ENABLE_REMINDERS !== 'false',
    enableApplications: process.env.NEXT_PUBLIC_ENABLE_APPLICATIONS !== 'false',
    enableComparison: process.env.NEXT_PUBLIC_ENABLE_COMPARISON !== 'false',
    enableNewsletter: process.env.NEXT_PUBLIC_ENABLE_NEWSLETTER !== 'false',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  },

  // Security
  security: {
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'), // 1 minute
    corsOrigins: process.env.CORS_ORIGINS || '*',
  },
} as const;
