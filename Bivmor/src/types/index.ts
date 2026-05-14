// Moroccan Educational Platform - Type Definitions
// منصة المباريات والفرص التعليمية في المغرب

// ============================================
// BASE TYPES
// ============================================

export interface Region {
  id: string;
  name: string;
  nameAr: string | null;
  nameFr: string | null;
  slug: string;
  order: number;
  cities?: City[];
}

export interface City {
  id: string;
  name: string;
  nameAr: string | null;
  nameFr: string | null;
  slug: string;
  regionId: string;
  region?: Region;
  order: number;
  _count?: {
    schools: number;
    competitions: number;
  };
}

export interface Level {
  id: string;
  name: string;
  nameAr: string | null;
  nameFr: string | null;
  slug: string;
  order: number;
  _count?: {
    competitions: number;
    schools: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  nameAr: string | null;
  nameFr: string | null;
  icon: string | null;
  color: string | null;
  description: string | null;
  order: number;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    competitions: number;
    schools: number;
  };
}

// ============================================
// SCHOOL TYPES
// ============================================

export type SchoolType = 'PUBLIC' | 'PRIVATE' | 'SEMI_PRIVATE';

export interface School {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  logo: string | null;
  coverImage: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  cityId: string;
  city?: City;
  categoryId: string | null;
  category?: Category | null;
  levelId: string | null;
  level?: Level | null;
  isFeatured: boolean;
  isActive: boolean;
  type: SchoolType;
  competitions?: Competition[];
  media?: Media[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    competitions: number;
  };
}

// ============================================
// COMPETITION TYPES
// ============================================

export type CompetitionStatus = 'OPEN' | 'CLOSED' | 'EXPIRED' | 'UPCOMING';

export type CompetitionType = 'RECRUITMENT' | 'ACADEMIC' | 'SCHOLARSHIP' | 'CONTINUING_EDUCATION' | 'ADMISSION';

export interface Competition {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  fullDescription: string | null;
  officialLink: string | null;
  registrationOpen: boolean;
  deadline: string | null;
  startDate: string | null;
  endDate: string | null;
  requirements: string | null;
  documents: string | null;
  stages: string | null;
  featuredImage: string | null;
  cityId: string | null;
  city?: City | null;
  schoolId: string | null;
  school?: School | null;
  categoryId: string | null;
  category?: Category | null;
  levelId: string | null;
  level?: Level | null;
  isFeatured: boolean;
  isPinned: boolean;
  isArchived: boolean;
  status: CompetitionStatus;
  type: CompetitionType;
  tags?: CompetitionTag[] | Tag[];
  media?: Media[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CompetitionWithRelations = Competition & {
  city?: City & { region?: Region } | null;
  school?: School | null;
  category?: Category | null;
  level?: Level | null;
  tags?: CompetitionTag[];
};

// ============================================
// TAG TYPES
// ============================================

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface CompetitionTag {
  competitionId: string;
  tagId: string;
  tag: Tag;
}

// ============================================
// MEDIA TYPES
// ============================================

export type MediaType = 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'LOGO';

export interface Media {
  id: string;
  url: string;
  alt: string | null;
  type: MediaType;
  schoolId: string | null;
  competitionId: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: string | null;
  createdAt: string;
}

// ============================================
// SETTINGS TYPES
// ============================================

export type SettingType = 'TEXT' | 'JSON' | 'NUMBER' | 'BOOLEAN';

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: SettingType;
}

export interface SiteSettingsMap {
  [key: string]: string;
}

// ============================================
// NEWS TYPES
// ============================================

export type NewsCategory = 'إعلان' | 'آجل' | 'نتائج' | 'نصيحة';

export interface News {
  id: string;
  title: string;
  content: string;
  excerpt: string | null;
  category: string;
  isPublished: boolean;
  isPinned: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsFilters {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
  publishedOnly?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export interface DashboardStats {
  totalCompetitions: number;
  openCompetitions: number;
  closedCompetitions: number;
  expiredCompetitions: number;
  totalSchools: number;
  totalCategories: number;
  recentCompetitions: Competition[];
}

export interface SearchResult {
  type: 'competition' | 'school';
  id: string;
  title: string;
  slug: string;
  description: string | null;
  city: string | null;
  status?: CompetitionStatus;
  schoolType?: SchoolType;
}

// ============================================
// FILTER TYPES
// ============================================

export interface CompetitionFilters {
  cityId?: string;
  categoryId?: string;
  levelId?: string;
  status?: CompetitionStatus | '';
  type?: CompetitionType | '';
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SchoolFilters {
  cityId?: string;
  categoryId?: string;
  levelId?: string;
  type?: SchoolType | '';
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

export interface SearchFilters {
  q?: string;
  cityId?: string;
  categoryId?: string;
  levelId?: string;
  type?: 'competition' | 'school' | '';
}

// ============================================
// NAVIGATION TYPES
// ============================================

export type ViewType = 
  | 'home' 
  | 'competitions' 
  | 'competition-detail' 
  | 'schools' 
  | 'school-detail' 
  | 'categories' 
  | 'search' 
  | 'favorites'
  | 'comparison'
  | 'stats'
  | 'cities'
  | 'calendar'
  | 'faq'
  | 'reminders'
  | 'applications'
  | 'profile';

// ============================================
// ACTIVITY LOG TYPES
// ============================================

export interface ActivityLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
}

export interface NavigationState {
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
