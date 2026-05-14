// Admin System Configuration
// Makes admin portable and separable

import { envConfig } from './env';

export const adminConfig = {
  // Route configuration
  route: {
    // Hidden route path - not shown in public navigation
    path: envConfig.admin.routePath,
    // Query parameter to trigger admin view (fallback)
    queryParam: 'admin',
  },

  // API configuration
  api: {
    // If admin is on a separate server, set ADMIN_API_BASE_URL
    baseUrl: envConfig.admin.apiBaseUrl || '',
    isRemote: !!envConfig.admin.apiBaseUrl,
  },

  // Deployment mode
  deployment: {
    isSeparate: envConfig.admin.isSeparate,
    // Future: subdomain like admin.bivmor.com
    subdomain: process.env.ADMIN_SUBDOMAIN || 'admin',
  },

  // Session configuration
  session: {
    maxAge: envConfig.adminAuth.sessionMaxAge,
    strategy: 'jwt' as const,
  },

  // Access control
  access: {
    allowedRoles: ['ADMIN', 'EDITOR', 'MODERATOR'] as const,
    superAdminRole: 'ADMIN' as const,
  },

  // Audit logging
  audit: {
    enabled: true,
    logSensitiveActions: ['CREATE', 'UPDATE', 'DELETE'],
  },
} as const;
