'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { SchoolCard } from '@/components/home/SchoolsSection';
import { PaginationControls } from '@/components/shared/PaginationControls';
import { EmptyState } from '@/components/shared/EmptyState';
import { SchoolCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { schoolsApi, citiesApi, categoriesApi, levelsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Filter, X } from 'lucide-react';
import type { School, SchoolType } from '@/types';

export function SchoolsView() {
  const { schoolFilters, setSchoolFilters, setSelectedSchool, resetFilters } = useNavigationStore();
  const [searchInput, setSearchInput] = useState(schoolFilters.search || '');

  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => citiesApi.list() });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() });
  const { data: levelsData } = useQuery({ queryKey: ['levels'], queryFn: () => levelsApi.list() });
  const { data, isLoading } = useQuery({
    queryKey: ['schools', schoolFilters],
    queryFn: () => schoolsApi.list(schoolFilters),
  });

  const cities = citiesData?.data || [];
  const categories = categoriesData?.data || [];
  const levels = levelsData?.data || [];
  const schools = data?.data || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolFilters({ search: searchInput, page: 1 });
  };

  const clearFilters = () => {
    setSearchInput('');
    resetFilters();
  };

  const hasActiveFilters = schoolFilters.cityId || schoolFilters.categoryId || schoolFilters.levelId || schoolFilters.type || schoolFilters.search;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
          <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">المدارس والمعاهد</h1>
          <p className="text-sm text-muted-foreground">جميع المؤسسات التعليمية في المغرب</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 mb-6 space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" /> تصفية النتائج
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="ابحث عن مدرسة أو معهد..." className="flex-1" />
          <Button type="submit" size="sm">بحث</Button>
        </form>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={schoolFilters.cityId || 'all'} onValueChange={(v) => setSchoolFilters({ cityId: v === 'all' ? undefined : v, page: 1 })}>
            <SelectTrigger><SelectValue placeholder="المدينة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {cities.map((city) => <SelectItem key={city.id} value={city.id}>{city.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={schoolFilters.categoryId || 'all'} onValueChange={(v) => setSchoolFilters({ categoryId: v === 'all' ? undefined : v, page: 1 })}>
            <SelectTrigger><SelectValue placeholder="التصنيف" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={schoolFilters.levelId || 'all'} onValueChange={(v) => setSchoolFilters({ levelId: v === 'all' ? undefined : v, page: 1 })}>
            <SelectTrigger><SelectValue placeholder="المستوى" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              {levels.map((level) => <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={schoolFilters.type || 'all'} onValueChange={(v) => setSchoolFilters({ type: v === 'all' ? undefined : v as SchoolType, page: 1 })}>
            <SelectTrigger><SelectValue placeholder="النوع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="PUBLIC">عمومي</SelectItem>
              <SelectItem value="PRIVATE">خاص</SelectItem>
              <SelectItem value="SEMI_PRIVATE">شبه خصوصي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{pagination.total} نتيجة</span>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-xs">
              <X className="h-3 w-3" /> مسح الفلاتر
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SchoolCardSkeleton key={i} />)}
        </div>
      ) : schools.length === 0 ? (
        <EmptyState type="filter" onAction={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} onSelect={() => setSelectedSchool(school.id)} />
            ))}
          </div>
          <PaginationControls page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={(page) => setSchoolFilters({ page })} />
        </>
      )}
    </div>
  );
}
