'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SchoolCard from '@/components/schools/SchoolCard';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { getSchools } from '@/lib/api';
import { useNavigationStore } from '@/store/navigation';

export default function FeaturedSchools() {
  const { setView } = useNavigationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['schools-featured'],
    queryFn: () => getSchools({ isFeatured: true, limit: 6 }),
  });

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">مدارس مميزة</h2>
          </div>
          <Button
            variant="ghost"
            onClick={() => setView('schools')}
            className="text-emerald-600 dark:text-emerald-400 gap-1"
          >
            عرض الكل
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton count={3} />
        ) : data?.data && data.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {data.data.map((school, i) => (
              <motion.div
                key={school.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <SchoolCard school={school} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مدارس مميزة حالياً
          </div>
        )}
      </div>
    </section>
  );
}
