'use client';

import { useState } from 'react';
import { ClipboardList, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useApplicationsStore, applicationStatusLabel, applicationStatusColor, type ApplicationStatus } from '@/store/applications';

interface ApplicationTrackerButtonProps {
  competitionId: string;
  competitionTitle: string;
  schoolName?: string;
  deadline: string | null;
}

const statusOptions: ApplicationStatus[] = ['not_started', 'preparing', 'applied', 'under_review', 'accepted', 'rejected'];

export function ApplicationTrackerButton({ competitionId, competitionTitle, schoolName, deadline }: ApplicationTrackerButtonProps) {
  const { addOrUpdate, getByCompetitionId } = useApplicationsStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('not_started');
  const [notes, setNotes] = useState('');

  const existing = getByCompetitionId(competitionId);

  const handleOpen = () => {
    if (existing) {
      setSelectedStatus(existing.status);
      setNotes(existing.notes);
    } else {
      setSelectedStatus('not_started');
      setNotes('');
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    addOrUpdate({
      competitionId,
      competitionTitle,
      schoolName,
      deadline,
      status: selectedStatus,
      notes,
      appliedDate: selectedStatus === 'applied' && !existing?.appliedDate 
        ? new Date().toISOString() 
        : existing?.appliedDate || null,
    });
    setDialogOpen(false);
  };

  if (existing && existing.status !== 'not_started') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`gap-1.5 ${applicationStatusColor[existing.status]}`}
        onClick={handleOpen}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        <span className="text-xs">{applicationStatusLabel[existing.status]}</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleOpen}
      >
        <ClipboardList className="h-3.5 w-3.5" />
        <span className="text-xs">تتبع الترشيح</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} dir="rtl">
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-right">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <ClipboardList className="h-4 w-4" />
              </div>
              تتبع حالة الترشيح
            </DialogTitle>
            <DialogDescription className="sr-only">تتبع حالة ترشيحك للمباراة</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm font-medium line-clamp-2">{competitionTitle}</p>
              {schoolName && (
                <p className="text-xs text-muted-foreground mt-1">{schoolName}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">حالة الترشيح</label>
              <div className="grid grid-cols-3 gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      selectedStatus === status
                        ? applicationStatusColor[status] + ' ring-2 ring-emerald-500/30 shadow-sm'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {applicationStatusLabel[status]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ملاحظات</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظاتك حول الترشيح..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 gap-2"
              >
                <ClipboardList className="h-4 w-4" />
                حفظ الحالة
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
