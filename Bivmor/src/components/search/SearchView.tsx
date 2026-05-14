'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { searchApi, citiesApi, categoriesApi, levelsApi } from '@/lib/api';
import { Search, Trophy, GraduationCap, MapPin, Filter, X, Clock, FileQuestion, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CompetitionStatus } from '@/types';

interface SearchCompetitionResult {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  status: CompetitionStatus;
  city?: { name: string; nameAr: string | null };
  school?: { name: string };
  category?: { name: string };
  deadline: string | null;
  resultType: 'competition';
}

interface SearchSchoolResult {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  type: string;
  city?: { name: string; nameAr: string | null };
  category?: { name: string };
  resultType: 'school';
  _count?: { competitions: number };
}

type CombinedResult =
  | (SearchCompetitionResult & { resultType: 'competition' })
  | (SearchSchoolResult & { resultType: 'school' });

export function SearchView() {
  const { searchQuery, setSearchQuery, setSelectedCompetition, setSelectedSchool } = useNavigationStore();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [typeFilter, setTypeFilter] = useState<'' | 'competition' | 'school'>('');
  const [cityId, setCityId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [levelId, setLevelId] = useState<string>('');
  const [searchPerformed, setSearchPerformed] = useState(!!searchQuery);

  const { data: citiesData } = useQuery({ queryKey: ['cities'], queryFn: () => citiesApi.list() });
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: () => categoriesApi.list() });
  const { data: levelsData } = useQuery({ queryKey: ['levels'], queryFn: () => levelsApi.list() });

  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ['search', searchQuery, typeFilter, cityId, categoryId, levelId],
    queryFn: async () => {
      const res = await searchApi.search({
        q: searchQuery,
        type: typeFilter || undefined,
        cityId: cityId || undefined,
        categoryId: categoryId || undefined,
        levelId: levelId || undefined,
      });
      return res.data as unknown as {
        competitions: SearchCompetitionResult[];
        schools: SearchSchoolResult[];
      };
    },
    enabled: !!searchQuery && searchPerformed,
  });

  const cities = citiesData?.data || [];
  const categories = categoriesData?.data || [];
  const levels = levelsData?.data || [];

  // Combine results from both types
  const competitionResults: CombinedResult[] = (searchData?.competitions || []).map(c => ({ ...c, resultType: 'competition' as const }));
  const schoolResults: CombinedResult[] = (searchData?.schools || []).map(s => ({ ...s, resultType: 'school' as const }));
  const results: CombinedResult[] = [...competitionResults, ...schoolResults];

  const totalResults = results.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setSearchQuery(inputValue.trim());
      setSearchPerformed(true);
    }
  };

  const clearAll = () => {
    setInputValue('');
    setSearchQuery('');
    setTypeFilter('');
    setCityId('');
    setCategoryId('');
    setLevelId('');
    setSearchPerformed(false);
  };

  const hasActiveFilters = typeFilter || cityId || categoryId || levelId;

  // Build active filter pills data
  const activeFilterPills: { key: string; label: string; onRemove: () => void }[] = [];
  if (typeFilter) {
    activeFilterPills.push({
      key: 'type',
      label: typeFilter === 'competition' ? 'مباريات' : 'مدارس',
      onRemove: () => setTypeFilter(''),
    });
  }
  if (cityId) {
    const city = cities.find(c => c.id === cityId);
    if (city) {
      activeFilterPills.push({
        key: 'city',
        label: city.name,
        onRemove: () => setCityId(''),
      });
    }
  }
  if (categoryId) {
    const cat = categories.find(c => c.id === categoryId);
    if (cat) {
      activeFilterPills.push({
        key: 'category',
        label: cat.name,
        onRemove: () => setCategoryId(''),
      });
    }
  }
  if (levelId) {
    const level = levels.find(l => l.id === levelId);
    if (level) {
      activeFilterPills.push({
        key: 'level',
        label: level.name,
        onRemove: () => setLevelId(''),
      });
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
          <Search className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">البحث</h1>
          <p className="text-sm text-muted-foreground">ابحث في المباريات والمدارس</p>
        </div>
      </div>

      {/* Search form with autocomplete */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchAutocomplete
              query={inputValue}
              onQueryChange={setInputValue}
              onSuggestionClick={() => setSearchPerformed(true)}
              variant="default"
            />
          </div>
          <Button type="submit" size="default" className="h-12 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/10 active:scale-95 transition-all duration-200">
            بحث
          </Button>
        </div>
      </form>

      {/* Filter panel */}
      <div className="rounded-xl border bg-card p-4 mb-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" /> تصفية النتائج
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={typeFilter || 'all'} onValueChange={(v) => setTypeFilter(v === 'all' ? '' : v as 'competition' | 'school')}>
            <SelectTrigger className="rounded-lg border-border/60 focus:ring-emerald-400/20">
              <SelectValue placeholder="النوع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="competition">مباريات</SelectItem>
              <SelectItem value="school">مدارس</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cityId || 'all'} onValueChange={(v) => setCityId(v === 'all' ? '' : v)}>
            <SelectTrigger className="rounded-lg border-border/60 focus:ring-emerald-400/20">
              <SelectValue placeholder="المدينة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoryId || 'all'} onValueChange={(v) => setCategoryId(v === 'all' ? '' : v)}>
            <SelectTrigger className="rounded-lg border-border/60 focus:ring-emerald-400/20">
              <SelectValue placeholder="التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع التصنيفات</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={levelId || 'all'} onValueChange={(v) => setLevelId(v === 'all' ? '' : v)}>
            <SelectTrigger className="rounded-lg border-border/60 focus:ring-emerald-400/20">
              <SelectValue placeholder="المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المستويات</SelectItem>
              {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Active filter pills */}
        <AnimatePresence>
          {activeFilterPills.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap items-center gap-2 pt-1"
            >
              {activeFilterPills.map((pill) => (
                <motion.button
                  key={pill.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.15 }}
                  onClick={pill.onRemove}
                  className="filter-pill group"
                >
                  {pill.label}
                  <X className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-xs h-7 px-2 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" /> مسح الكل
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {searchLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 shimmer-loading rounded-xl" />
          ))}
        </div>
      ) : totalResults === 0 && searchPerformed ? (
        /* No results empty state with illustration */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16"
        >
          <div className="no-results-illustration flex items-center justify-center mb-6">
            <div className="relative">
              <FileQuestion className="h-16 w-16 text-muted-foreground/30" />
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <X className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold mb-2">لا توجد نتائج</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            لم نعثر على نتائج مطابقة لبحثك. جرّب تغيير كلمات البحث أو إزالة بعض الفلاتر.
          </p>
          <Button
            variant="outline"
            onClick={clearAll}
            className="gap-2 rounded-lg"
          >
            <Sparkles className="h-4 w-4" />
            مسح البحث والفلاتر
          </Button>
        </motion.div>
      ) : !searchPerformed ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16 text-muted-foreground"
        >
          <div className="relative inline-block mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20">
              <Search className="h-10 w-10 text-emerald-300 dark:text-emerald-700" />
            </div>
          </div>
          <p className="text-lg font-semibold text-foreground">ابحث عن فرصك التعليمية</p>
          <p className="text-sm mt-1">اكتب كلمة بحث للعثور على المباريات والمدارس</p>
        </motion.div>
      ) : (
        <>
          {/* Results summary with animated count */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="result-count-animated flex items-center gap-1.5">
              <span className="text-sm font-bold text-foreground">{totalResults}</span>
              <span className="text-sm text-muted-foreground">نتيجة</span>
            </div>
            {competitionResults.length > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800"
              >
                {competitionResults.length} مباراة
              </motion.span>
            )}
            {schoolResults.length > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800"
              >
                {schoolResults.length} مدرسة
              </motion.span>
            )}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result, i) => (
              <motion.div
                key={`${result.resultType}-${result.id}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
              >
                <Card
                  className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-border/50 card-hover-lift"
                  onClick={() => {
                    if (result.resultType === 'competition') setSelectedCompetition(result.id);
                    else setSelectedSchool(result.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 ${
                        result.resultType === 'competition'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50'
                          : 'bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50'
                      }`}>
                        {result.resultType === 'competition'
                          ? <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          : <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {result.resultType === 'competition' ? result.title : result.name}
                          </h3>
                          {result.resultType === 'competition' && <StatusBadge status={result.status} />}
                        </div>
                        {result.shortDescription && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{result.shortDescription}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {result.city && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" /> {result.city.nameAr || result.city.name}
                            </span>
                          )}
                          {result.resultType === 'competition' && result.deadline && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {new Date(result.deadline).toLocaleDateString('ar-MA')}
                            </span>
                          )}
                          {result.resultType === 'school' && result._count && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Trophy className="h-3 w-3" /> {result._count.competitions} مباراة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
