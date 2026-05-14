import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewItem {
  id: string;
  type: 'competition' | 'school';
  title: string;
  subtitle?: string;
  viewedAt: string;
}

interface RecentlyViewedState {
  items: RecentlyViewItem[];
  addViewed: (item: Omit<RecentlyViewItem, 'viewedAt'>) => void;
  getRecent: (limit?: number) => RecentlyViewItem[];
  clearAll: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addViewed: (item) =>
        set((state) => {
          // Remove if already exists, then add to front
          const filtered = state.items.filter((i) => i.id !== item.id);
          return {
            items: [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS),
          };
        }),

      getRecent: (limit = 10) => get().items.slice(0, limit),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'mbarayat-recently-viewed',
    }
  )
);
