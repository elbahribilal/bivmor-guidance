'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CompetitionTypeBadge } from '@/components/shared/CompetitionTypeBadge';
import { CountdownTimer } from '@/components/shared/CountdownTimer';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { competitionsApi } from '@/lib/api';
import { ExternalLink, MapPin, GraduationCap, Clock, FileText, ListChecks, Tag, Calendar, Building2, Share2, Globe, ChevronLeft, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { ReminderButton } from '@/components/reminders/ReminderButton';
import { ApplicationTrackerButton } from '@/components/applications/ApplicationTrackerButton';
import { ShareDialog } from '@/components/shared/ShareDialog';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function CompetitionDetailDialog() {
  const { selectedCompetitionId, setSelectedCompetition } = useNavigationStore();
  const { addViewed } = useRecentlyViewedStore();
  const [shareOpen, setShareOpen] = useState(false);

  const isOpen = selectedCompetitionId !== null;

  const { data, isLoading, error } = useQuery({
    queryKey: ['competition', selectedCompetitionId],
    queryFn: () => competitionsApi.get(selectedCompetitionId!),
    enabled: !!selectedCompetitionId,
    retry: 1,
  });

  const competition = data?.data || null;

  // Track recently viewed when competition loads
  useEffect(() => {
    if (competition && selectedCompetitionId) {
      addViewed({
        id: competition.id,
        type: 'competition',
        title: competition.title,
        subtitle: competition.school?.name || competition.city?.name,
      });
    }
  }, [competition, selectedCompetitionId, addViewed]);

  const handleClose = () => {
    setSelectedCompetition(null);
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  const handleSchoolClick = () => {
    if (competition?.school) {
      handleClose();
      const { setSelectedSchool } = useNavigationStore.getState();
      setSelectedSchool(competition.school!.id);
    }
  };

  const getDeadlineUrgency = () => {
    if (!competition?.deadline) return null;
    const now = new Date().getTime();
    const deadline = new Date(competition.deadline).getTime();
    const diff = deadline - now;
    if (diff < 0) return 'expired';
    if (diff < 3 * 24 * 60 * 60 * 1000) return 'urgent';
    if (diff < 7 * 24 * 60 * 60 * 1000) return 'warning';
    return 'normal';
  };

  // Calculate days remaining for closing soon banner
  const getDaysRemaining = () => {
    if (!competition?.deadline) return null;
    const now = new Date().getTime();
    const deadline = new Date(competition.deadline).getTime();
    const diff = deadline - now;
    if (diff <= 0) return null;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const isClosingSoon = getDeadlineUrgency() === 'warning' || getDeadlineUrgency() === 'urgent';
  const daysRemaining = getDaysRemaining();
  const isUrgent = getDeadlineUrgency() === 'urgent';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0" dir="rtl">
        <DialogDescription className="sr-only">تفاصيل المباراة</DialogDescription>
        <DialogTitle className="sr-only">{competition?.title || 'تفاصيل المباراة'}</DialogTitle>
        {isLoading ? (
          <div className="p-6 space-y-4">
            <div className="h-8 w-3/4 shimmer-loading rounded-lg" />
            <div className="h-4 w-1/2 shimmer-loading rounded" />
            <div className="h-32 shimmer-loading rounded-xl" />
          </div>
        ) : error ? (
          <div className="p-6 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
              <AlertCircle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">تعذر تحميل البيانات</h3>
              <p className="text-sm text-muted-foreground">حدث خطأ أثناء جلب تفاصيل المباراة</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose} className="gap-1.5">
              إغلاق
            </Button>
          </div>
        ) : competition ? (
          <>
            {/* Closing Soon Warning Banner */}
            {isClosingSoon && daysRemaining !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-gradient-to-l from-amber-500 via-amber-400 to-amber-500 text-amber-950 px-6 py-3 flex items-center gap-3"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 animate-pulse" />
                <span className="font-semibold text-sm">
                  ⚡ آخر أجل خلال {daysRemaining} {daysRemaining === 1 ? 'يوم' : daysRemaining <= 5 ? 'أيام' : 'يوم'}! سارع بالتسجيل
                </span>
              </motion.div>
            )}
            {/* Hero header with gradient */}
            <div className="relative overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 pb-5">
                {/* Background decorations with subtle pattern */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
                  <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 0L23 8L31 5L28 13L40 16L32 20L38 29L28 26L25 37L20 28L15 37L12 26L2 29L8 20L0 16L12 13L9 5L17 8Z'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px',
                  }} />
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <FavoriteButton
                      id={competition.id}
                      type="competition"
                      title={competition.title}
                      size="md"
                      variant="ghost"
                    />
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>

                {/* Title and badges */}
                <div className="relative z-10">
                  <h2 className="text-xl font-bold leading-snug mb-3 pl-16">
                    {competition.title}
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={competition.status} />
                    <CompetitionTypeBadge type={competition.type} />
                    {competition.isFeatured && (
                      <Badge className="bg-amber-500/20 text-amber-100 border-amber-400/30 text-xs backdrop-blur-sm">⭐ مميز</Badge>
                    )}
                    {competition.registrationOpen && competition.status === 'OPEN' && (
                      <Badge className="bg-green-500/20 text-green-100 border-green-400/30 text-xs backdrop-blur-sm">
                        <CheckCircle2 className="h-3 w-3 ml-1" />
                        التسجيل مفتوح
                      </Badge>
                    )}
                  </div>

                  {/* Countdown with urgency indicator */}
                  {competition.deadline && (
                    <motion.div
                      className={`mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 ${isUrgent ? 'urgent-countdown-pulse' : ''}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <CountdownTimer deadline={competition.deadline} size="lg" label="⏳ الوقت المتبقي للتسجيل" />
                      {isUrgent && (
                        <motion.div
                          className="flex items-center gap-1.5 mt-2 text-amber-200 text-xs"
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>آجل قريب! سارع بالتسجيل</span>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Quick info bar below gradient */}
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/30 px-6 py-3">
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  {competition.city && (
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{competition.city.name}</span>
                    </div>
                  )}
                  {competition.school && (
                    <button
                      onClick={handleSchoolClick}
                      className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors group"
                    >
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]">{competition.school.name}</span>
                      <ChevronLeft className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                  {competition.category && (
                    <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-400">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{competition.category.name}</span>
                    </div>
                  )}
                  {competition.level && (
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{competition.level.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content sections */}
            <div className="p-6 space-y-5">
              {/* Description */}
              {competition.shortDescription && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 text-emerald-600" />
                    نبذة
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-3">{competition.shortDescription}</p>
                </motion.div>
              )}

              {competition.fullDescription && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    الوصف الكامل
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{competition.fullDescription}</p>
                </div>
              )}

              <Separator />

              {/* Requirements, Documents, Stages in a styled grid */}
              <div className="grid gap-4">
                {competition.requirements && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/30">
                        <ListChecks className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      الشروط المطلوبة
                    </h3>
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-4 border border-emerald-200/30 dark:border-emerald-800/20">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{competition.requirements}</p>
                    </div>
                  </motion.div>
                )}

                {competition.documents && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-teal-100 dark:bg-teal-900/30">
                        <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      </div>
                      الوثائق المطلوبة
                    </h3>
                    <div className="bg-teal-50/50 dark:bg-teal-900/10 rounded-xl p-4 border border-teal-200/30 dark:border-teal-800/20">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{competition.documents}</p>
                    </div>
                  </motion.div>
                )}

                {competition.stages && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 dark:bg-amber-900/30">
                        <Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      </div>
                      المراحل
                    </h3>
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-4 border border-amber-200/30 dark:border-amber-800/20">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{competition.stages}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Tags */}
              {competition.tags && competition.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Tag className="h-4 w-4 text-violet-600" />
                      الوسوم
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      {competition.tags.map((ct) => (
                        <motion.div
                          key={ct.tagId}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <Badge variant="outline" className="text-xs hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors cursor-default">
                            {ct.tag.name}
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {competition.deadline && (
                  <motion.div
                    className="flex items-center gap-2.5 bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Calendar className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">آخر أجل</p>
                      <p className="font-medium">{new Date(competition.deadline).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </motion.div>
                )}
                {competition.startDate && (
                  <motion.div
                    className="flex items-center gap-2.5 bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <div>
                      <p className="text-[11px] text-muted-foreground">تاريخ البداية</p>
                      <p className="font-medium">{new Date(competition.startDate).toLocaleDateString('ar-MA', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Reminder + Application + Share Actions with micro-animations */}
              <div className="flex items-center gap-2 flex-wrap">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <ReminderButton
                    competitionId={competition.id}
                    competitionTitle={competition.title}
                    deadline={competition.deadline}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <ApplicationTrackerButton
                    competitionId={competition.id}
                    competitionTitle={competition.title}
                    schoolName={competition.school?.name}
                    deadline={competition.deadline}
                  />
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span className="text-xs">مشاركة</span>
                  </Button>
                </motion.div>
              </div>

              {/* Official link */}
              {competition.officialLink && (
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 gap-2 shadow-md shadow-emerald-600/20 transition-all duration-300"
                    onClick={() => window.open(competition.officialLink!, '_blank')}
                  >
                    <Globe className="h-4 w-4" />
                    الرابط الرسمي للتسجيل
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </motion.div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>

      {/* Share Dialog */}
      {competition && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          title={competition.title}
          description={competition.shortDescription || undefined}
          type="competition"
        />
      )}
    </Dialog>
  );
}
