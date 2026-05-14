'use client';

import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { History, Trophy, GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RecentlyViewedSection() {
  const { items } = useRecentlyViewedStore();
  const { setSelectedCompetition, setSelectedSchool, setView } = useNavigationStore();

  const recentItems = items.slice(0, 6);

  if (recentItems.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <History className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">شوهدت مؤخراً</h2>
            <p className="text-sm text-muted-foreground">آخر المباريات والمدارس التي تصفحتها</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {recentItems.map((item) => (
          <Card
            key={item.id}
            className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/50"
            onClick={() => {
              if (item.type === 'competition') setSelectedCompetition(item.id);
              else setSelectedSchool(item.id);
            }}
          >
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                item.type === 'competition'
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-teal-100 dark:bg-teal-900/30'
              }`}>
                {item.type === 'competition'
                  ? <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  : <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h4>
                {item.subtitle && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{item.subtitle}</p>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {item.type === 'competition' ? 'مباراة' : 'مدرسة'}
                </p>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
