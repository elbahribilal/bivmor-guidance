import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApplicationStatus = 'not_started' | 'preparing' | 'applied' | 'under_review' | 'accepted' | 'rejected';

export interface ApplicationEntry {
  id: string;
  competitionId: string;
  competitionTitle: string;
  schoolName?: string;
  deadline: string | null;
  status: ApplicationStatus;
  notes: string;
  appliedDate: string | null;
  updatedAt: string;
}

interface ApplicationsState {
  applications: ApplicationEntry[];
  addOrUpdate: (entry: Omit<ApplicationEntry, 'id' | 'updatedAt'>) => void;
  remove: (id: string) => void;
  removeByCompetitionId: (competitionId: string) => void;
  updateStatus: (id: string, status: ApplicationStatus) => void;
  clearAll: () => void;
  getByCompetitionId: (competitionId: string) => ApplicationEntry | undefined;
  getByStatus: (status: ApplicationStatus) => ApplicationEntry[];
  getCounts: () => Record<ApplicationStatus, number>;
}

const statusEmoji: Record<ApplicationStatus, string> = {
  not_started: '📋',
  preparing: '📝',
  applied: '📤',
  under_review: '🔍',
  accepted: '✅',
  rejected: '❌',
};

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  not_started: 'لم أبدأ',
  preparing: 'أحضّر',
  applied: 'قدّمت',
  under_review: 'قيد المراجعة',
  accepted: 'مقبول',
  rejected: 'مرفوض',
};

export const applicationStatusColor: Record<ApplicationStatus, string> = {
  not_started: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  preparing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  applied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  under_review: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const applicationStatusEmoji = statusEmoji;

export const useApplicationsStore = create<ApplicationsState>()(
  persist(
    (set, get) => ({
      applications: [],

      addOrUpdate: (entry) =>
        set((state) => {
          const existing = state.applications.find(
            (a) => a.competitionId === entry.competitionId
          );
          if (existing) {
            return {
              applications: state.applications.map((a) =>
                a.competitionId === entry.competitionId
                  ? { ...a, ...entry, updatedAt: new Date().toISOString() }
                  : a
              ),
            };
          }
          return {
            applications: [
              ...state.applications,
              {
                ...entry,
                id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                updatedAt: new Date().toISOString(),
              },
            ],
          };
        }),

      remove: (id) =>
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        })),

      removeByCompetitionId: (competitionId) =>
        set((state) => ({
          applications: state.applications.filter(
            (a) => a.competitionId !== competitionId
          ),
        })),

      updateStatus: (id, status) =>
        set((state) => ({
          applications: state.applications.map((a) =>
            a.id === id
              ? { ...a, status, updatedAt: new Date().toISOString() }
              : a
          ),
        })),

      clearAll: () => set({ applications: [] }),

      getByCompetitionId: (competitionId) =>
        get().applications.find((a) => a.competitionId === competitionId),

      getByStatus: (status) =>
        get().applications.filter((a) => a.status === status),

      getCounts: () => {
        const apps = get().applications;
        return {
          not_started: apps.filter((a) => a.status === 'not_started').length,
          preparing: apps.filter((a) => a.status === 'preparing').length,
          applied: apps.filter((a) => a.status === 'applied').length,
          under_review: apps.filter((a) => a.status === 'under_review').length,
          accepted: apps.filter((a) => a.status === 'accepted').length,
          rejected: apps.filter((a) => a.status === 'rejected').length,
        };
      },
    }),
    {
      name: 'mbarayat-applications',
    }
  )
);
