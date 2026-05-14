'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Clock, Building2, LayoutGrid } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getDashboardStats } from '@/lib/api';

interface StatItemProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
  bgColor: string;
  delay: number;
}

function StatItem({ icon, value, label, color, bgColor, delay }: StatItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center flex-shrink-0`}>
              <div className={color}>{icon}</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold">{value.toLocaleString('ar-EG')}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StatsSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const stats = data?.data;

  if (!stats) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold">منصة المباريات في أرقام</h2>
          <p className="text-muted-foreground mt-2">إحصائيات محدثة حول المنصة</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatItem
            icon={<Trophy className="h-6 w-6" />}
            value={stats.totalCompetitions}
            label="إجمالي المباريات"
            color="text-emerald-600 dark:text-emerald-400"
            bgColor="bg-emerald-100 dark:bg-emerald-900/30"
            delay={0}
          />
          <StatItem
            icon={<Clock className="h-6 w-6" />}
            value={stats.openCompetitions}
            label="مباريات مفتوحة"
            color="text-amber-600 dark:text-amber-400"
            bgColor="bg-amber-100 dark:bg-amber-900/30"
            delay={0.1}
          />
          <StatItem
            icon={<Building2 className="h-6 w-6" />}
            value={stats.totalSchools}
            label="المدارس والمعاهد"
            color="text-teal-600 dark:text-teal-400"
            bgColor="bg-teal-100 dark:bg-teal-900/30"
            delay={0.2}
          />
          <StatItem
            icon={<LayoutGrid className="h-6 w-6" />}
            value={stats.totalCategories}
            label="التصنيفات"
            color="text-rose-600 dark:text-rose-400"
            bgColor="bg-rose-100 dark:bg-rose-900/30"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  );
}
