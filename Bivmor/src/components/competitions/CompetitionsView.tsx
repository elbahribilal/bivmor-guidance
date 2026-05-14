'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/store/navigation';
import { CompetitionCard } from '@/components/home/CompetitionsSection';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { EmptyState } from '@/components/shared/EmptyState';
import { CompetitionCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { competitionsApi, citiesApi, categoriesApi, levelsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, Filter, X, SearchX } from 'lucide-react';
import type { Competition } from '@/types';

export function CompetitionsView() {
  const {
    competitionFilters,
    setCompetitionFilters,
    setSelectedCompetition,
    resetFilters,
  } = useNavigationStore();

  const [searchInput, setSearchInput] = useState('');

  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => citiesApi.list() });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() });
  const { data: levelsData } = useQuery({ queryKey: ['levels'], queryFn: () => levelsApi.list() });
  const { data, isLoading } = useQuery({
    queryKey: ['competitions', competitionFilters],
    queryFn: () => competitionsApi.list(competitionFilters),
  });

  const cities = citiesData?.data || [];
  const categories = categoriesData?.data || [];
  const levels = levelsData?.data || [];
  const competitions = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCompetitionFilters({ search: searchInput, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput('');
    resetFilters();
  };

  const hasActiveFilters = competitionFilters.cityId || competitionFilters.categoryId || competitionFilters.levelId || competitionFilters.status || competitionFilters.search;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Gradient Header with decorative elements */}
      <div className="stats-header-pattern rounded-2xl p-6 mb-6 bg-gradient-to-l from-emerald-50/80 via-teal-50/40 to-transparent dark:from-emerald-950/30 dark:via-teal-950/15 dark:to-transparent">
        <div className="relative z-10 flex items-center gap-4">
          <div className="moroccan-corner flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">المباريات</h1>
            <p className="text-sm text-muted-foreground">تصفح جميع المباريات والconcours المتاحة</p>
          </div>
        </div>
      </div>

      <div className="glass-card-premium rounded-xl border bg-card p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          تصفية النتائج
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث عن مباراة..."
            className="flex-1"
          />
          <Button type="submit" size="sm">بحث</Button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={competitionFilters.cityId || 'all'} onValueChange={(v) => setCompetitionFilters({ cityId: v === 'all' ? undefined : v, page: 1 })}>
            <SelectTrigger><SelectValue placeholder="المدينة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {cities.map((city) => <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={competitionFilters.categoryId || 'all'} onValueChange={(v) => setCompetitionFilters({ categoryId: v === 'all' ? undefined : v, page: 1 })}>
            <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={competitionFilters.levelId || 'all'} onValueChange={(v) => setCompetitionFilters({ levelId: v === 'all' ? undefined : v, page: 1 })}>
            <SelectTrigger><SelectValue placeholder="المستوى" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              {levels.map((level) => <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={competitionFilters.status || 'all'} onValueChange={(v) => setCompetitionFilters({ status: v === 'all' ? undefined : v as Competition['status'], page: 1 })}>
            <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="OPEN">مفتوح</SelectItem>
              <SelectItem value="CLOSED">مغلق</SelectItem>
              <SelectItem value="EXPIRED">انتهى</SelectItem>
              <SelectItem value="UPCOMING">قريباً</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="result-count-animated gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
              {pagination.total} نتيجة
            </Badge>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
              <X className="h-3 w-3" /> مسح الفلاتر
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CompetitionCardSkeleton key={i} />)}
        </div>
      ) : competitions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="empty-state-illustration mb-6">
            <SearchX className="absolute inset-0 m-auto h-12 w-12 text-muted-foreground/40 z-10" />
          </div>
          <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md">لم نعثر على مباريات تطابق معايير البحث. جرّب تغيير الفلاتر أو مسحها.</p>
          <Button variant="outline" onClick={clearFilters} className="gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
            <X className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitions.map((competition, index) => (
              <motion.div
                key={competition.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
              >
                <CompetitionCard competition={competition} onSelect={() => setSelectedCompetition(competition.id)} />
              </motion.div>
            ))}
          </div>
          <PaginationControls page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={(page) => setCompetitionFilters({ page })} />
        </>
      )}
    </div>
  );
}
