// Table Pagination Helper Component
// مكون مساعد لتقسيم الجداول

'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, totalPages, total, onPageChange }: TablePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-3 border-t mt-2">
      <span className="text-xs text-muted-foreground">إجمالي {total} عنصر</span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="gap-1 h-8"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          السابق
        </Button>
        <span className="text-xs font-medium px-2">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="gap-1 h-8"
        >
          التالي
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
