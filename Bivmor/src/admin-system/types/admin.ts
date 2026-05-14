// Admin System - Type Definitions
// تعريفات أنواع نظام الإدارة

import type {
  Competition,
  School,
  Category,
  City,
  Level,
  DashboardStats,
  CompetitionStatus,
  CompetitionType,
  SchoolType,
  SiteSettingsMap,
  Notification,
  News,
  ActivityLog,
} from '@/types';

// ============================================
// ADMIN USER TYPES
// ============================================

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
}

export type AdminRole = 'ADMIN' | 'EDITOR';

export interface AdminSession {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

// ============================================
// ADMIN AUTH STATE
// ============================================

export interface AdminAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  showLogin: boolean;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setShowLogin: (show: boolean) => void;
}

// ============================================
// ADMIN API TYPES
// ============================================

export interface AdminApiConfig {
  baseUrl: string;
  timeout?: number;
}

export interface AdminApiError {
  error: string;
  status: number;
  details?: string;
}

export interface AdminActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// COMPETITION FORM TYPES
// ============================================

export interface CompetitionFormData {
  title: string;
  shortDescription: string;
  fullDescription: string;
  officialLink: string;
  deadline: string;
  requirements: string;
  documents: string;
  stages: string;
  cityId: string;
  schoolId: string;
  categoryId: string;
  levelId: string;
  status: CompetitionStatus;
  type: CompetitionType;
  isFeatured: boolean;
  isPinned: boolean;
  registrationOpen: boolean;
}

export const DEFAULT_COMPETITION_FORM: CompetitionFormData = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  officialLink: '',
  deadline: '',
  requirements: '',
  documents: '',
  stages: '',
  cityId: '',
  schoolId: '',
  categoryId: '',
  levelId: '',
  status: 'OPEN',
  type: 'ACADEMIC',
  isFeatured: false,
  isPinned: false,
  registrationOpen: true,
};

// ============================================
// SCHOOL FORM TYPES
// ============================================

export interface SchoolFormData {
  name: string;
  shortDescription: string;
  fullDescription: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  cityId: string;
  categoryId: string;
  levelId: string;
  type: SchoolType;
  isFeatured: boolean;
  isActive: boolean;
}

export const DEFAULT_SCHOOL_FORM: SchoolFormData = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  website: '',
  email: '',
  phone: '',
  address: '',
  cityId: '',
  categoryId: '',
  levelId: '',
  type: 'PUBLIC',
  isFeatured: false,
  isActive: true,
};

// ============================================
// NEWS FORM TYPES
// ============================================

export interface NewsFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
  isPublished: boolean;
  isPinned: boolean;
}

export const DEFAULT_NEWS_FORM: NewsFormData = {
  title: '',
  content: '',
  excerpt: '',
  category: 'إعلان',
  isPublished: true,
  isPinned: false,
};

// ============================================
// NOTIFICATION FORM TYPES
// ============================================

export interface NotificationFormData {
  title: string;
  message: string;
  type: Notification['type'];
}

export const DEFAULT_NOTIFICATION_FORM: NotificationFormData = {
  title: '',
  message: '',
  type: 'INFO',
};

// ============================================
// SETTINGS FORM TYPES
// ============================================

export interface SettingFieldConfig {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea';
}

export const SETTING_FIELDS: SettingFieldConfig[] = [
  { key: 'site_name', label: 'اسم الموقع', placeholder: 'مباريات المغرب', type: 'text' },
  { key: 'hero_title', label: 'عنوان الصفحة الرئيسية', placeholder: 'مباريات المغرب', type: 'text' },
  { key: 'hero_subtitle', label: 'العنوان الفرعي', placeholder: 'منصتك الشاملة لجميع المباريات...', type: 'text' },
  { key: 'footer_text', label: 'نص الفوتر', placeholder: '© 2025 مباريات المغرب', type: 'text' },
  { key: 'contact_email', label: 'البريد الإلكتروني للتواصل', placeholder: 'contact@mbarayat.ma', type: 'text' },
  { key: 'newsletter_title', label: 'عنوان الاشتراك', placeholder: 'لا تفوّت أي مباراة', type: 'text' },
  { key: 'newsletter_subtitle', label: 'نص الاشتراك الفرعي', placeholder: 'تابعنا ليصلك كل جديد...', type: 'text' },
  { key: 'seo_description', label: 'وصف SEO', placeholder: 'وصف الموقع لمحركات البحث', type: 'textarea' },
  { key: 'seo_keywords', label: 'كلمات SEO المفتاحية', placeholder: 'مباريات، مدارس، تعليم، مغرب', type: 'text' },
];

// ============================================
// ACTIVITY LOG HELPERS
// ============================================

export const ACTION_LABELS: Record<string, string> = {
  CREATE: 'إنشاء',
  UPDATE: 'تحديث',
  DELETE: 'حذف',
  LOGIN: 'تسجيل دخول',
  LOGOUT: 'تسجيل خروج',
  STATUS_UPDATE: 'تحديث حالة',
  FEATURED: 'تمييز',
};

export const ENTITY_LABELS: Record<string, string> = {
  competition: 'مباراة',
  school: 'مدرسة',
  category: 'تصنيف',
  notification: 'إشعار',
  settings: 'إعدادات',
  news: 'خبر',
  user: 'مستخدم',
};

export const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  UPDATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LOGIN: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  STATUS_UPDATE: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  FEATURED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export const NOTIFICATION_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  INFO: { label: 'معلومات', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  WARNING: { label: 'تحذير', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  SUCCESS: { label: 'نجاح', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  ERROR: { label: 'خطأ', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
};

// ============================================
// RE-EXPORTS FROM MAIN TYPES
// ============================================

export type {
  Competition,
  School,
  Category,
  City,
  Level,
  DashboardStats,
  CompetitionStatus,
  CompetitionType,
  SchoolType,
  SiteSettingsMap,
  Notification,
  News,
  ActivityLog,
};
