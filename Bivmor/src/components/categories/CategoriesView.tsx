'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { categoriesApi } from '@/lib/api';
import { EmptyState } from '@/components/shared/EmptyState';
import { Trophy, GraduationCap, ArrowLeft, BookOpen } from 'lucide-react';
import type { Category } from '@/types';

function Grid3X3Icon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

export function CategoriesView() {
  const { setCompetitionFilters, setSchoolFilters, setView } = useNavigationStore();
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const categories = data?.data || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
          <Grid3X3Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">التصنيفات</h1>
          <p className="text-sm text-muted-foreground">تصفح حسب المجال والتخصص</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyState type="general" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className="overflow-hidden border-border/50 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-base">{category.name}</h3>
                    {category.color && <div className="h-3 w-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: category.color }} />}
                  </div>
                  {category.description && <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Trophy className="h-3.5 w-3.5" /> {category._count?.competitions || 0} مباراة
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" /> {category._count?.schools || 0} مدرسة
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setCompetitionFilters({ categoryId: category.id, page: 1 }); setView('competitions'); }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 py-2 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                      <Trophy className="h-3.5 w-3.5" /> المباريات <ArrowLeft className="h-3 w-3" />
                    </button>
                    <button onClick={() => { setSchoolFilters({ categoryId: category.id, page: 1 }); setView('schools'); }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 py-2 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
                      <GraduationCap className="h-3.5 w-3.5" /> المدارس <ArrowLeft className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
