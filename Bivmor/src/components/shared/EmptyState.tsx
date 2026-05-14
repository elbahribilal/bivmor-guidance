'use client';

import { SearchX, FilterX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  type?: 'search' | 'filter' | 'general';
  title?: string;
  description?: string;
  onAction?: () => void;
  actionLabel?: string;
}

export function EmptyState({ type = 'general', title, description, onAction, actionLabel }: EmptyStateProps) {
  const Icon = type === 'search' ? SearchX : type === 'filter' ? FilterX : SearchX;

  const defaultTitles: Record<string, string> = {
    search: 'لا توجد نتائج',
    filter: 'لا توجد نتائج للفلاتر المحددة',
    general: 'لا توجد بيانات',
  };

  const defaultDescriptions: Record<string, string> = {
    search: 'حاول البحث بكلمات مختلفة',
    filter: 'جرّب تغيير الفلاتر أو مسحها',
    general: 'لا توجد بيانات للعرض حالياً',
  };

  const defaultActions: Record<string, string> = {
    search: 'مسح البحث',
    filter: 'مسح الفلاتر',
    general: 'العودة للرئيسية',
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">
        {title || defaultTitles[type]}
      </h3>
      <p className="text-muted-foreground text-sm mb-6 max-w-md">
        {description || defaultDescriptions[type]}
      </p>
      {onAction && (
        <Button
          variant="outline"
          onClick={onAction}
          className="gap-2"
        >
          {actionLabel || defaultActions[type]}
        </Button>
      )}
    </div>
  );
}
