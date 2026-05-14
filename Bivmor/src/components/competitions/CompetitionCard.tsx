'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Building2, Tag, Pin, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CountdownTimer from '@/components/shared/CountdownTimer';
import StatusBadge from '@/components/shared/StatusBadge';
import { CompetitionTypeBadge } from '@/components/shared/CompetitionTypeBadge';
import { QuickViewTooltip, CompetitionQuickView } from '@/components/shared/QuickViewTooltip';
import { useNavigationStore } from '@/store/navigation';
import type { CompetitionWithRelations, CompetitionType } from '@/types';

// Type icon mapping for colored circle next to title
const typeIconConfig: Record<string, { icon: string; bgClass: string }> = {
  RECRUITMENT: { icon: '💼', bgClass: 'bg-blue-100 dark:bg-blue-900/30' },
  ACADEMIC: { icon: '🎓', bgClass: 'bg-emerald-100 dark:bg-emerald-900/30' },
  SCHOLARSHIP: { icon: '💰', bgClass: 'bg-amber-100 dark:bg-amber-900/30' },
  CONTINUING_EDUCATION: { icon: '📚', bgClass: 'bg-violet-100 dark:bg-violet-900/30' },
  ADMISSION: { icon: '🚪', bgClass: 'bg-teal-100 dark:bg-teal-900/30' },
};

// Status-based shadow for badge
const statusGlowClass: Record<string, string> = {
  OPEN: 'badge-glow',
  UPCOMING: 'badge-glow-amber',
  CLOSED: 'badge-glow-red',
  EXPIRED: '',
};

interface CompetitionCardProps {
  competition: CompetitionWithRelations;
  compact?: boolean;
}

export default function CompetitionCard({ competition, compact = false }: CompetitionCardProps) {
  const { navigateToCompetition } = useNavigationStore();

  const typeIcon = typeIconConfig[competition.type] || typeIconConfig.ACADEMIC;

  // Generate a pseudo-random "views" number based on competition id for visual variety
  const views = useMemo(() => {
    const hash = competition.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ((hash % 900) + 100); // Range: 100-999
  }, [competition.id]);

  // Check if deadline is urgent (within 3 days)
  const isUrgentDeadline = useMemo(() => {
    if (!competition.deadline) return false;
    const deadline = new Date(competition.deadline);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 3;
  }, [competition.deadline]);

  // Check if deadline is closing soon (within 7 days)
  const isClosingSoon = useMemo(() => {
    if (!competition.deadline || competition.status !== 'OPEN') return false;
    const deadline = new Date(competition.deadline);
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  }, [competition.deadline, competition.status]);

  return (
    <QuickViewTooltip
      content={<CompetitionQuickView competition={competition} />}
    >
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`h-full cursor-pointer card-shimmer-hover card-border-glow transition-all duration-300 overflow-hidden group relative ${competition.isFeatured ? 'featured-ribbon' : ''} ${isClosingSoon ? 'ring-2 ring-amber-400/60 dark:ring-amber-500/50 closing-soon-ring' : ''}`}
        onClick={() => navigateToCompetition(competition.id)}
      >
        {/* Gradient overlay at top based on competition type */}
        <div
          className="competition-gradient-overlay group-hover:opacity-100"
          data-type={competition.type}
        />

        {/* Featured/Pinned indicator */}
        {(competition.isFeatured || competition.isPinned) && (
          <div className="bg-gradient-to-l from-emerald-500 to-teal-500 px-3 py-1 relative z-10">
            <div className="flex items-center gap-1.5 text-white text-xs font-medium">
              {competition.isPinned && <Pin className="h-3 w-3" />}
              {competition.isPinned ? 'مثبت' : 'مميز'}
            </div>
          </div>
        )}

        <CardContent className={`relative z-10 ${compact ? 'p-3' : 'p-4'}`}>
          {/* Status, Type and Category */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              {/* Status Indicator Dot */}
              <span className="relative flex h-2.5 w-2.5">
                {competition.status === 'OPEN' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  competition.status === 'OPEN' ? 'bg-emerald-500' :
                  competition.status === 'CLOSED' ? 'bg-gray-400 dark:bg-gray-500' :
                  competition.status === 'EXPIRED' ? 'bg-red-500' :
                  competition.status === 'UPCOMING' ? 'bg-amber-500' : 'bg-gray-400'
                }`} />
              </span>
              <span className={statusGlowClass[competition.status] || ''}>
                <StatusBadge status={competition.status} closingSoon={isClosingSoon} />
              </span>
              <CompetitionTypeBadge type={competition.type} />
            </div>
            {competition.category && (
              <Badge variant="secondary" className="text-xs">
                {competition.category.name}
              </Badge>
            )}
          </div>

          {/* Title with type icon */}
          <div className="flex items-start gap-2 mb-2">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${typeIcon.bgClass}`}>
              {typeIcon.icon}
            </span>
            <h3 className={`font-bold line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
              {competition.title}
            </h3>
          </div>

          {/* Description */}
          {!compact && competition.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {competition.shortDescription}
            </p>
          )}

          {/* School */}
          {competition.school && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{competition.school.name}</span>
            </div>
          )}

          {/* City */}
          {competition.city && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{competition.city.nameAr || competition.city.name}</span>
            </div>
          )}

          {/* Deadline Countdown with urgent pulse */}
          {competition.deadline && (
            <div className={`flex items-center gap-1.5 mt-3 ${isUrgentDeadline ? 'urgent-deadline-pulse' : ''}`}>
              <Clock className={`h-3.5 w-3.5 flex-shrink-0 ${isUrgentDeadline ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`} />
              <CountdownTimer
                deadline={competition.deadline}
                compact={compact}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="relative z-10 p-4 pt-0 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            onClick={(e) => {
              e.stopPropagation();
              navigateToCompetition(competition.id);
            }}
          >
            التفاصيل
          </Button>

          {/* Views / Popularity indicator */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span>{views}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
    </QuickViewTooltip>
  );
}
