'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Calendar, Clock, X, ArrowLeft, Trash2, ChevronDown, SearchX } from 'lucide-react';
import { useApplicationsStore, applicationStatusLabel, applicationStatusColor, applicationStatusEmoji, type ApplicationStatus } from '@/store/applications';
import { useNavigationStore } from '@/store/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const statusOrder: ApplicationStatus[] = ['preparing', 'applied', 'under_review', 'accepted', 'rejected', 'not_started'];

const statusGroupLabels: Record<ApplicationStatus, string> = {
  preparing: 'قيد التحضير',
  applied: 'تم التقديم',
  under_review: 'قيد المراجعة',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  not_started: 'لم أبدأ',
};

const pipelineStages: ApplicationStatus[] = ['preparing', 'applied', 'under_review', 'accepted'];

const statusGradientBorder: Record<ApplicationStatus, string> = {
  not_started: '#9ca3af',
  preparing: '#f59e0b',
  applied: '#3b82f6',
  under_review: '#8b5cf6',
  accepted: '#10b981',
  rejected: '#ef4444',
};

export function ApplicationsView() {
  const { applications, updateStatus, remove, clearAll, getCounts } = useApplicationsStore();
  const { setView } = useNavigationStore();
  const counts = getCounts();

  const now = new Date();

  const getTimeRemaining = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return 'انتهى الآجل';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `باقي ${days} يوم`;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (hours > 0) return `باقي ${hours} ساعة`;
    return 'قريباً';
  };

  const totalApps = applications.length;

  if (totalApps === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="empty-state-illustration mb-6">
            <ClipboardList className="absolute inset-0 m-auto h-14 w-14 text-muted-foreground/40 z-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            <span className="gradient-text">تتبع الترشيحات</span>
          </h2>
          <h3 className="text-lg font-semibold mb-2">لا توجد ترشيحات بعد</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            تتبع حالة ترشيحاتك للمباريات من التحضير حتى القبول
          </p>
          <Button
            onClick={() => setView('competitions')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2 shadow-lg shadow-emerald-600/20"
          >
            <ArrowLeft className="h-4 w-4" />
            تصفح المباريات
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header with gradient and decorative elements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 shadow-lg shadow-emerald-600/20 moroccan-corner">
          <ClipboardList className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">
          <span className="gradient-text">تتبع الترشيحات</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          تتبع حالة ترشيحاتك للمباريات من التحضير حتى القبول
        </p>
      </motion.div>

      {/* Pipeline Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="pipeline-stage mb-8 px-4"
      >
        {pipelineStages.map((stage, index) => {
          const stageCount = counts[stage];
          const isCompleted = stageCount > 0;
          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`pipeline-stage-dot ${isCompleted ? 'completed' : ''}`} />
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{applicationStatusLabel[stage]}</span>
              </div>
              {index < pipelineStages.length - 1 && (
                <div className={`pipeline-stage-line ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Stats bar with glassmorphism */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6"
      >
        {statusOrder.map((status) => (
          <div
            key={status}
            className={`glass-card-premium p-2.5 rounded-xl text-center ${applicationStatusColor[status]} transition-all`}
          >
            <p className="text-lg font-bold">{counts[status]}</p>
            <p className="text-[10px] font-medium mt-0.5">{applicationStatusLabel[status]}</p>
          </div>
        ))}
      </motion.div>

      {/* Clear all */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{totalApps} ترشيح</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-xs gap-1 text-red-500 hover:text-red-600"
        >
          <Trash2 className="h-3 w-3" />
          مسح الكل
        </Button>
      </div>

      {/* Grouped by status */}
      {statusOrder.map((status) => {
        const group = applications.filter((a) => a.status === status);
        if (group.length === 0) return null;

        return (
          <div key={status} className="mb-6">
            <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 px-1 ${applicationStatusColor[status].split(' ')[1] || 'text-foreground'}`}>
              <span>{applicationStatusEmoji[status]}</span>
              {statusGroupLabels[status]} ({group.length})
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {group.map((app, index) => {
                  const timeRemaining = getTimeRemaining(app.deadline);
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.04 }}
                    >
                      <Card className={`status-gradient-${app.status} p-4 hover:shadow-md transition-all duration-200 border-r-4`} style={{
                        borderRightColor: statusGradientBorder[app.status]
                      }}>
                        <div className="flex items-start gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${applicationStatusColor[app.status]}`}>
                            <ClipboardList className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-1">{app.competitionTitle}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${applicationStatusColor[app.status]}`}>
                                {applicationStatusEmoji[app.status]} {applicationStatusLabel[app.status]}
                              </span>
                              {timeRemaining && (
                                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {timeRemaining}
                                </span>
                              )}
                              {app.schoolName && (
                                <span className="text-xs text-muted-foreground">{app.schoolName}</span>
                              )}
                            </div>
                            {app.notes && (
                              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 italic bg-muted/30 rounded px-2 py-1">
                                &ldquo;{app.notes}&rdquo;
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {/* Quick status change buttons */}
                            {statusOrder.filter(s => s !== app.status).slice(0, 3).map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(app.id, s)}
                                className={`p-1.5 rounded-md text-[10px] transition-all hover:scale-110 ${applicationStatusColor[s]}`}
                                title={applicationStatusLabel[s]}
                              >
                                {applicationStatusEmoji[s]}
                              </button>
                            ))}
                            <button
                              onClick={() => remove(app.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
