'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { competitionsApi } from '@/lib/api';
import { Calendar, ArrowLeft, Clock, AlertTriangle, Zap } from 'lucide-react';

export function DeadlineTimeline() {
  const { setSelectedCompetition, setView } = useNavigationStore();

  const { data, isLoading } = useQuery({
    queryKey: ['competitions-deadline-timeline'],
    queryFn: () => competitionsApi.list({ status: 'OPEN', limit: 8, sort: 'deadline' }),
  });

  const competitions = data?.data || [];

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Calendar className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold">جدول المواعيد</h2>
            <p className="text-sm text-muted-foreground">المباريات حسب ترتيب الآجال</p>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </section>
    );
  }

  if (competitions.length === 0) return null;

  const now = new Date().getTime();

  const getTimeCategory = (deadline: string | null) => {
    if (!deadline) return 'unknown';
    const diff = new Date(deadline).getTime() - now;
    if (diff < 1000 * 60 * 60 * 24 * 3) return 'urgent'; // < 3 days
    if (diff < 1000 * 60 * 60 * 24 * 7) return 'warning'; // < 1 week
    if (diff < 1000 * 60 * 60 * 24 * 30) return 'normal'; // < 30 days
    return 'distant';
  };

  const categoryConfig = {
    urgent: {
      label: 'عاجل - أقل من 3 أيام',
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-r-red-500 dark:border-r-red-400',
      badgeBg: 'bg-red-500',
    },
    warning: {
      label: 'قريب - أقل من أسبوع',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-100 dark:bg-amber-900/30',
      border: 'border-r-amber-500 dark:border-r-amber-400',
      badgeBg: 'bg-amber-500',
    },
    normal: {
      label: 'متاح',
      icon: <Zap className="h-4 w-4" />,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'border-r-emerald-500 dark:border-r-emerald-400',
      badgeBg: 'bg-emerald-500',
    },
    distant: {
      label: 'لاحق',
      icon: <Calendar className="h-4 w-4" />,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-r-blue-500 dark:border-r-blue-400',
      badgeBg: 'bg-blue-500',
    },
    unknown: {
      label: 'غير محدد',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-gray-600 dark:text-gray-400',
      bg: 'bg-gray-100 dark:bg-gray-900/30',
      border: 'border-r-gray-400 dark:border-r-gray-500',
      badgeBg: 'bg-gray-400',
    },
  };

  // Group by time category
  const grouped: Record<string, typeof competitions> = {
    urgent: [],
    warning: [],
    normal: [],
    distant: [],
    unknown: [],
  };

  competitions.forEach((comp) => {
    const cat = getTimeCategory(comp.deadline);
    grouped[cat].push(comp);
  });

  return (
    <section className="bg-gradient-to-b from-muted/30 to-transparent py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">جدول المواعيد</h2>
              <p className="text-sm text-muted-foreground">المباريات حسب ترتيب الآجال</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('competitions')}
            className="gap-1.5 text-amber-600 dark:text-amber-400 hover:text-amber-700"
          >
            عرض الكل <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Timeline with visual line */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute right-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-300 via-amber-300 via-emerald-300 to-blue-300 dark:from-red-700 dark:via-amber-700 dark:via-emerald-700 dark:to-blue-700 rounded-full" />

          <div className="space-y-1">
            {(['urgent', 'warning', 'normal'] as const).map((category) => {
              const items = grouped[category];
              if (items.length === 0) return null;
              const config = categoryConfig[category];

              return (
                <div key={category} className="mb-6">
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-3 mr-10">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full ${config.bg} ${config.color}`}>
                      {config.icon}
                    </div>
                    <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                    <span className={`text-xs ${config.bg} ${config.color} px-2 py-0.5 rounded-full font-medium`}>
                      {items.length}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-2 mr-10">
                    {items.map((comp) => (
                      <Card
                        key={comp.id}
                        className={`group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-r-4 ${config.border} border-t-0 border-l-0 border-b-0`}
                        onClick={() => setSelectedCompetition(comp.id)}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {comp.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {comp.school && (
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                  {comp.school.name}
                                </span>
                              )}
                              {comp.city && (
                                <span className="text-xs text-muted-foreground">
                                  • {comp.city.name}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            {comp.deadline ? (
                              <CountdownTimer deadline={comp.deadline} size="sm" />
                            ) : (
                              <span className="text-xs text-muted-foreground">موعد غير محدد</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
