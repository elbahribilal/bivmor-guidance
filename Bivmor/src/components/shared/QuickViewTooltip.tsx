'use client';

import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickViewTooltipProps {
  children: ReactNode;
  content: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
}

export function QuickViewTooltip({ 
  children, 
  content, 
  side = 'top', 
  delayDuration = 300 
}: QuickViewTooltipProps) {
  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        <div className="w-full">{children}</div>
      </TooltipTrigger>
      <TooltipContent 
        side={side} 
        className="max-w-[280px] p-3 bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 shadow-lg rounded-lg"
        sideOffset={8}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

// Competition quick view content
export function CompetitionQuickView({ competition }: { competition: { 
  title: string; 
  status: string; 
  shortDescription?: string | null;
  school?: { name: string } | null;
  city?: { nameAr?: string | null; name: string } | null;
  deadline?: string | null;
  type: string;
}}) {
  const statusLabels: Record<string, { label: string; color: string }> = {
    OPEN: { label: 'مفتوح', color: 'text-emerald-600 dark:text-emerald-400' },
    CLOSED: { label: 'مغلق', color: 'text-red-600 dark:text-red-400' },
    EXPIRED: { label: 'منتهي', color: 'text-gray-500 dark:text-gray-400' },
    UPCOMING: { label: 'قريباً', color: 'text-amber-600 dark:text-amber-400' },
  };

  const typeLabels: Record<string, string> = {
    ADMISSION: 'ولوج',
    ACADEMIC: 'دراسية',
    RECRUITMENT: 'توظيف',
    SCHOLARSHIP: 'منحة دراسية',
    CONTINUING_EDUCATION: 'تكوين مستمر',
  };

  const statusInfo = statusLabels[competition.status] || statusLabels.EXPIRED;

  const daysLeft = competition.deadline 
    ? Math.ceil((new Date(competition.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-2 text-right" dir="rtl">
      <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 line-clamp-1">
        {competition.title}
      </h4>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">
          {typeLabels[competition.type] || competition.type}
        </span>
      </div>
      {competition.shortDescription && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {competition.shortDescription}
        </p>
      )}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {competition.school && (
          <span>🎓 {competition.school.name}</span>
        )}
        {competition.city && (
          <span>📍 {competition.city.nameAr || competition.city.name}</span>
        )}
      </div>
      {daysLeft !== null && competition.status === 'OPEN' && (
        <div className={`text-[11px] font-medium ${
          daysLeft <= 3 ? 'text-red-600 dark:text-red-400' : 
          daysLeft <= 7 ? 'text-amber-600 dark:text-amber-400' : 
          'text-emerald-600 dark:text-emerald-400'
        }`}>
          {daysLeft > 0 ? `⏰ متبقي ${daysLeft} يوم` : '⏰ انتهى الأجل'}
        </div>
      )}
    </div>
  );
}

// School quick view content
export function SchoolQuickView({ school }: { school: {
  name: string;
  type: string;
  shortDescription?: string | null;
  city?: { nameAr?: string | null; name: string } | null;
  _count?: { competitions: number };
  competitionCount?: number;
}}) {
  const typeLabels: Record<string, { label: string; color: string }> = {
    PUBLIC: { label: 'عمومي', color: 'text-emerald-600 dark:text-emerald-400' },
    PRIVATE: { label: 'خصوصي', color: 'text-amber-600 dark:text-amber-400' },
    SEMI_PRIVATE: { label: 'شبه عمومي', color: 'text-teal-600 dark:text-teal-400' },
  };

  const typeInfo = typeLabels[school.type] || typeLabels.PUBLIC;
  const compCount = school._count?.competitions ?? school.competitionCount ?? 0;

  return (
    <div className="space-y-2 text-right" dir="rtl">
      <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 line-clamp-1">
        {school.name}
      </h4>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${typeInfo.color}`}>
          {typeInfo.label}
        </span>
        <span className="text-[10px] text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">
          {compCount} مباراة
        </span>
      </div>
      {school.shortDescription && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {school.shortDescription}
        </p>
      )}
      {school.city && (
        <span className="text-[11px] text-muted-foreground">
          📍 {school.city.nameAr || school.city.name}
        </span>
      )}
    </div>
  );
}
