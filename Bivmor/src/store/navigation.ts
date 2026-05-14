import { create } from 'zustand';
import type { ViewType, CompetitionFilters, SchoolFilters } from '@/types';

interface NavigationState {
  currentView: ViewType;
  selectedCompetitionId: string | null;
  selectedSchoolId: string | null;
  searchQuery: string;
  competitionFilters: CompetitionFilters;
  schoolFilters: SchoolFilters;
  setView: (view: ViewType) => void;
  setSelectedCompetition: (id: string) => void;
  setSelectedSchool: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setCompetitionFilters: (filters: Partial<CompetitionFilters>) => void;
  setSchoolFilters: (filters: Partial<SchoolFilters>) => void;
  resetFilters: () => void;
  goHome: () => void;
}

const defaultCompetitionFilters: CompetitionFilters = {
  cityId: undefined,
  categoryId: undefined,
  levelId: undefined,
  status: '',
  type: '',
  search: undefined,
  page: 1,
  limit: 12,
  sort: 'deadline',
};

const defaultSchoolFilters: SchoolFilters = {
  cityId: undefined,
  categoryId: undefined,
  levelId: undefined,
  type: '',
  search: undefined,
  page: 1,
  limit: 12,
};

export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'home',
  selectedCompetitionId: null,
  selectedSchoolId: null,
  searchQuery: '',
  competitionFilters: { ...defaultCompetitionFilters },
  schoolFilters: { ...defaultSchoolFilters },

  setView: (view) => set({ currentView: view }),

  setSelectedCompetition: (id) =>
    set({ selectedCompetitionId: id, currentView: 'competition-detail' }),

  setSelectedSchool: (id) =>
    set({ selectedSchoolId: id, currentView: 'school-detail' }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCompetitionFilters: (filters) =>
    set((state) => ({
      competitionFilters: { ...state.competitionFilters, ...filters },
    })),

  setSchoolFilters: (filters) =>
    set((state) => ({
      schoolFilters: { ...state.schoolFilters, ...filters },
    })),

  resetFilters: () =>
    set({
      competitionFilters: { ...defaultCompetitionFilters },
      schoolFilters: { ...defaultSchoolFilters },
      searchQuery: '',
    }),

  goHome: () =>
    set({
      currentView: 'home',
      selectedCompetitionId: null,
      selectedSchoolId: null,
      searchQuery: '',
      competitionFilters: { ...defaultCompetitionFilters },
      schoolFilters: { ...defaultSchoolFilters },
    }),
}));
