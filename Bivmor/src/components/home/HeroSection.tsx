'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { Button } from '@/components/ui/button';
import { Trophy, GraduationCap, Search, Zap } from 'lucide-react';
import { settingsApi, dashboardApi, competitionsApi, categoriesApi } from '@/lib/api';
import { SearchAutocomplete } from '@/components/search/SearchAutocomplete';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView || hasAnimated.current || target <= 0) return;
    hasAnimated.current = true;

    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration, isInView]);

  return <span ref={ref} className="tabular-nums">{count}</span>;
}

const quickCategories = [
  { name: 'الهندسة', icon: '⚙️', view: 'competitions' as const, filter: { categoryId: undefined } },
  { name: 'الطب', icon: '🏥', view: 'competitions' as const, filter: { categoryId: undefined } },
  { name: 'التجارة', icon: '💼', view: 'competitions' as const, filter: { categoryId: undefined } },
  { name: 'المنح', icon: '🎓', view: 'competitions' as const, filter: { categoryId: undefined } },
  { name: 'الوظيفة العمومية', icon: '🏛️', view: 'competitions' as const, filter: { categoryId: undefined } },
];

export function HeroSection() {
  const { setView, setSearchQuery, setCompetitionFilters } = useNavigationStore();
  const [searchInput, setSearchInput] = useState('');

  const { data: settingsData } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: openCompetitionsData } = useQuery({
    queryKey: ['competitions-open-count'],
    queryFn: () => competitionsApi.list({ status: 'OPEN', limit: 1 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-quick'],
    queryFn: () => categoriesApi.list(),
  });

  const settings = settingsData?.data || {};
  const stats = statsData?.data;
  const openCount = openCompetitionsData?.pagination?.total ?? 0;
  const categories = categoriesData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      setView('search');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setCompetitionFilters({ categoryId, page: 1 });
    setView('competitions');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 text-white moroccan-pattern">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Moroccan flag color accents - red and green blending */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-red-500/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-red-500/6 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-emerald-400/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-teal-300/6 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-white/[0.02]" />
        
        {/* Moroccan flag subtle stripe accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/20 via-transparent to-red-500/20" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500/20 via-transparent to-green-500/20" />

        {/* Enhanced SVG geometric pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Dynamic floating particles with Moroccan star shapes */}
        <div className="hero-particle hero-particle-star" />
        <div className="hero-particle" />
        <div className="hero-particle hero-particle-star" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle hero-particle-star" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle hero-particle-star" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle hero-particle-star" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />

        {/* Large decorative Morocco star in background */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <svg width="400" height="400" viewBox="0 0 100 100" className="opacity-[0.03]">
            <path d="M50 0 L61 35 L98 35 L68 57 L79 91 L50 70 L21 91 L32 57 L2 35 L39 35 Z" fill="currentColor" className="text-white" />
          </svg>
        </motion.div>
      </div>

      <div className="container relative mx-auto px-4 py-16 md:py-24 z-10">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          {/* Floating Morocco Badge with flag colors */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="animate-float-badge inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-sm font-medium shadow-lg shadow-emerald-900/20">
              <span className="text-lg">🇲🇦</span>
              <span>المغرب</span>
              {/* Subtle red accent dot for Moroccan flag */}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400/80 ml-1" />
            </div>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-shadow-emerald">
              {settings.hero_title || 'مباريات المغرب'}
            </h1>
            <p className="text-lg md:text-xl text-white/80 leading-relaxed">
              {settings.hero_subtitle || 'منصتك الشاملة لجميع المباريات والفرص التعليمية في المغرب'}
            </p>
          </motion.div>

          {/* Search bar with glassmorphism effect */}
          <motion.form
            onSubmit={handleSearch}
            className="relative mx-auto max-w-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="search-glass rounded-xl transition-all duration-300">
              <SearchAutocomplete
                query={searchInput}
                onQueryChange={setSearchInput}
                onSuggestionClick={() => {}}
                variant="hero"
              />
            </div>
          </motion.form>

          {/* Quick Category Pills */}
          <motion.div
            className="flex items-center justify-center gap-2 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {categories.slice(0, 6).map((cat, i) => (
              <motion.button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 hover:border-white/30 px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:scale-105"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex items-center justify-center gap-3 flex-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={() => setView('competitions')} size="lg" className="bg-white text-emerald-700 hover:bg-white/90 gap-2 font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-all duration-300">
                <Trophy className="h-5 w-5" /> تصفح المباريات
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button onClick={() => setView('schools')} size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 gap-2 font-semibold rounded-xl backdrop-blur-sm transition-all duration-300">
                <GraduationCap className="h-5 w-5" /> اكتشف المدارس
              </Button>
            </motion.div>
          </motion.div>

          {/* Quick link: المباريات المفتوحة الآن with pulsing dot */}
          {openCount > 0 && (
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => {
                  setView('competitions');
                }}
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm group"
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
                <Zap className="h-3.5 w-3.5" />
                <span>المباريات المفتوحة الآن</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">{openCount}</span>
                <span className="text-white/50 group-hover:text-white/80 transition-colors">←</span>
              </button>
            </motion.div>
          )}

          {/* Stats with gradient border cards and animated counters */}
          {stats && (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {[
                { value: stats.totalCompetitions, label: 'مباراة متاحة', color: '', flag: false },
                { value: stats.openCompetitions, label: 'مباراة مفتوحة', color: 'text-emerald-300', flag: true },
                { value: stats.totalSchools, label: 'مدرسة ومعهد', color: '', flag: false },
                { value: stats.totalCategories, label: 'تصنيف', color: '', flag: false },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="stat-card-gradient p-4"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, type: "spring", stiffness: 200 }}
                >
                  <div className={`text-2xl md:text-3xl font-bold ${stat.color}`}>
                    <AnimatedCounter target={stat.value} />
                  </div>
                  <div className="text-xs md:text-sm text-white/70 mt-1">{stat.label}</div>
                  {stat.flag && (
                    <div className="mt-1.5 flex items-center justify-center gap-1">
                      <span className="w-2 h-1.5 rounded-sm bg-red-400/60" />
                      <span className="w-2 h-1.5 rounded-sm bg-emerald-400/60" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
