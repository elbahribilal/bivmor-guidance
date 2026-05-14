'use client';

import { motion } from 'framer-motion';
import { Bell, BellRing, Calendar, Clock, Trash2, X, ArrowLeft, Plus } from 'lucide-react';
import { useRemindersStore } from '@/store/reminders';
import { useNavigationStore } from '@/store/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function RemindersView() {
  const { reminders, removeReminder, clearAll } = useRemindersStore();
  const { setView } = useNavigationStore();

  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
  );

  const now = new Date();

  const upcoming = sortedReminders.filter(r => new Date(r.reminderDate) > now);
  const past = sortedReminders.filter(r => new Date(r.reminderDate) <= now);

  const getTimeRemaining = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return 'انتهى';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `بعد ${days} يوم`;
    if (hours > 0) return `بعد ${hours} ساعة`;
    return 'قريباً جداً';
  };

  const getUrgencyColor = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return 'border-muted/50';
    if (diff < 24 * 60 * 60 * 1000) return 'border-red-300 dark:border-red-700';
    if (diff < 3 * 24 * 60 * 60 * 1000) return 'border-amber-300 dark:border-amber-700';
    return 'border-emerald-300 dark:border-emerald-700';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 shadow-lg shadow-emerald-600/20">
          <BellRing className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          <span className="gradient-text">التذكيرات</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          جميع التذكيرات التي أعددتها لمواعيد المباريات
        </p>
      </motion.div>

      {/* Stats bar */}
      {reminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between gap-4 mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/30"
        >
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">{upcoming.length}</p>
              <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">قادمة</p>
            </div>
            <div className="w-px h-8 bg-emerald-200 dark:bg-emerald-800" />
            <div className="text-center">
              <p className="text-lg font-bold text-muted-foreground">{past.length}</p>
              <p className="text-[10px] text-muted-foreground/70">منتهية</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView('competitions')}
              className="text-xs gap-1 text-emerald-600 dark:text-emerald-400"
            >
              <Plus className="h-3 w-3" />
              إضافة
            </Button>
            {reminders.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs gap-1 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-3 w-3" />
                مسح الكل
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {reminders.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-16"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mx-auto mb-5">
            <Bell className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">لا توجد تذكيرات بعد</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
            تصفح المباريات وأضف تذكيرات لمواعيد الآجال المهمة حتى لا تفوت أي فرصة
          </p>
          <Button
            onClick={() => setView('competitions')}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            تصفح المباريات
          </Button>
        </motion.div>
      )}

      {/* Upcoming Reminders */}
      {upcoming.length > 0 && (
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <BellRing className="h-4 w-4" />
            التذكيرات القادمة ({upcoming.length})
          </h3>
          {upcoming.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`p-4 border-r-4 ${getUrgencyColor(reminder.reminderDate)} hover:shadow-md transition-all duration-200`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{reminder.competitionTitle}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                        <Clock className="h-3 w-3" />
                        {getTimeRemaining(reminder.reminderDate)}
                      </span>
                      {reminder.deadline && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          الآجل: {new Date(reminder.deadline).toLocaleDateString('ar-MA')}
                        </span>
                      )}
                    </div>
                    {reminder.notes && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1 italic bg-muted/30 rounded px-2 py-1">
                        &ldquo;{reminder.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeReminder(reminder.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Past Reminders */}
      {past.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            التذكيرات المنتهية ({past.length})
          </h3>
          {past.map((reminder, index) => (
            <motion.div
              key={reminder.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.2 }}
            >
              <Card className="p-4 opacity-60 border border-muted/50">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1 line-through">{reminder.competitionTitle}</p>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      انتهى
                    </span>
                  </div>
                  <button
                    onClick={() => removeReminder(reminder.id)}
                    className="text-muted-foreground hover:text-red-500 transition-colors shrink-0 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
