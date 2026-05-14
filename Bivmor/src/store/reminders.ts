import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Reminder {
  id: string;
  competitionId: string;
  competitionTitle: string;
  deadline: string | null;
  reminderDate: string; // when to remind
  notes: string;
  createdAt: string;
}

interface RemindersState {
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  removeReminder: (id: string) => void;
  removeByCompetitionId: (competitionId: string) => void;
  clearAll: () => void;
  getRemindersForCompetition: (competitionId: string) => Reminder[];
  isReminderSet: (competitionId: string) => boolean;
  getUpcomingReminders: () => Reminder[];
}

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (reminder) =>
        set((state) => ({
          reminders: [
            ...state.reminders,
            {
              ...reminder,
              id: `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeReminder: (id) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.id !== id),
        })),

      removeByCompetitionId: (competitionId) =>
        set((state) => ({
          reminders: state.reminders.filter((r) => r.competitionId !== competitionId),
        })),

      clearAll: () => set({ reminders: [] }),

      getRemindersForCompetition: (competitionId) =>
        get().reminders.filter((r) => r.competitionId === competitionId),

      isReminderSet: (competitionId) =>
        get().reminders.some((r) => r.competitionId === competitionId),

      getUpcomingReminders: () => {
        const now = new Date();
        return get().reminders
          .filter((r) => new Date(r.reminderDate) > now)
          .sort((a, b) => new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime());
      },
    }),
    {
      name: 'mbarayat-reminders',
    }
  )
);
