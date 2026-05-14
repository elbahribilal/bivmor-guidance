// Admin Utility Functions
// دوال مساعدة لنظام الإدارة

/**
 * Format a date for display in the admin panel (Arabic locale).
 */
export function formatAdminDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('ar-MA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a date for the datetime-local input field.
 */
export function formatDateForInput(date: string | Date | null): string {
  if (!date) return '';
  return new Date(date).toISOString().slice(0, 16);
}

/**
 * Convert a datetime-local input value to ISO string for API.
 */
export function formatInputToDate(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

/**
 * Get the Arabic label for a school type.
 */
export function getSchoolTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    PUBLIC: 'عمومي',
    PRIVATE: 'خاص',
    SEMI_PRIVATE: 'شبه خصوصي',
  };
  return labels[type] || type;
}

/**
 * Get the Arabic label for a competition status.
 */
export function getCompetitionStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OPEN: 'مفتوح',
    CLOSED: 'مغلق',
    EXPIRED: 'انتهى',
    UPCOMING: 'قريباً',
  };
  return labels[status] || status;
}

/**
 * Get the Arabic label for a competition type.
 */
export function getCompetitionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    ADMISSION: '🚪 ولوج',
    ACADEMIC: '🎓 دراسية',
    RECRUITMENT: '💼 توظيف',
    SCHOLARSHIP: '💰 منحة دراسية',
    CONTINUING_EDUCATION: '📚 تكوين مستمر',
  };
  return labels[type] || type;
}

/**
 * Get the Arabic label for a news category.
 */
export function getNewsCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    'إعلان': '📢 إعلان',
    'آجل': '⏰ آجل',
    'نتائج': '🏆 نتائج',
    'نصيحة': '💡 نصيحة',
  };
  return labels[category] || category;
}

/**
 * Truncate a string to a maximum length.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a slug from Arabic or Latin text.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * Create a loading skeleton array.
 */
export function createSkeletonArray(count: number = 5): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

/**
 * Default admin credentials for development.
 */
export const DEFAULT_ADMIN_CREDENTIALS = {
  email: 'admin@bivmor.ma',
  password: 'Bivmor@Admin2024!',
};
