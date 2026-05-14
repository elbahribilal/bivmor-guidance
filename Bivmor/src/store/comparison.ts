import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CompareType = 'competition' | 'school';

export interface ComparisonItem {
  id: string;
  type: CompareType;
}

interface ComparisonState {
  items: ComparisonItem[];
  compareType: CompareType;
  addItem: (item: ComparisonItem) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  setCompareType: (type: CompareType) => void;
  isInComparison: (id: string) => boolean;
}

const MAX_COMPARISON_ITEMS = 4;

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      items: [],
      compareType: 'competition',

      addItem: (item) =>
        set((state) => {
          if (state.items.length >= MAX_COMPARISON_ITEMS) return state;
          if (state.items.some((i) => i.id === item.id)) return state;
          return {
            items: [...state.items, item],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      clearAll: () => set({ items: [] }),

      setCompareType: (type) =>
        set((state) => ({
          compareType: type,
          items: [], // Clear items when switching type
        })),

      isInComparison: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'mbarayat-comparison',
    }
  )
);
