import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoriteItem {
  id: string;
  type: 'competition' | 'school';
  title: string;
  addedAt: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavoritesByType: (type: 'competition' | 'school') => FavoriteItem[];
  clearAll: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],

      addFavorite: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return {
            items: [...state.items, { ...item, addedAt: new Date().toISOString() }],
          };
        }),

      removeFavorite: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      isFavorite: (id) => get().items.some((i) => i.id === id),

      getFavoritesByType: (type) => get().items.filter((i) => i.type === type),

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'mbarayat-favorites',
    }
  )
);
