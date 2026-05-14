'use client';

import { motion } from 'framer-motion';
import { MapPin, Building2, Trophy, Tag, Users } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigationStore } from '@/store/navigation';
import { QuickViewTooltip, SchoolQuickView } from '@/components/shared/QuickViewTooltip';
import type { SchoolWithRelations, SchoolType } from '@/types';

const typeLabels: Record<string, { label: string; className: string; icon: string; accentClass: string; avatarRingClass: string; gradientFrom: string; gradientTo: string }> = {
  PUBLIC: {
    label: 'عمومي',
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: '🏛️',
    accentClass: 'school-accent-bar',
    avatarRingClass: 'gradient-avatar-ring',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-600',
  },
  PRIVATE: {
    label: 'خصوصي',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: '🏢',
    accentClass: 'school-accent-bar',
    avatarRingClass: 'gradient-avatar-ring-amber',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-600',
  },
  SEMI_PRIVATE: {
    label: 'شبه عمومي',
    className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    icon: '🏫',
    accentClass: 'school-accent-bar',
    avatarRingClass: 'gradient-avatar-ring-teal',
    gradientFrom: 'from-teal-500',
    gradientTo: 'to-cyan-600',
  },
};

interface SchoolCardProps {
  school: SchoolWithRelations;
}

export default function SchoolCard({ school }: SchoolCardProps) {
  const { navigateToSchool } = useNavigationStore();
  const typeInfo = typeLabels[school.type] || typeLabels.PUBLIC;

  return (
    <QuickViewTooltip
      content={<SchoolQuickView school={school} />}
    >
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`h-full cursor-pointer card-shimmer-hover card-border-glow transition-all duration-300 overflow-hidden group ${typeInfo.accentClass}`}
        data-type={school.type}
        onClick={() => navigateToSchool(school.id)}
      >
        <CardContent className="p-4">
          {/* Logo with gradient border ring and Type badge */}
          <div className="flex items-start justify-between mb-3">
            <div className={typeInfo.avatarRingClass}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-bl ${typeInfo.gradientFrom} ${typeInfo.gradientTo} text-white font-bold text-lg`}>
                {school.name.charAt(0)}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Competitions available counter badge */}
              {school._count && school._count.competitions > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-medium bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                  <Trophy className="h-2.5 w-2.5" />
                  {school._count.competitions}
                </span>
              )}
              <Badge className={`${typeInfo.className} flex items-center gap-1`}>
                <span className="text-xs">{typeInfo.icon}</span>
                {typeInfo.label}
              </Badge>
            </div>
          </div>

          {/* Name */}
          <h3 className="font-bold mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
            {school.name}
          </h3>

          {/* Description */}
          {school.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {school.shortDescription}
            </p>
          )}

          {/* City */}
          {school.city && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{school.city.nameAr || school.city.name}</span>
            </div>
          )}

          {/* Category */}
          {school.category && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1.5">
              <Tag className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{school.category.name}</span>
            </div>
          )}

          {/* Competition count */}
          {school.competitionCount !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{school.competitionCount} مباراة متاحة</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            onClick={(e) => {
              e.stopPropagation();
              navigateToSchool(school.id);
            }}
          >
            التفاصيل
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
    </QuickViewTooltip>
  );
}
