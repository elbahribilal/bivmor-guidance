// Feature Flags Configuration
// Control platform features via ENV variables

import { envConfig } from './env';

export const featuresConfig = {
  userAccounts: {
    enabled: envConfig.features.enableUserAccounts,
    allowSignup: true,
    allowOAuth: false, // Future: Google, GitHub, etc.
    requireEmailVerification: false,
  },

  reminders: {
    enabled: envConfig.features.enableReminders,
    syncToServer: true, // Sync localStorage reminders to DB when logged in
  },

  applications: {
    enabled: envConfig.features.enableApplications,
    syncToServer: true,
  },

  comparison: {
    enabled: envConfig.features.enableComparison,
    maxItems: 4,
  },

  newsletter: {
    enabled: envConfig.features.enableNewsletter,
  },

  notifications: {
    enabled: envConfig.features.enableNotifications,
    pushNotifications: false, // Future feature
  },

  seo: {
    enabled: true,
    generateSitemap: true,
    noindexAdmin: true, // Prevent search engines from indexing admin
  },
} as const;
