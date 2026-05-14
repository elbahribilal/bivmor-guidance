'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigationStore } from '@/store/navigation';
import { StatusBadge, SchoolTypeBadge } from '@/components/shared/StatusBadge';
import { Trophy, GraduationCap, Search, TrendingUp, Loader2, X } from 'lucide-react';
import type { CompetitionStatus, CompetitionType, SchoolType } from '@/types';

interface CompetitionSuggestion {
  id: string;
  title: string;
  shortDescription: string | null;
  status: CompetitionStatus;
  type: CompetitionType;
}

interface SchoolSuggestion {
  id: string;
  name: string;
  shortDescription: string | null;
  type: SchoolType;
}

interface SuggestionsData {
  competitions: CompetitionSuggestion[];
  schools: SchoolSuggestion[];
}

interface SearchAutocompleteProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSuggestionClick?: () => void;
  /** Whether this is rendered in the hero (dark bg) or not */
  variant?: 'hero' | 'default';
}

const competitionTypeLabels: Record<CompetitionType, string> = {
  RECRUITMENT: 'توظيف',
  ACADEMIC: 'أكاديمي',
  SCHOLARSHIP: 'منحة',
  CONTINUING_EDUCATION: 'تكوين مستمر',
  ADMISSION: 'قبول',
};

export function SearchAutocomplete({
  query,
  onQueryChange,
  onSuggestionClick,
  variant = 'default',
}: SearchAutocompleteProps) {
  const { setSelectedCompetition, setSelectedSchool, setSearchQuery, setView } = useNavigationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsData>({ competitions: [], schools: [] });
  const [popular, setPopular] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSuggestions(data.suggestions || { competitions: [], schools: [] });
      setPopular(data.popular || []);
    } catch {
      setSuggestions({ competitions: [], schools: [] });
      setPopular([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      // Fetch popular searches when query is empty
      debounceRef.current = setTimeout(() => {
        fetchSuggestions('');
      }, 300);
    } else if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions(query.trim());
      }, 300);
    } else {
      setSuggestions({ competitions: [], schools: [] });
      setPopular([]);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasSuggestions = suggestions.competitions.length > 0 || suggestions.schools.length > 0;
  const hasPopular = popular.length > 0;
  const showDropdown = isOpen && (hasSuggestions || hasPopular || isLoading);

  const handleCompetitionClick = (id: string) => {
    setSelectedCompetition(id);
    setIsOpen(false);
    onSuggestionClick?.();
  };

  const handleSchoolClick = (id: string) => {
    setSelectedSchool(id);
    setIsOpen(false);
    onSuggestionClick?.();
  };

  const handlePopularClick = (term: string) => {
    onQueryChange(term);
    setSearchQuery(term);
    setView('search');
    setIsOpen(false);
    onSuggestionClick?.();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const isHero = variant === 'hero';

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isHero ? 'text-white/50' : 'text-muted-foreground'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="ابحث عن مباراة، مدرسة، أو تخصص..."
          className={`w-full rounded-xl py-3 pe-10 ps-4 text-sm md:text-base outline-none transition-all duration-300 ${
            isHero
              ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/15'
              : 'bg-background border border-border/60 text-foreground placeholder:text-muted-foreground focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
          }`}
        />
        {isLoading && (
          <Loader2 className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin ${isHero ? 'text-white/60' : 'text-muted-foreground'}`} />
        )}
        {query && !isLoading && (
          <button
            onClick={() => {
              onQueryChange('');
              setSuggestions({ competitions: [], schools: [] });
            }}
            className={`absolute left-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full transition-colors ${
              isHero ? 'text-white/60 hover:text-white/90 hover:bg-white/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute top-full mt-2 right-0 left-0 z-50 rounded-xl shadow-xl border overflow-hidden ${
              isHero
                ? 'bg-white/95 backdrop-blur-xl border-white/20 shadow-emerald-900/20'
                : 'bg-popover border-border shadow-black/10'
            }`}
          >
            {/* Loading state */}
            {isLoading && !hasSuggestions && !hasPopular && (
              <div className="flex items-center justify-center py-8 gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                <span className="text-sm text-muted-foreground">جاري البحث...</span>
              </div>
            )}

            {/* Popular Searches */}
            {!isLoading && hasPopular && (
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2.5 px-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-muted-foreground">عمليات بحث شائعة</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {popular.map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularClick(term)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95 ${
                        isHero
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-muted text-foreground hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      <Search className="h-3 w-3 opacity-50" />
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Competition Suggestions */}
            {suggestions.competitions.length > 0 && (
              <div className={hasPopular ? 'border-t border-border/50' : ''}>
                <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                  <Trophy className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-muted-foreground">المباريات</span>
                </div>
                <div className="px-1.5 pb-1.5">
                  {suggestions.competitions.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => handleCompetitionClick(comp.id)}
                      className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-right transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20 group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-800/40 transition-colors">
                        <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium truncate text-foreground">{comp.title}</span>
                        </div>
                        {comp.shortDescription && (
                          <p className="text-xs text-muted-foreground truncate">{comp.shortDescription}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <StatusBadge status={comp.status} />
                        <span className="text-[10px] text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                          {competitionTypeLabels[comp.type]}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* School Suggestions */}
            {suggestions.schools.length > 0 && (
              <div className={(hasPopular || suggestions.competitions.length > 0) ? 'border-t border-border/50' : ''}>
                <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-teal-600" />
                  <span className="text-xs font-semibold text-muted-foreground">المدارس</span>
                </div>
                <div className="px-1.5 pb-1.5">
                  {suggestions.schools.map((school) => (
                    <button
                      key={school.id}
                      onClick={() => handleSchoolClick(school.id)}
                      className="w-full flex items-center gap-3 rounded-lg px-2.5 py-2 text-right transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20 group"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 group-hover:bg-teal-200 dark:group-hover:bg-teal-800/40 transition-colors">
                        <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium truncate text-foreground">{school.name}</span>
                        </div>
                        {school.shortDescription && (
                          <p className="text-xs text-muted-foreground truncate">{school.shortDescription}</p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <SchoolTypeBadge type={school.type} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {!isLoading && query.trim().length >= 2 && !hasSuggestions && (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">لا توجد نتائج لـ &quot;{query}&quot;</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
