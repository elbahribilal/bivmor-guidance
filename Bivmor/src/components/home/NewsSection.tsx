'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink, Clock, TrendingUp, AlertCircle, Award, Megaphone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { newsApi } from '@/lib/api';
import type { News } from '@/types';

type CategoryKey = 'إعلان' | 'آجل' | 'نتائج' | 'نصيحة';

const categoryConfig: Record<CategoryKey, { label: string; color: string; icon: React.ElementType }> = {
  'إعلان': { label: 'إعلان', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: Megaphone },
  'آجل': { label: 'آجل', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: AlertCircle },
  'نتائج': { label: 'نتائج', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Award },
  'نصيحة': { label: 'نصيحة', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400', icon: TrendingUp },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function NewsSection() {
  const [filter, setFilter] = useState<'all' | CategoryKey>('all');
  const [visibleCount, setVisibleCount] = useState(4);

  const { data: newsData, isLoading } = useQuery({
    queryKey: ['news', filter],
    queryFn: async () => {
      const res = await newsApi.list({
        category: filter === 'all' ? undefined : filter,
        limit: 20,
        publishedOnly: true,
      });
      return res;
    },
  });

  const news = newsData?.data || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    if (diff < 7) return `منذ ${diff} أيام`;
    if (diff < 30) return `منذ ${Math.floor(diff / 7)} أسابيع`;
    return date.toLocaleDateString('ar-MA', { month: 'short', day: 'numeric' });
  };

  const getCategoryAccent = (category: string) => {
    switch (category) {
      case 'إعلان': return 'bg-gradient-to-r from-emerald-400 to-teal-400';
      case 'آجل': return 'bg-gradient-to-r from-red-400 to-orange-400';
      case 'نتائج': return 'bg-gradient-to-r from-amber-400 to-yellow-400';
      case 'نصيحة': return 'bg-gradient-to-r from-violet-400 to-purple-400';
      default: return 'bg-gradient-to-r from-emerald-400 to-teal-400';
    }
  };

  const isRecent = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24) < 3;
  };

  return (
    <section className="py-16 bg-muted/20 section-pattern">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-medium mb-3">
            <Newspaper className="h-3.5 w-3.5" />
            آخر الأخبار
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="gradient-text">آخر المستجدات</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            تابع آخر الأخبار والإعلانات المتعلقة بالمباريات والفرص التعليمية
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            الكل
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key as CategoryKey)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                filter === key
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-1 bg-muted animate-pulse" />
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-full" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* News Grid */}
        {!isLoading && news.length > 0 && (
          <motion.div
            key={filter}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {news.slice(0, visibleCount).map((item: News) => {
              const catKey = (item.category || 'إعلان') as CategoryKey;
              const config = categoryConfig[catKey] || categoryConfig['إعلان'];
              const IconComp = config.icon;
              return (
                <motion.div key={item.id} variants={cardVariants}>
                  <Card className="group relative overflow-hidden border border-border/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 card-hover-lift">
                    {/* Category accent bar */}
                    <div className={`absolute top-0 right-0 left-0 h-1 ${getCategoryAccent(item.category)}`} />
                    
                    <div className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${config.color} group-hover:scale-110 transition-transform`}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${config.color}`}>
                              {config.label}
                            </span>
                            {isRecent(item.publishedAt) && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse">
                                جديد
                              </span>
                            )}
                            {item.isPinned && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                📌 مثبت
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground mr-auto">
                              <Clock className="h-3 w-3" />
                              {formatDate(item.publishedAt)}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold mb-1.5 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {item.excerpt || item.content.slice(0, 120) + '...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && news.length === 0 && (
          <div className="text-center py-12">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">لا توجد أخبار حالياً</p>
          </div>
        )}

        {/* Show More Button */}
        {!isLoading && news.length > visibleCount && (
          <div className="text-center mt-6">
            <button
              onClick={() => setVisibleCount(prev => prev + 4)}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-all duration-200 active:scale-95"
            >
              عرض المزيد
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
