'use client';

import { useQuery } from '@tanstack/react-query';
import { useNavigationStore } from '@/store/navigation';
import { useRecentlyViewedStore } from '@/store/recently-viewed';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SchoolTypeBadge, StatusBadge } from '@/components/shared/StatusBadge';
import { FavoriteButton } from '@/components/shared/FavoriteButton';
import { schoolsApi } from '@/lib/api';
import { ExternalLink, MapPin, Globe, Mail, Phone, Trophy, Calendar, Share2, Info, ChevronLeft, Clock, AlertCircle } from 'lucide-react';
import { ShareDialog } from '@/components/shared/ShareDialog';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Type-specific gradient colors
const schoolTypeGradients: Record<string, { from: string; via: string; to: string; light: string; border: string; icon: string }> = {
  PUBLIC: {
    from: 'from-emerald-600',
    via: 'via-emerald-700',
    to: 'to-emerald-800',
    light: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-100 dark:border-emerald-800/30',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  PRIVATE: {
    from: 'from-amber-600',
    via: 'via-amber-700',
    to: 'to-amber-800',
    light: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-100 dark:border-amber-800/30',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  SEMI_PRIVATE: {
    from: 'from-teal-600',
    via: 'via-teal-700',
    to: 'to-teal-800',
    light: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-100 dark:border-teal-800/30',
    icon: 'text-teal-600 dark:text-teal-400',
  },
};

const defaultGradient = schoolTypeGradients.PUBLIC;

export function SchoolDetailDialog() {
  const { selectedSchoolId, setSelectedSchool, setSelectedCompetition } = useNavigationStore();
  const { addViewed } = useRecentlyViewedStore();
  const [shareOpen, setShareOpen] = useState(false);
  const isOpen = selectedSchoolId !== null;

  const { data, isLoading, error } = useQuery({
    queryKey: ['school', selectedSchoolId],
    queryFn: () => schoolsApi.get(selectedSchoolId!),
    enabled: !!selectedSchoolId,
    retry: 1,
  });

  const school = data?.data || null;

  // Track recently viewed when school loads
  useEffect(() => {
    if (school && selectedSchoolId) {
      addViewed({
        id: school.id,
        type: 'school',
        title: school.name,
        subtitle: school.city?.name,
      });
    }
  }, [school, selectedSchoolId, addViewed]);

  const handleClose = () => {
    setSelectedSchool(null);
  };

  const handleCompetitionClick = (competitionId: string) => {
    handleClose();
    setSelectedCompetition(competitionId);
  };

  const handleShare = () => {
    setShareOpen(true);
  };

  const initials = school?.name
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  const openCompetitionsCount = school?.competitions?.filter(c => c.status === 'OPEN').length || 0;

  // Get type-specific gradient
  const gradient = school ? (schoolTypeGradients[school.type] || defaultGradient) : defaultGradient;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0" dir="rtl">
        <DialogDescription className="sr-only">تفاصيل المؤسسة</DialogDescription>
        <DialogTitle className="sr-only">{school?.name || 'تفاصيل المؤسسة'}</DialogTitle>
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
              <p className="text-sm text-muted-foreground">حدث خطأ أثناء جلب تفاصيل المؤسسة</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleClose} className="gap-1.5">
              إغلاق
            </Button>
          </div>
        ) : school ? (
          <>
            {/* Hero header with type-specific gradient */}
            <div className="relative overflow-hidden">
              <div className={`bg-gradient-to-br ${gradient.from} ${gradient.via} ${gradient.to} text-white p-6 pb-5`}>
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
                  <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5 blur-2xl" />
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
                  }} />

                  {/* Decorative corner elements */}
                  <svg className="absolute top-0 right-0 w-24 h-24 text-white/[0.06]" viewBox="0 0 100 100">
                    <path d="M0 0 L100 0 L100 30 Q50 0 30 50 Q0 70 0 100 Z" fill="currentColor" />
                  </svg>
                  <svg className="absolute bottom-0 left-0 w-24 h-24 text-white/[0.06]" viewBox="0 0 100 100">
                    <path d="M100 100 L0 100 L0 70 Q50 100 70 50 Q100 30 100 0 Z" fill="currentColor" />
                  </svg>
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 left-4 flex items-center gap-1.5 z-10">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <FavoriteButton
                      id={school.id}
                      type="school"
                      title={school.name}
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

                {/* School info */}
                <div className="flex items-center gap-4 relative z-10">
                  <motion.div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white font-bold text-xl shadow-lg border border-white/10"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {school.logo ? <img src={school.logo} alt={school.name} className="h-16 w-16 rounded-2xl object-cover" /> : initials}
                  </motion.div>
                  <div className="flex-1 min-w-0 pl-12">
                    <h2 className="text-xl font-bold leading-snug mb-1">{school.name}</h2>
                    {school.shortDescription && <p className="text-sm text-white/80 line-clamp-2">{school.shortDescription}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <SchoolTypeBadge type={school.type} />
                      {school.city && (
                        <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                          <MapPin className="h-3 w-3 ml-1" /> {school.city.name}
                        </Badge>
                      )}
                      {school.isFeatured && (
                        <Badge className="bg-amber-500/20 text-amber-100 border-amber-400/30 text-xs backdrop-blur-sm">⭐ مميز</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick info bar below gradient with type-specific colors */}
              <div className={`${gradient.light} border-b ${gradient.border} px-6 py-3`}>
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  {school.category && (
                    <div className={`flex items-center gap-1.5 ${gradient.icon}`}>
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{school.category.name}</span>
                    </div>
                  )}
                  {school.level && (
                    <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{school.level.name}</span>
                    </div>
                  )}
                  {school._count?.competitions !== undefined && (
                    <div className={`flex items-center gap-1.5 ${gradient.icon}`}>
                      <Trophy className="h-3.5 w-3.5" />
                      <span>{school._count.competitions} مباراة</span>
                    </div>
                  )}
                  {openCompetitionsCount > 0 && (
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{openCompetitionsCount} مباراة مفتوحة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content sections */}
            <div className="p-6 space-y-5">
              {school.fullDescription && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Info className={`h-4 w-4 ${gradient.icon}`} />
                    عن المؤسسة
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-3">{school.fullDescription}</p>
                </motion.div>
              )}

              {/* Contact info with hover effects */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <div className={`flex h-5 w-5 items-center justify-center rounded ${gradient.light}`}>
                    <Phone className={`h-3.5 w-3.5 ${gradient.icon}`} />
                  </div>
                  معلومات الاتصال
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {school.website && (
                    <motion.div
                      className="flex items-center gap-2.5 text-sm bg-muted/30 rounded-lg p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800/30 border border-transparent transition-all duration-200 cursor-pointer group"
                      whileHover={{ scale: 1.02, x: -2 }}
                      onClick={() => window.open(school.website!, '_blank')}
                    >
                      <Globe className={`h-4 w-4 ${gradient.icon} shrink-0 group-hover:scale-110 transition-transform`} />
                      <a href={school.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 hover:underline truncate">
                        {school.website.replace(/^https?:\/\//, '')}
                      </a>
                    </motion.div>
                  )}
                  {school.email && (
                    <motion.div
                      className="flex items-center gap-2.5 text-sm bg-muted/30 rounded-lg p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800/30 border border-transparent transition-all duration-200 group"
                      whileHover={{ scale: 1.02, x: -2 }}
                    >
                      <Mail className={`h-4 w-4 ${gradient.icon} shrink-0 group-hover:scale-110 transition-transform`} />
                      <a href={`mailto:${school.email}`} className="text-emerald-600 dark:text-emerald-400 hover:underline truncate">{school.email}</a>
                    </motion.div>
                  )}
                  {school.phone && (
                    <motion.div
                      className="flex items-center gap-2.5 text-sm bg-muted/30 rounded-lg p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800/30 border border-transparent transition-all duration-200 group"
                      whileHover={{ scale: 1.02, x: -2 }}
                    >
                      <Phone className={`h-4 w-4 ${gradient.icon} shrink-0 group-hover:scale-110 transition-transform`} />
                      <span dir="ltr">{school.phone}</span>
                    </motion.div>
                  )}
                  {school.address && (
                    <motion.div
                      className="flex items-center gap-2.5 text-sm bg-muted/30 rounded-lg p-3 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800/30 border border-transparent transition-all duration-200 group"
                      whileHover={{ scale: 1.02, x: -2 }}
                    >
                      <MapPin className={`h-4 w-4 ${gradient.icon} shrink-0 group-hover:scale-110 transition-transform`} />
                      <span>{school.address}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Related competitions */}
              {school.competitions && school.competitions.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 dark:bg-emerald-900/30">
                        <Trophy className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      المباريات المرتبطة ({school.competitions.length})
                    </h3>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {school.competitions.map((comp, i) => (
                        <motion.div
                          key={comp.id}
                          onClick={() => handleCompetitionClick(comp.id)}
                          className="flex items-center justify-between gap-3 rounded-xl border p-3 cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 hover:border-emerald-200 dark:hover:border-emerald-800/30 transition-all duration-200 group"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          whileHover={{ scale: 1.01, x: -2 }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{comp.title}</p>
                            {comp.deadline && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                <Calendar className="h-3 w-3 inline ml-1" />
                                آخر أجل: {new Date(comp.deadline).toLocaleDateString('ar-MA')}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={comp.status} />
                            <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Official website button */}
              {school.website && (
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className={`w-full bg-gradient-to-r ${gradient.from} ${gradient.to} hover:opacity-90 gap-2 shadow-md transition-all duration-300`}
                    onClick={() => window.open(school.website!, '_blank')}
                  >
                    <Globe className="h-4 w-4" />
                    زيارة الموقع الرسمي
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </Button>
                </motion.div>
              )}
            </div>
          </>
        ) : null}
      </DialogContent>

      {/* Share Dialog */}
      {school && (
        <ShareDialog
          open={shareOpen}
          onOpenChange={setShareOpen}
          title={school.name}
          description={school.shortDescription || undefined}
          type="school"
        />
      )}
    </Dialog>
  );
}
