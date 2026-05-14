'use client';

import { useState } from 'react';
import { Bell, BellRing, Calendar, Clock, Trash2, StickyNote, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useRemindersStore } from '@/store/reminders';
import { motion, AnimatePresence } from 'framer-motion';

interface ReminderButtonProps {
  competitionId: string;
  competitionTitle: string;
  deadline: string | null;
}

export function ReminderButton({ competitionId, competitionTitle, deadline }: ReminderButtonProps) {
  const { addReminder, removeByCompetitionId, isReminderSet } = useRemindersStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reminderDays, setReminderDays] = useState('3');
  const [notes, setNotes] = useState('');

  const hasReminder = isReminderSet(competitionId);

  const handleSetReminder = () => {
    const days = parseInt(reminderDays) || 3;
    let reminderDate: Date;

    if (deadline) {
      const deadlineDate = new Date(deadline);
      reminderDate = new Date(deadlineDate.getTime() - days * 24 * 60 * 60 * 1000);
      if (reminderDate < new Date()) {
        reminderDate = new Date(Date.now() + 1 * 60 * 60 * 1000);
      }
    } else {
      reminderDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    addReminder({
      competitionId,
      competitionTitle,
      deadline,
      reminderDate: reminderDate.toISOString(),
      notes,
    });

    setDialogOpen(false);
    setNotes('');
  };

  const handleRemoveReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeByCompetitionId(competitionId);
  };

  if (hasReminder) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
        onClick={handleRemoveReminder}
      >
        <BellRing className="h-3.5 w-3.5" />
        <span className="text-xs">تذكير مفعّل</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => setDialogOpen(true)}
      >
        <Bell className="h-3.5 w-3.5" />
        <span className="text-xs">إعداد تذكير</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} dir="rtl">
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                <Bell className="h-4 w-4" />
              </div>
              إعداد تذكير
            </DialogTitle>
            <DialogDescription className="sr-only">إعداد تذكير لموعد المباراة</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm font-medium line-clamp-2">{competitionTitle}</p>
              {deadline && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  آجل التسجيل: {new Date(deadline).toLocaleDateString('ar-MA')}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ذكّرني قبل
              </label>
              <div className="flex gap-2">
                {[
                  { label: 'ساعة', value: '0' },
                  { label: 'يوم', value: '1' },
                  { label: '3 أيام', value: '3' },
                  { label: 'أسبوع', value: '7' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setReminderDays(opt.value)}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      reminderDays === opt.value
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <StickyNote className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                ملاحظات (اختياري)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظة للتذكير..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSetReminder}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2"
              >
                <Bell className="h-4 w-4" />
                تفعيل التذكير
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Reminders list component for displaying in a view
export function RemindersList() {
  const { reminders, removeReminder, clearAll } = useRemindersStore();

  const sortedReminders = [...reminders].sort(
    (a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime()
  );

  const getTimeRemaining = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return 'انتهى';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `بعد ${days} يوم`;
    if (hours > 0) return `بعد ${hours} ساعة`;
    return 'قريباً';
  };

  if (sortedReminders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
          <Bell className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">لا توجد تذكيرات</h3>
        <p className="text-sm text-muted-foreground">
          قم بإعداد تذكيرات لمواعيد المباريات حتى لا تفوت أي آجل مهم
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <BellRing className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          التذكيرات ({sortedReminders.length})
        </h3>
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          مسح الكل
        </button>
      </div>
      <AnimatePresence>
        {sortedReminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors bg-card"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{reminder.competitionTitle}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeRemaining(reminder.reminderDate)}
                </span>
                {reminder.deadline && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    الآجل: {new Date(reminder.deadline).toLocaleDateString('ar-MA')}
                  </span>
                )}
              </div>
              {reminder.notes && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">&ldquo;{reminder.notes}&rdquo;</p>
              )}
            </div>
            <button
              onClick={() => removeReminder(reminder.id)}
              className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
