'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { dashboardApi, competitionsApi, schoolsApi, categoriesApi } from '@/lib/api';
import { useNavigationStore } from '@/store/navigation';
import {
  BarChart3, TrendingUp, GraduationCap, Trophy, Calendar, Clock, Target,
  Building2, AlertTriangle, Activity, PieChart as PieChartIcon, MapPin, ArrowLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { Competition, School, Category, DashboardStats } from '@/types';

// ============================================
// COLOR PALETTE - Emerald/Teal/Amber/Violet
// ============================================

const CHART_COLORS = {
  emerald: '#10b981',
  teal: '#14b8a6',
  amber: '#f59e0b',
  violet: '#8b5cf6',
  rose: '#f43f5e',
  cyan: '#06b6d4',
  orange: '#f97316',
  indigo: '#6366f1',
  pink: '#ec4899',
  lime: '#84cc16',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#10b981',
  CLOSED: '#ef4444',
  EXPIRED: '#6b7280',
  UPCOMING: '#f59e0b',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'مفتوحة',
  CLOSED: 'مغلقة',
  EXPIRED: 'منتهية',
  UPCOMING: 'قادمة',
};

const SCHOOL_TYPE_COLORS: Record<string, string> = {
  PUBLIC: '#10b981',
  PRIVATE: '#f59e0b',
  SEMI_PRIVATE: '#14b8a6',
};

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  PUBLIC: 'عمومي',
  PRIVATE: 'خاص',
  SEMI_PRIVATE: 'شبه خصوصي',
};

const BAR_COLORS = [
  CHART_COLORS.emerald, CHART_COLORS.teal, CHART_COLORS.amber,
  CHART_COLORS.violet, CHART_COLORS.cyan, CHART_COLORS.orange,
  CHART_COLORS.rose, CHART_COLORS.indigo,
];

// ============================================
// CUSTOM TOOLTIP
// ============================================

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-background border border-border rounded-lg shadow-lg px-3 py-2 text-sm" dir="rtl">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// LOADING SKELETONS
// ============================================

function StatsCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-muted" />
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-32 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

// ============================================
// OVERVIEW STAT CARD
// ============================================

function OverviewStatCard({
  icon, value, label, gradient, bg, color, description,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  gradient: string;
  bg: string;
  color: string;
  description?: string;
}) {
  return (
    <Card className="glass-card-premium gradient-border-animated overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <p className={`text-3xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {description && <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// DEADLINE TIMELINE ITEM
// ============================================

function DeadlineItem({ competition, index }: { competition: Competition; index: number }) {
  const { setSelectedCompetition } = useNavigationStore();
  const deadline = competition.deadline ? new Date(competition.deadline) : null;
  const now = new Date();
  const diffMs = deadline ? deadline.getTime() - now.getTime() : 0;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const urgencyConfig = diffDays < 0
    ? { label: 'انتهى', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600' }
    : diffDays <= 3
    ? { label: `${diffDays} أيام`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-300 dark:border-red-700' }
    : diffDays <= 7
    ? { label: `${diffDays} أيام`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-300 dark:border-amber-700' }
    : { label: `${diffDays} يوم`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-300 dark:border-emerald-700' };

  const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];

  return (
    <button
      onClick={() => setSelectedCompetition(competition.id)}
      className="flex items-center gap-3 w-full text-right p-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      {/* Date block */}
      {deadline && (
        <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${urgencyConfig.border} ${urgencyConfig.bg}`}>
          <span className={`text-lg font-bold leading-none ${urgencyConfig.color}`}>
            {deadline.getDate()}
          </span>
          <span className="text-[10px] text-muted-foreground mt-0.5">
            {monthNames[deadline.getMonth()]}
          </span>
        </div>
      )}
      {!deadline && (
        <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30">
          <span className="text-xs text-muted-foreground">—</span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {competition.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {competition.school && (
            <span className="text-xs text-muted-foreground line-clamp-1">{competition.school.name}</span>
          )}
          {competition.city && (
            <span className="text-xs text-muted-foreground">• {competition.city.name}</span>
          )}
        </div>
      </div>

      {/* Urgency badge */}
      <Badge variant="outline" className={`shrink-0 text-[10px] ${urgencyConfig.color} ${urgencyConfig.border}`}>
        {urgencyConfig.label}
      </Badge>
    </button>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function StatsView() {
  const { setView } = useNavigationStore();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.stats(),
  });

  const { data: competitionsData, isLoading: competitionsLoading } = useQuery({
    queryKey: ['competitions-all-stats'],
    queryFn: () => competitionsApi.list({ limit: 100 }),
  });

  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['schools-all-stats'],
    queryFn: () => schoolsApi.list({ limit: 100 }),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories-all-stats'],
    queryFn: () => categoriesApi.list(),
  });

  const stats = statsData?.data;
  const competitions = competitionsData?.data || [];
  const schools = schoolsData?.data || [];
  const categories = categoriesData?.data || [];

  const isLoading = statsLoading || competitionsLoading || schoolsLoading || categoriesLoading;

  // ============================================
  // CHART DATA COMPUTATION
  // ============================================

  const statusData = useMemo(() => {
    if (!stats) return [];
    const upcoming = (stats.totalCompetitions || 0) - (stats.openCompetitions || 0) - (stats.closedCompetitions || 0) - (stats.expiredCompetitions || 0);
    return [
      { name: STATUS_LABELS.OPEN, value: stats.openCompetitions || 0, color: STATUS_COLORS.OPEN, key: 'OPEN' },
      { name: STATUS_LABELS.CLOSED, value: stats.closedCompetitions || 0, color: STATUS_COLORS.CLOSED, key: 'CLOSED' },
      { name: STATUS_LABELS.EXPIRED, value: stats.expiredCompetitions || 0, color: STATUS_COLORS.EXPIRED, key: 'EXPIRED' },
      { name: STATUS_LABELS.UPCOMING, value: upcoming > 0 ? upcoming : 0, color: STATUS_COLORS.UPCOMING, key: 'UPCOMING' },
    ].filter(d => d.value > 0);
  }, [stats]);

  const categoryChartData = useMemo(() => {
    return categories
      .map(cat => ({
        name: cat.name.length > 18 ? cat.name.slice(0, 18) + '...' : cat.name,
        fullName: cat.name,
        مباريات: cat._count?.competitions || 0,
        مدارس: cat._count?.schools || 0,
      }))
      .filter(d => d.مباريات > 0 || d.مدارس > 0)
      .sort((a, b) => b.مباريات - a.مباريات)
      .slice(0, 8);
  }, [categories]);

  const schoolTypeData = useMemo(() => {
    return [
      { name: SCHOOL_TYPE_LABELS.PUBLIC, value: schools.filter(s => s.type === 'PUBLIC').length, color: SCHOOL_TYPE_COLORS.PUBLIC },
      { name: SCHOOL_TYPE_LABELS.PRIVATE, value: schools.filter(s => s.type === 'PRIVATE').length, color: SCHOOL_TYPE_COLORS.PRIVATE },
      { name: SCHOOL_TYPE_LABELS.SEMI_PRIVATE, value: schools.filter(s => s.type === 'SEMI_PRIVATE').length, color: SCHOOL_TYPE_COLORS.SEMI_PRIVATE },
    ].filter(d => d.value > 0);
  }, [schools]);

  const topSchoolsData = useMemo(() => {
    return schools
      .map(school => ({
        name: school.name.length > 20 ? school.name.slice(0, 20) + '...' : school.name,
        fullName: school.name,
        مباريات: school._count?.competitions || 0,
        type: school.type,
        color: SCHOOL_TYPE_COLORS[school.type] || CHART_COLORS.emerald,
      }))
      .filter(s => s.مباريات > 0)
      .sort((a, b) => b.مباريات - a.مباريات)
      .slice(0, 8);
  }, [schools]);

  const cityData = useMemo(() => {
    return Object.entries(
      competitions.reduce((acc, comp) => {
        const city = comp.city?.name || 'غير محدد';
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([name, value]) => ({ name, مباريات: value }))
      .sort((a, b) => b.مباريات - a.مباريات)
      .slice(0, 8);
  }, [competitions]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return competitions
      .filter(c => c.status === 'OPEN' && c.deadline)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
      .slice(0, 8);
  }, [competitions]);

  // ============================================
  // LOADING STATE
  // ============================================

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ChartCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <section className="container mx-auto px-4 py-8">
      {/* Header with decorative pattern */}
      <div className="stats-header-pattern rounded-2xl p-6 mb-8 bg-gradient-to-l from-emerald-50/80 via-teal-50/40 to-transparent dark:from-emerald-950/30 dark:via-teal-950/15 dark:to-transparent">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="moroccan-corner flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">إحصائيات المنصة</h1>
              <p className="text-sm text-muted-foreground">نظرة شاملة على بيانات المباريات والمدارس في المغرب</p>
            </div>
          </div>
          <button
            onClick={() => setView('competitions')}
            className="hidden sm:flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            استعرض المباريات
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ============================================ */}
      {/* OVERVIEW STAT CARDS */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <OverviewStatCard
          icon={<Trophy className="h-5 w-5" />}
          value={stats?.totalCompetitions || 0}
          label="إجمالي المباريات"
          gradient="from-emerald-400 to-emerald-600"
          bg="bg-emerald-100 dark:bg-emerald-900/30"
          color="text-emerald-600 dark:text-emerald-400"
        />
        <OverviewStatCard
          icon={<TrendingUp className="h-5 w-5" />}
          value={stats?.openCompetitions || 0}
          label="مفتوحة حالياً"
          description="متاحة للتسجيل"
          gradient="from-green-400 to-green-600"
          bg="bg-green-100 dark:bg-green-900/30"
          color="text-green-600 dark:text-green-400"
        />
        <OverviewStatCard
          icon={<GraduationCap className="h-5 w-5" />}
          value={stats?.totalSchools || 0}
          label="مدرسة ومعهد"
          gradient="from-teal-400 to-teal-600"
          bg="bg-teal-100 dark:bg-teal-900/30"
          color="text-teal-600 dark:text-teal-400"
        />
        <OverviewStatCard
          icon={<Target className="h-5 w-5" />}
          value={categories.length}
          label="تصنيف"
          gradient="from-violet-400 to-violet-600"
          bg="bg-violet-100 dark:bg-violet-900/30"
          color="text-violet-600 dark:text-violet-400"
        />
        <OverviewStatCard
          icon={<AlertTriangle className="h-5 w-5" />}
          value={stats?.expiredCompetitions || 0}
          label="مباراة منتهية"
          gradient="from-gray-400 to-gray-600"
          bg="bg-gray-100 dark:bg-gray-900/30"
          color="text-gray-600 dark:text-gray-400"
        />
        <OverviewStatCard
          icon={<MapPin className="h-5 w-5" />}
          value={cityData.length}
          label="مدينة"
          gradient="from-amber-400 to-amber-600"
          bg="bg-amber-100 dark:bg-amber-900/30"
          color="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* ============================================ */}
      {/* CHARTS GRID - Row 1: Pie Charts */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">

        {/* Competitions by Status - Donut Chart */}
        <div className="gradient-border-wrap rounded-xl">
        <Card className="chart-card-hover overflow-hidden border-0">
          <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">حالات المباريات</CardTitle>
                <CardDescription>توزيع المباريات حسب الحالة الحالية</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Status summary */}
            <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t">
              {statusData.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-xs">
                  <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}:</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Schools by Type - Donut Chart */}
        <div className="gradient-border-wrap rounded-xl">
        <Card className="chart-card-hover overflow-hidden border-0">
          <div className="h-1 bg-gradient-to-r from-teal-400 via-amber-400 to-teal-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Building2 className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <CardTitle className="text-base">أنواع المدارس</CardTitle>
                <CardDescription>توزيع المؤسسات حسب نوعها</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={schoolTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {schoolTypeData.map((entry, index) => (
                      <Cell key={`school-type-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Type summary with progress bars */}
            <div className="space-y-2 mt-2 pt-3 border-t">
              {schoolTypeData.map((type) => (
                <div key={type.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{type.name}</span>
                    <span className="font-semibold">{type.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${schools.length > 0 ? (type.value / schools.length) * 100 : 0}%`,
                        backgroundColor: type.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Competitions by City - Vertical Bar Chart */}
        <div className="gradient-border-wrap rounded-xl md:col-span-2 lg:col-span-1">
        <Card className="chart-card-hover overflow-hidden border-0">
          <div className="h-1 bg-gradient-to-r from-amber-400 via-violet-400 to-amber-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <MapPin className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">المباريات حسب المدينة</CardTitle>
                <CardDescription>عدد المباريات المتاحة في كل مدينة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    angle={-35}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="مباريات" radius={[4, 4, 0, 0]}>
                    {cityData.map((_, index) => (
                      <Cell key={`city-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* ============================================ */}
      {/* CHARTS GRID - Row 2: Bar Charts */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Competitions by Category - Horizontal Bar Chart */}
        <div className="gradient-border-wrap rounded-xl">
        <Card className="chart-card-hover overflow-hidden border-0">
          <div className="h-1 bg-gradient-to-r from-teal-400 to-emerald-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <PieChartIcon className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-base">المباريات حسب التصنيف</CardTitle>
                <CardDescription>عدد المباريات والمدارس في كل تصنيف</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ right: 20, left: 10, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border) / 0.5)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs">{value}</span>
                    )}
                  />
                  <Bar dataKey="مباريات" fill={CHART_COLORS.emerald} radius={[0, 4, 4, 0]} />
                  <Bar dataKey="مدارس" fill={CHART_COLORS.teal} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Top Schools - Horizontal Bar Chart */}
        <div className="gradient-border-wrap rounded-xl">
        <Card className="chart-card-hover overflow-hidden border-0">
          <div className="h-1 bg-gradient-to-r from-violet-400 to-amber-500" />
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <GraduationCap className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <CardTitle className="text-base">أكثر المدارس مباريات</CardTitle>
                <CardDescription>المؤسسات الأكثر نشاطاً في المباريات</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {topSchoolsData.length > 0 ? (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSchoolsData} layout="vertical" margin={{ right: 20, left: 10, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="مباريات" radius={[0, 4, 4, 0]}>
                      {topSchoolsData.map((entry, index) => (
                        <Cell key={`top-school-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">
                لا توجد بيانات كافية
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* ============================================ */}
      {/* DEADLINES TIMELINE */}
      {/* ============================================ */}
      <div className="gradient-border-wrap rounded-xl mb-6">
      <Card className="chart-card-hover overflow-hidden border-0">
        <div className="h-1 bg-gradient-to-r from-amber-400 via-red-400 to-amber-500" />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <CardTitle className="text-base">جدول الآجال القادمة</CardTitle>
                <CardDescription>المباريات المفتوحة مرتبة حسب موعد الإغلاق</CardDescription>
              </div>
            </div>
            {upcomingDeadlines.length > 0 && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700">
                {upcomingDeadlines.length} مباراة
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length > 0 ? (
            <div className="relative">
              {/* Timeline gradient line */}
              <div className="absolute right-[27px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-red-400 via-amber-400 to-emerald-400 rounded-full" />

              <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {upcomingDeadlines.map((comp, index) => (
                  <DeadlineItem key={comp.id} competition={comp} index={index} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm">لا توجد مباريات مفتوحة حالياً</p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>

      {/* ============================================ */}
      {/* BOTTOM RANKING CARDS */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Cities */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-sm">أكثر المدن مباريات</h3>
            </div>
            <div className="space-y-2.5">
              {cityData.slice(0, 5).map((city, i) => (
                <div key={city.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${
                      i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-emerald-400' : i === 2 ? 'bg-emerald-300' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i + 1}
                    </div>
                    <span className="truncate max-w-[120px]">{city.name}</span>
                  </div>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{city.مباريات}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Target className="h-4 w-4 text-teal-600" />
              </div>
              <h3 className="font-semibold text-sm">أكثر التصنيفات نشاطاً</h3>
            </div>
            <div className="space-y-2.5">
              {[...categoryChartData]
                .sort((a, b) => b.مباريات - a.مباريات)
                .slice(0, 5)
                .map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${
                        i === 0 ? 'bg-teal-500' : i === 1 ? 'bg-teal-400' : i === 2 ? 'bg-teal-300' : 'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <span className="truncate max-w-[120px]" title={cat.fullName}>{cat.name}</span>
                    </div>
                    <span className="font-semibold text-teal-600 dark:text-teal-400 tabular-nums">{cat.مباريات}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Schools by Type */}
        <Card className="overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-600" />
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Building2 className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="font-semibold text-sm">مدارس حسب النوع</h3>
            </div>
            <div className="space-y-4">
              {schoolTypeData.map((type) => {
                const percentage = schools.length > 0 ? Math.round((type.value / schools.length) * 100) : 0;
                return (
                  <div key={type.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                        <span>{type.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">{type.value}</span>
                        <span className="text-xs text-muted-foreground">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: type.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--muted-foreground) / 0.5);
        }
      `}</style>
    </section>
  );
}
