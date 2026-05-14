'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { categoriesApi } from '@/lib/api';
import {
  Cpu, Heart, Scale, Briefcase, Wrench, BookOpen, Beaker, Landmark,
  GraduationCap, DollarSign, Shield, Swords, ArrowLeft, Sparkles
} from 'lucide-react';
import type { Category } from '@/types';

const categoryIcons: Record<string, React.ReactNode> = {
  'مدارس الهندسة': <Cpu className="h-6 w-6" />,
  'الطب والصيدلة': <Heart className="h-6 w-6" />,
  'العلوم السياسية': <Landmark className="h-6 w-6" />,
  'القانون': <Scale className="h-6 w-6" />,
  'التجارة والتدبير': <Briefcase className="h-6 w-6" />,
  'التكوين المهني': <Wrench className="h-6 w-6" />,
  'العلوم': <Beaker className="h-6 w-6" />,
  'الآدات والعلوم الإنسانية': <BookOpen className="h-6 w-6" />,
  'التعليم العالي': <GraduationCap className="h-6 w-6" />,
  'المنح الدراسية': <DollarSign className="h-6 w-6" />,
  'Concours Fonction Publique': <Shield className="h-6 w-6" />,
  'Concours Militaire': <Swords className="h-6 w-6" />,
};

const categoryColors = [
  'from-emerald-500 to-teal-600', 'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600', 'from-violet-500 to-purple-600',
  'from-cyan-500 to-teal-600', 'from-lime-500 to-green-600',
  'from-fuchsia-500 to-pink-600', 'from-sky-400 to-cyan-500',
  'from-orange-500 to-red-600', 'from-teal-500 to-emerald-600',
  'from-emerald-600 to-cyan-600', 'from-red-500 to-rose-600',
];

// Max items for progress bar normalization
const MAX_COMPETITIONS_IN_CATEGORY = 10;

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

export function CategoriesGrid() {
  const { setCompetitionFilters, setView } = useNavigationStore();
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const categories = data?.data || [];

  const handleCategoryClick = (categoryId: string) => {
    setCompetitionFilters({ categoryId, page: 1 });
    setView('competitions');
  };

  if (isLoading) {
    return (
      <section className="bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="h-7 w-48 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) return null;

  return (
    <section className="bg-muted/20 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <Grid3X3Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">تصفح حسب المجال</h2>
            <p className="text-sm text-muted-foreground">اختر التخصص الذي يهمك</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category, index) => {
            const competitionCount = category._count?.competitions || 0;
            const schoolCount = category._count?.schools || 0;
            const totalItems = competitionCount + schoolCount;
            const progressPercent = Math.min((competitionCount / MAX_COMPETITIONS_IN_CATEGORY) * 100, 100);
            const isFeatured = totalItems > 5;
            const gradientClass = categoryColors[index % categoryColors.length];

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
              >
                <Card
                  className={`moroccan-geometric-overlay glass-card-premium cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:shadow-emerald-500/10 dark:hover:shadow-emerald-400/10 border-border/50 ${
                    isFeatured ? 'featured-ribbon' : ''
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="p-4 text-center space-y-3 relative z-10">
                    {/* Icon container with animated gradient background */}
                    <div className={`pulse-subtle-hover mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientClass} text-white shadow-lg animated-gradient-icon transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                      {categoryIcons[category.name] || <BookOpen className="h-6 w-6" />}
                    </div>

                    {/* Featured badge */}
                    {isFeatured && (
                      <div className="absolute top-2 left-2">
                        <span className="badge-shimmer flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded-full">
                          <Sparkles className="h-2.5 w-2.5" />
                          رائج
                        </span>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{category.name}</h3>
                      {category._count && (
                        <>
                          <p className="text-xs text-muted-foreground mt-1">{totalItems} عنصر</p>
                          {/* Animated progress bar showing competition density */}
                          <div className="mt-2 mx-auto w-full max-w-[80%]">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-l ${gradientClass} transition-all duration-700 ease-out`}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <div className="flex justify-between mt-0.5">
                              <span className="text-[9px] text-muted-foreground">{competitionCount} مباراة</span>
                              <span className="text-[9px] text-muted-foreground">{schoolCount} مدرسة</span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {/* View all link */}
        <div className="flex justify-center mt-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('categories')}
            className="gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 group/btn"
          >
            شاهد الكل
            <ArrowLeft className="h-4 w-4 transition-transform group-hover/btn:-translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
