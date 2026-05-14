'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { CompetitionCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { competitionsApi } from '@/lib/api';
import { ArrowLeft, Trophy, MapPin, Clock, Building2, ExternalLink } from 'lucide-react';
import type { Competition, CompetitionStatus } from '@/types';

export function FeaturedCompetitions() {
  const { setView, setSelectedCompetition } = useNavigationStore();
  const { data, isLoading } = useQuery({
    queryKey: ['competitions-featured'],
    queryFn: () => competitionsApi.list({ isFeatured: true, limit: 6 }),
  });

  const competitions = data?.data || [];

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 w-40 bg-muted animate-pulse rounded" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CompetitionCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (competitions.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">مباريات مميزة</h2>
            <p className="text-sm text-muted-foreground">أبرز المباريات المتاحة حالياً</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setView('competitions')} className="gap-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">
          عرض الكل <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {competitions.map((competition) => (
          <CompetitionCard key={competition.id} competition={competition} onSelect={() => setSelectedCompetition(competition.id)} />
        ))}
      </div>
    </section>
  );
}

const statusAccentColors: Record<CompetitionStatus, string> = {
  OPEN: 'border-r-emerald-500 dark:border-r-emerald-400',
  UPCOMING: 'border-r-amber-500 dark:border-r-amber-400',
  EXPIRED: 'border-r-gray-400 dark:border-r-gray-500',
  CLOSED: 'border-r-red-500 dark:border-r-red-400',
};

export function CompetitionCard({ competition, onSelect }: { competition: Competition; onSelect: () => void }) {
  const { addViewed } = useRecentlyViewedStore();
  const isExpired = competition.status === 'EXPIRED';

  const handleClick = () => {
    addViewed({
      id: competition.id,
      type: 'competition',
      title: competition.title,
      subtitle: competition.school?.name || competition.city?.name,
    });
    onSelect();
  };

  return (
    <Card
      className={`competition-card-accent competition-glow group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 ${isExpired ? 'opacity-75' : ''}`}
      data-status={competition.status}
      onClick={handleClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-semibold text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-1 ${isExpired ? 'line-through opacity-60' : ''}`}>
            {competition.title}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0">
            <FavoriteButton id={competition.id} type="competition" title={competition.title} size="sm" />
            <StatusBadge status={competition.status} />
          </div>
        </div>
        {competition.shortDescription && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{competition.shortDescription}</p>
        )}
        {/* School name with icon */}
        {competition.school && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0 text-teal-500 dark:text-teal-400" />
            <span className="line-clamp-1">{competition.school.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {competition.city && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
              <MapPin className="h-3 w-3" /> {competition.city.name}
            </span>
          )}
          {competition.category && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
              {competition.category.name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          {competition.deadline ? (
            <CountdownTimer deadline={competition.deadline} size="sm" />
          ) : (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> موعد غير محدد
            </span>
          )}
          <div className="flex items-center gap-1">
            {competition.officialLink && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 h-7 px-2 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(competition.officialLink!, '_blank');
                }}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 h-7 px-2 gap-1 group/btn" onClick={(e) => { e.stopPropagation(); handleClick(); }}>
              المزيد من التفاصيل
              <ArrowLeft className="h-3 w-3 transition-transform group-hover/btn:-translate-x-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OpenCompetitionsSection() {
  const { setSelectedCompetition } = useNavigationStore();
  const { addViewed } = useRecentlyViewedStore();
  const { data, isLoading } = useQuery({
    queryKey: ['competitions-open'],
    queryFn: () => competitionsApi.list({ status: 'OPEN', limit: 8, sort: 'deadline' }),
  });

  const competitions = data?.data || [];

  if (isLoading) {
    return (
      <section className="bg-muted/20 py-12">
        <div className="container mx-auto px-4">
          <div className="h-7 w-48 bg-muted animate-pulse rounded mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <CompetitionCardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  if (competitions.length === 0) return null;

  return (
    <section className="bg-muted/20 py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">مباريات مفتوحة الآن</h2>
            <p className="text-sm text-muted-foreground">سارع بالتسجيل قبل انتهاء الآجال</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {competitions.map((competition) => (
            <Card
              key={competition.id}
              className="competition-card-accent competition-glow group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50"
              data-status={competition.status}
              onClick={() => {
                addViewed({
                  id: competition.id,
                  type: 'competition',
                  title: competition.title,
                  subtitle: competition.school?.name || competition.city?.name,
                });
                setSelectedCompetition(competition.id);
              }}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <StatusBadge status={competition.status} />
                  <FavoriteButton id={competition.id} type="competition" title={competition.title} size="sm" />
                </div>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{competition.title}</h3>
                {competition.school && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Building2 className="h-3 w-3 shrink-0 text-teal-500 dark:text-teal-400" />
                    <span className="line-clamp-1">{competition.school.name}</span>
                  </div>
                )}
                {competition.deadline && <CountdownTimer deadline={competition.deadline} size="sm" label="الوقت المتبقي" />}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
