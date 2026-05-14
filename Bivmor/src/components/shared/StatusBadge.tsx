'use client';

import { Badge } from '@/components/ui/badge';
import type { CompetitionStatus, SchoolType } from '@/types';

const statusConfig: Record<CompetitionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  OPEN: { label: 'مفتوح', variant: 'default', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 border-emerald-200 dark:border-emerald-800' },
  CLOSED: { label: 'مغلق', variant: 'secondary', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100 border-red-200 dark:border-red-800' },
  EXPIRED: { label: 'انتهى', variant: 'outline', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-100 border-gray-200 dark:border-gray-700' },
  UPCOMING: { label: 'قريباً', variant: 'secondary', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 border-amber-200 dark:border-amber-800' },
};

const closingSoonConfig = {
  label: 'يغلق قريباً',
  className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100 border-amber-300 dark:border-amber-700 animate-pulse',
};

const schoolTypeConfig: Record<SchoolType, { label: string; className: string }> = {
  PUBLIC: { label: 'عمومي', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  PRIVATE: { label: 'خاص', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  SEMI_PRIVATE: { label: 'شبه خصوصي', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400' },
};

interface StatusBadgeProps {
  status: CompetitionStatus;
  closingSoon?: boolean;
}

export function StatusBadge({ status, closingSoon = false }: StatusBadgeProps) {
  if (closingSoon && status === 'OPEN') {
    return (
      <Badge variant="secondary" className={`text-xs font-medium ${closingSoonConfig.className}`}>
        ⚡ {closingSoonConfig.label}
      </Badge>
    );
  }
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}

export function SchoolTypeBadge({ type }: { type: SchoolType }) {
  const config = schoolTypeConfig[type];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
