'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompetitionCard from '@/components/competitions/CompetitionCard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { getCompetitions } from '@/lib/api';
import { useNavigationStore } from '@/store/navigation';

export default function OpenCompetitionsSection() {
  const { setView } = useNavigationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['competitions-open'],
    queryFn: () => getCompetitions({ status: 'OPEN', limit: 8, sort: 'deadline' }),
  });

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">مباريات مفتوحة الآن</h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => setView('competitions')}
            className="text-emerald-600 dark:text-emerald-400 gap-1"
          >
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton count={4} />
        ) : data?.data && data.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {data.data.map((competition, i) => (
              <motion.div
                key={competition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <CompetitionCard competition={competition} compact />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مباريات مفتوحة حالياً
          </div>
        )}
      </div>
    </section>
  );
}
