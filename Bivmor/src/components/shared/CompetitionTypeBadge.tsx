'use client';

import { Badge } from '@/components/ui/badge';
import type { CompetitionType } from '@/types';

const typeConfig: Record<CompetitionType, { label: string; color: string; icon: string }> = {
  RECRUITMENT: { label: 'توظيف', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: '💼' },
  ACADEMIC: { label: 'دراسية', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', icon: '🎓' },
  SCHOLARSHIP: { label: 'منحة دراسية', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: '💰' },
  CONTINUING_EDUCATION: { label: 'تكوين مستمر', color: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800', icon: '📚' },
  ADMISSION: { label: 'ولوج', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800', icon: '🚪' },
};

export function CompetitionTypeBadge({ type }: { type: CompetitionType | string }) {
  const config = typeConfig[type as CompetitionType] || typeConfig.ACADEMIC;
  return (
    <Badge variant="outline" className={`${config.color} text-[11px] gap-1 font-medium`}>
      <span>{config.icon}</span>
      {config.label}
    </Badge>
  );
}
