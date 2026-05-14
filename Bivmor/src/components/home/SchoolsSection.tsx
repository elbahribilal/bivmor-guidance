'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SchoolTypeBadge } from '@/components/shared/StatusBadge';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { SchoolCardSkeleton } from '@/components/shared/LoadingSkeleton';
import { schoolsApi } from '@/lib/api';
import { GraduationCap, ArrowLeft, MapPin, Trophy, Eye, ExternalLink } from 'lucide-react';
import type { School, SchoolType } from '@/types';

const schoolRingColors: Record<SchoolType, string> = {
  PUBLIC: 'ring-emerald-500/50 dark:ring-emerald-400/40',
  PRIVATE: 'ring-amber-500/50 dark:ring-amber-400/40',
  SEMI_PRIVATE: 'ring-teal-500/50 dark:ring-teal-400/40',
};

const schoolBorderColors: Record<SchoolType, string> = {
  PUBLIC: 'border-emerald-300 dark:border-emerald-700/50',
  PRIVATE: 'border-amber-300 dark:border-amber-700/50',
  SEMI_PRIVATE: 'border-teal-300 dark:border-teal-700/50',
};

const schoolGradientColors: Record<SchoolType, string> = {
  PUBLIC: 'from-emerald-500 to-teal-600',
  PRIVATE: 'from-amber-500 to-orange-600',
  SEMI_PRIVATE: 'from-teal-500 to-cyan-600',
};

export function FeaturedSchools() {
  const { setView, setSelectedSchool } = useNavigationStore();
  const { data, isLoading } = useQuery({
    queryKey: ['schools-featured'],
    queryFn: () => schoolsApi.list({ isFeatured: true, limit: 6 }),
  });

  const schools = data?.data || [];

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 w-40 bg-muted animate-pulse rounded" />
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <SchoolCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (schools.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
            <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">مدارس مميزة</h2>
            <p className="text-sm text-muted-foreground">أبرز المؤسسات التعليمية</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setView('schools')} className="gap-1.5 text-teal-600 dark:text-teal-400 hover:text-teal-700">
          عرض الكل <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school) => (
          <SchoolCard key={school.id} school={school} onSelect={() => setSelectedSchool(school.id)} />
        ))}
      </div>
    </section>
  );
}

export function SchoolCard({ school, onSelect }: { school: School; onSelect: () => void }) {
  const { addViewed } = useRecentlyViewedStore();
  const initials = school.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const ringColor = schoolRingColors[school.type];
  const borderColor = schoolBorderColors[school.type];
  const gradientColor = schoolGradientColors[school.type];

  const handleClick = () => {
    addViewed({
      id: school.id,
      type: 'school',
      title: school.name,
      subtitle: school.city?.name,
    });
    onSelect();
  };

  return (
    <Card
      className={`group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-2 ${borderColor} ring-1 ${ringColor}`}
      onClick={handleClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradientColor} text-white font-bold text-sm ring-2 ${ringColor} shadow-md`}>
            {school.logo ? <img src={school.logo} alt={school.name} className="h-12 w-12 rounded-xl object-cover" /> : initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{school.name}</h3>
              <FavoriteButton id={school.id} type="school" title={school.name} size="sm" />
            </div>
            {school.shortDescription && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{school.shortDescription}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {school.city && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
              <MapPin className="h-3 w-3" /> {school.city.name}
            </span>
          )}
          <SchoolTypeBadge type={school.type} />
          {school._count?.competitions !== undefined && school._count.competitions > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md font-medium">
              <Trophy className="h-3 w-3" /> {school._count.competitions} مباراة
            </span>
          )}
        </div>
        {/* Hover overlay with "عرض المباريات" */}
        <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 pt-1 border-t border-transparent group-hover:border-border/30">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-600 dark:text-teal-400">
            <Eye className="h-3.5 w-3.5" />
            عرض المباريات
          </span>
          {school.website && (
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
