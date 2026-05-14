'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useInView } from 'framer-motion';
import { dashboardApi, citiesApi } from '@/lib/api';
import { Trophy, MapPin, GraduationCap, Clock, TrendingUp, TrendingDown } from 'lucide-react';

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    // Guard against NaN: if value is not a positive number, just display it directly
    const end = typeof value === 'number' && isFinite(value) && value > 0 ? Math.floor(value) : 0;
    if (end === 0) {
      return;
    }

    let start = 0;
    const incrementTime = Math.max(Math.floor(duration / end), 16);
    const step = Math.max(1, Math.ceil(end / Math.max(duration / incrementTime, 1)));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

// Spark line component - CSS-only mini chart
function SparkLine({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1); // Guard against division by zero
  return (
    <div className="spark-line">
      {values.map((v, i) => (
        <div
          key={i}
          className="spark-line-bar"
          style={{
            height: `${Math.max((v / max) * 100, 10)}%`,
            backgroundColor: color,
            opacity: 0.5 + (i / Math.max(values.length, 1)) * 0.5,
          }}
        />
      ))}
    </div>
  );
}

// Gradient icon container
function GradientIconContainer({ children, gradient }: { children: React.ReactNode; gradient: string }) {
  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} animated-gradient-icon`}>
      {children}
    </div>
  );
}

export function QuickStatsBar() {
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesApi.list(),
  });

  const stats = statsData?.data;
  const cityCount = citiesData?.data?.length ?? 0;

  if (!stats) return null;

  const items = [
    {
      icon: <Trophy className="h-4 w-4 text-white" />,
      iconGradient: 'from-emerald-500 to-teal-600',
      sparkColor: 'oklch(0.627 0.194 149.214)',
      sparkValues: [3, 5, 4, 7, 6, 8, 10],
      value: stats.openCompetitions,
      label: 'مباراة مفتوحة',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      trend: 'up' as const,
      trendLabel: '+12%',
    },
    {
      icon: <MapPin className="h-4 w-4 text-white" />,
      iconGradient: 'from-teal-500 to-cyan-600',
      sparkColor: 'oklch(0.521 0.161 163.777)',
      sparkValues: [2, 3, 4, 3, 5, 4, 6],
      value: cityCount,
      label: 'مدينة',
      bg: 'bg-teal-50 dark:bg-teal-900/20',
      trend: 'up' as const,
      trendLabel: '+3',
    },
    {
      icon: <GraduationCap className="h-4 w-4 text-white" />,
      iconGradient: 'from-amber-500 to-orange-600',
      sparkColor: 'oklch(0.769 0.188 70.08)',
      sparkValues: [5, 6, 4, 7, 8, 6, 9],
      value: stats.totalSchools,
      label: 'مدرسة ومعهد',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      trend: 'up' as const,
      trendLabel: '+5',
    },
    {
      icon: <Clock className="h-4 w-4 text-white" />,
      iconGradient: 'from-rose-500 to-pink-600',
      sparkColor: 'oklch(0.577 0.245 27.325)',
      sparkValues: [8, 6, 5, 4, 3, 4, 2],
      value: stats.expiredCompetitions,
      label: 'مباراة انتهت',
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      trend: 'down' as const,
      trendLabel: '-8%',
    },
  ];

  return (
    <section className="border-b stats-gradient-strip">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 py-4 overflow-x-auto scrollbar-none">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className={`flex items-center gap-3 stat-item-border px-4 py-3 shrink-0`}
            >
              {/* Animated gradient icon */}
              <GradientIconContainer gradient={item.iconGradient}>
                {item.icon}
              </GradientIconContainer>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tabular-nums">
                    <AnimatedCounter value={item.value} />
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Spark line mini chart */}
                  <SparkLine values={item.sparkValues} color={item.sparkColor} />
                  {/* Trending indicator */}
                  {item.trend === 'up' ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
                      <TrendingUp className="h-2.5 w-2.5" />
                      {item.trendLabel}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-900/30 px-1.5 py-0.5 rounded-full">
                      <TrendingDown className="h-2.5 w-2.5" />
                      {item.trendLabel}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
