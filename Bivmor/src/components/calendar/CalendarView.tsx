'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { competitionsApi } from '@/lib/api';
import { useNavigationStore } from '@/store/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Trophy,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import type { Competition, CompetitionStatus } from '@/types';

// ============================================
// CONSTANTS
// ============================================

const ARABIC_DAY_NAMES = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

const ARABIC_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

type CalendarViewMode = 'monthly' | 'upcoming';

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // Sunday = 0, which matches our ARABIC_DAY_NAMES array
  return new Date(year, month, 1).getDay();
}

function groupCompetitionsByDeadline(
  competitions: Competition[]
): Map<string, Competition[]> {
  const grouped = new Map<string, Competition[]>();

  for (const comp of competitions) {
    if (!comp.deadline) continue;
    const dateKey = comp.deadline.split('T')[0]; // YYYY-MM-DD
    const existing = grouped.get(dateKey) || [];
    existing.push(comp);
    grouped.set(dateKey, existing);
  }

  return grouped;
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDateArabic(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = ARABIC_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDeadlineRelative(daysRemaining: number): string {
  if (daysRemaining < 0) return 'منتهي';
  if (daysRemaining === 0) return 'اليوم';
  if (daysRemaining === 1) return 'غداً';
  if (daysRemaining === 2) return 'بعد غد';
  if (daysRemaining < 7) return `بعد ${daysRemaining} أيام`;
  if (daysRemaining < 30) {
    const weeks = Math.floor(daysRemaining / 7);
    return `بعد ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  }
  const months = Math.floor(daysRemaining / 30);
  return `بعد ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
}

function getStatusColor(status: CompetitionStatus): string {
  switch (status) {
    case 'OPEN':
      return 'bg-emerald-500';
    case 'UPCOMING':
      return 'bg-amber-500';
    case 'CLOSED':
      return 'bg-red-500';
    case 'EXPIRED':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
}

function getStatusBadgeStyle(status: CompetitionStatus): string {
  switch (status) {
    case 'OPEN':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'UPCOMING':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'CLOSED':
      return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border-red-200 dark:border-red-800';
    case 'EXPIRED':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/40 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function getStatusLabel(status: CompetitionStatus): string {
  switch (status) {
    case 'OPEN':
      return 'مفتوح';
    case 'UPCOMING':
      return 'قريباً';
    case 'CLOSED':
      return 'مغلق';
    case 'EXPIRED':
      return 'منتهي';
    default:
      return status;
  }
}

function getUrgencyColor(daysRemaining: number): string {
  if (daysRemaining < 0) return 'text-gray-400';
  if (daysRemaining <= 3) return 'text-red-500 dark:text-red-400';
  if (daysRemaining <= 7) return 'text-amber-500 dark:text-amber-400';
  return 'text-emerald-500 dark:text-emerald-400';
}

function getUrgencyBg(daysRemaining: number): string {
  if (daysRemaining < 0) return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  if (daysRemaining <= 3) return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  if (daysRemaining <= 7) return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
  return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800';
}

// ============================================
// ANIMATION VARIANTS
// ============================================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
};

const viewTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

// ============================================
// MONTHLY CALENDAR GRID COMPONENT
// ============================================

function MonthlyCalendarGrid({
  year,
  month,
  competitionsByDeadline,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  competitionsByDeadline: Map<string, Competition[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Build the calendar grid cells
  const cells: (number | null)[] = [];
  // Add empty cells for days before the first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  // Add day numbers
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  return (
    <div className="w-full" dir="rtl">
      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {ARABIC_DAY_NAMES.map((name) => (
          <div
            key={name}
            className="text-center text-xs font-semibold text-muted-foreground py-2"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Calendar days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayCompetitions = competitionsByDeadline.get(dateStr) || [];
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const hasCompetitions = dayCompetitions.length > 0;

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(dateStr)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative transition-all
                ${isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-background' : ''}
                ${isSelected ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700' : ''}
                ${!isSelected && hasCompetitions ? 'hover:bg-emerald-50 dark:hover:bg-emerald-950/30' : ''}
                ${!isSelected && !hasCompetitions ? 'hover:bg-muted/50' : ''}
              `}
            >
              <span
                className={`
                  font-medium text-sm
                  ${isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}
                  ${!isToday && isSelected ? 'text-emerald-700 dark:text-emerald-300' : ''}
                  ${!isToday && !isSelected ? 'text-foreground' : ''}
                `}
              >
                {day}
              </span>

              {/* Competition dots */}
              {hasCompetitions && (
                <div className="flex items-center gap-0.5 mt-0.5">
                  {dayCompetitions.slice(0, 3).map((comp, i) => (
                    <div
                      key={`${comp.id}-${i}`}
                      className={`w-1.5 h-1.5 rounded-full ${getStatusColor(comp.status)}`}
                    />
                  ))}
                  {dayCompetitions.length > 3 && (
                    <span className="text-[8px] text-muted-foreground">
                      +{dayCompetitions.length - 3}
                    </span>
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// DAY DETAIL PANEL
// ============================================

function DayDetailPanel({
  date,
  competitions,
  onSelectCompetition,
}: {
  date: string;
  competitions: Competition[];
  onSelectCompetition: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-4"
    >
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base">
              مباريات {formatDateArabic(date)}
            </CardTitle>
            <Badge
              variant="secondary"
              className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
            >
              {competitions.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {competitions.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => onSelectCompetition(comp.id)}
                  className="w-full text-right p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {comp.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {comp.school && (
                          <span className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {comp.school.name}
                          </span>
                        )}
                        {comp.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {comp.city.nameAr || comp.city.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`shrink-0 text-[10px] border ${getStatusBadgeStyle(comp.status)}`}
                    >
                      {getStatusLabel(comp.status)}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// UPCOMING DEADLINES VIEW
// ============================================

function UpcomingDeadlinesView({
  competitions,
  onSelectCompetition,
}: {
  competitions: Competition[];
  onSelectCompetition: (id: string) => void;
}) {
  // Filter and sort: only future deadlines, sorted by soonest
  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    return competitions
      .filter((c) => {
        if (!c.deadline) return false;
        const deadlineDate = new Date(c.deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        return deadlineDate >= now && (c.status === 'OPEN' || c.status === 'UPCOMING');
      })
      .sort((a, b) => {
        const dateA = new Date(a.deadline!);
        const dateB = new Date(b.deadline!);
        return dateA.getTime() - dateB.getTime();
      });
  }, [competitions]);

  if (upcoming.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
          <Calendar className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">لا توجد آجال قادمة</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          لا توجد مباريات بآجال تسجيل قادمة حالياً. تحقق لاحقاً للمباريات الجديدة.
        </p>
      </motion.div>
    );
  }

  // Group by urgency
  const urgentItems = upcoming.filter((c) => getDaysRemaining(c.deadline!) <= 3);
  const warningItems = upcoming.filter(
    (c) => getDaysRemaining(c.deadline!) > 3 && getDaysRemaining(c.deadline!) <= 7
  );
  const normalItems = upcoming.filter((c) => getDaysRemaining(c.deadline!) > 7);

  const sections = [
    { key: 'urgent', label: 'عاجل - أقل من 3 أيام', items: urgentItems, icon: AlertTriangle, color: 'text-red-500' },
    { key: 'warning', label: 'تنبيه - أقل من أسبوع', items: warningItems, icon: Clock, color: 'text-amber-500' },
    { key: 'normal', label: 'قادمة - أكثر من أسبوع', items: normalItems, icon: CheckCircle, color: 'text-emerald-500' },
  ].filter((s) => s.items.length > 0);

  return (
    <ScrollArea className="max-h-[calc(100vh-280px)]">
      <div className="space-y-6 pr-1">
        {sections.map((section) => (
          <div key={section.key}>
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-3">
              <section.icon className={`h-4 w-4 ${section.color}`} />
              <h3 className="text-sm font-semibold">{section.label}</h3>
              <Badge variant="secondary" className="text-[10px] h-5">
                {section.items.length}
              </Badge>
            </div>

            {/* Timeline Items */}
            <div className="relative space-y-3">
              {/* Timeline line */}
              <div className="absolute right-[11px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-300 to-emerald-300 dark:from-emerald-700 dark:via-teal-700 dark:to-emerald-700" />

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {section.items.map((comp) => {
                  const daysRemaining = getDaysRemaining(comp.deadline!);
                  const urgencyClass = getUrgencyBg(daysRemaining);

                  return (
                    <motion.div
                      key={comp.id}
                      variants={staggerItem}
                      className="relative"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute right-[7px] top-4 w-[9px] h-[9px] rounded-full ${getStatusColor(comp.status)} ring-2 ring-background z-10`}
                      />

                      {/* Content card */}
                      <button
                        onClick={() => onSelectCompetition(comp.id)}
                        className={`w-full text-right mr-7 p-4 rounded-xl border transition-all hover:shadow-md ${urgencyClass}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            {/* Date */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatDateArabic(comp.deadline!)}
                              </span>
                            </div>

                            {/* Title */}
                            <p className="font-bold text-sm mb-1 truncate">
                              {comp.title}
                            </p>

                            {/* Meta info */}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {comp.school && (
                                <span className="flex items-center gap-1 truncate">
                                  <Trophy className="h-3 w-3 shrink-0" />
                                  {comp.school.name}
                                </span>
                              )}
                              {comp.city && (
                                <span className="flex items-center gap-1 shrink-0">
                                  <MapPin className="h-3 w-3" />
                                  {comp.city.nameAr || comp.city.name}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status & Days remaining */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <Badge
                              className={`text-[10px] border ${getStatusBadgeStyle(comp.status)}`}
                            >
                              {getStatusLabel(comp.status)}
                            </Badge>
                            <div
                              className={`flex items-center gap-1 text-xs font-semibold ${getUrgencyColor(daysRemaining)}`}
                            >
                              <Clock className="h-3 w-3" />
                              {formatDeadlineRelative(daysRemaining)}
                            </div>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ============================================
// LOADING SKELETON
// ============================================

function CalendarLoadingSkeleton() {
  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header skeleton */}
      <div className="bg-gradient-to-b from-emerald-50 via-teal-50/50 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-muted animate-pulse" />
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-5 w-64 bg-muted animate-pulse rounded" />
            <div className="flex items-center gap-2 mt-4">
              <div className="h-10 w-32 bg-muted animate-pulse rounded-full" />
              <div className="h-10 w-40 bg-muted animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN CALENDAR VIEW COMPONENT
// ============================================

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('monthly');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { setSelectedCompetition } = useNavigationStore();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Fetch competitions
  const { data: competitionsData, isLoading } = useQuery({
    queryKey: ['competitions-calendar'],
    queryFn: () => competitionsApi.list({ limit: 100 }),
  });

  const competitions = competitionsData?.data || [];

  // Group competitions by deadline date
  const competitionsByDeadline = useMemo(
    () => groupCompetitionsByDeadline(competitions),
    [competitions]
  );

  // Navigate months
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }, []);

  // Handle date selection in monthly view
  const handleSelectDate = useCallback((date: string) => {
    setSelectedDate((prev) => (prev === date ? null : date));
  }, []);

  // Handle competition selection
  const handleSelectCompetition = useCallback(
    (id: string) => {
      setSelectedCompetition(id);
    },
    [setSelectedCompetition]
  );

  // Selected day competitions
  const selectedDayCompetitions = useMemo(() => {
    if (!selectedDate) return [];
    return competitionsByDeadline.get(selectedDate) || [];
  }, [selectedDate, competitionsByDeadline]);

  if (isLoading) {
    return <CalendarLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50/50 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-200/20 dark:bg-emerald-800/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-teal-200/20 dark:bg-teal-800/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-10 md:py-14 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-lg shadow-emerald-500/25"
            >
              <Calendar className="h-8 w-8" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              التقويم
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-6">
              مواعيد المباريات والآجال المهمة
            </p>

            {/* View Toggle */}
            <div className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-background p-1 shadow-sm">
              <Button
                variant={viewMode === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('monthly')}
                className={`rounded-full gap-1.5 text-sm ${
                  viewMode === 'monthly'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                شهري
              </Button>
              <Button
                variant={viewMode === 'upcoming' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('upcoming')}
                className={`rounded-full gap-1.5 text-sm ${
                  viewMode === 'upcoming'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                الآجال القادمة
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {viewMode === 'monthly' ? (
              <motion.div
                key="monthly"
                {...viewTransition}
              >
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextMonth}
                    className="h-9 w-9 rounded-full border-emerald-200 dark:border-emerald-800"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold">
                      {ARABIC_MONTHS[currentMonth]} {currentYear}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={goToToday}
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                    >
                      اليوم
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousMonth}
                    className="h-9 w-9 rounded-full border-emerald-200 dark:border-emerald-800"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <Card className="border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                  <CardContent className="p-4 md:p-6">
                    <MonthlyCalendarGrid
                      year={currentYear}
                      month={currentMonth}
                      competitionsByDeadline={competitionsByDeadline}
                      selectedDate={selectedDate}
                      onSelectDate={handleSelectDate}
                    />
                  </CardContent>
                </Card>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>مفتوح</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>قريباً</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span>مغلق</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>منتهي</span>
                  </div>
                </div>

                {/* Day Detail Panel */}
                <AnimatePresence>
                  {selectedDate && selectedDayCompetitions.length > 0 && (
                    <DayDetailPanel
                      date={selectedDate}
                      competitions={selectedDayCompetitions}
                      onSelectCompetition={handleSelectCompetition}
                    />
                  )}
                </AnimatePresence>

                {/* Empty state for selected date with no competitions */}
                <AnimatePresence>
                  {selectedDate && selectedDayCompetitions.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 text-center py-6 text-muted-foreground text-sm"
                    >
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
                      لا توجد مباريات في هذا التاريخ
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="upcoming"
                {...viewTransition}
              >
                <UpcomingDeadlinesView
                  competitions={competitions}
                  onSelectCompetition={handleSelectCompetition}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
