# BIVMOR - Modules Documentation

> Each module is a self-contained unit with its own components, API routes, types, and state management.

---

## Module Index

| Module | Components | API Routes | Store | Purpose |
|--------|-----------|------------|-------|---------|
| Competitions | 4 | 3 | navigation | Browse, search, view competition details |
| Schools | 3 | 2 | navigation | Browse, search, view school details |
| Categories | 1 | 1 | — | Browse competitions/schools by category |
| Search | 4 | 2 | navigation | Search across competitions and schools |
| Cities | 1 | 2 | — | Explore cities and regions of Morocco |
| Calendar | 1 | 0 | navigation | View competition deadlines on calendar |
| FAQ | 1 | 0 | — | Frequently asked questions |
| Stats | 1 | 1 | — | Analytics dashboard with charts |
| Comparison | 1 | 0 | comparison | Side-by-side comparison of items |
| Favorites | 1 | 1 | favorites | Bookmark competitions and schools |
| Reminders | 2 | 1 | reminders | Set deadline reminders |
| Applications | 2 | 1 | applications | Track application status |
| Notifications | 1 | 1 | — | System and user notifications |
| Auth | 5 | 7 | admin-auth, user-auth | Admin + User authentication |
| Admin | 9 | 3 | admin-auth | Dashboard for content management |

---

## 1. Competitions Module

### Purpose
The core module of the platform. Allows users to browse, filter, search, and view detailed information about Moroccan educational competitions (مباريات).

### Key Files

| File | Path | Description |
|------|------|-------------|
| CompetitionsView | `src/components/competitions/CompetitionsView.tsx` | Main listing page with filters, search, pagination |
| CompetitionCard | `src/components/competitions/CompetitionCard.tsx` | Card component with status badge, deadline, favorite |
| CompetitionFilters | `src/components/competitions/CompetitionFilters.tsx` | Sidebar filter panel (city, category, status, type) |
| CompetitionDetailDialog | `src/components/competitions/CompetitionDetailDialog.tsx` | Full detail modal with countdown, share, reminder |
| API List/Create | `src/app/api/competitions/route.ts` | GET (list with filters), POST (create) |
| API Single/Update | `src/app/api/competitions/[id]/route.ts` | GET, PUT, DELETE |
| API Auto-Status | `src/app/api/competitions/auto-update-status/route.ts` | POST auto-status update |
| API Client | `src/lib/api.ts` → `competitionsApi` | list, get, create, update, delete, autoUpdateStatus |

### Dependencies
- **Navigation store** for `selectedCompetitionId`, `competitionFilters`
- **Favorites store** for bookmark functionality
- **Reminders store** for deadline reminders
- **Recently viewed store** for tracking
- **Applications store** for application tracking
- **ShareDialog** for social sharing

### Data Model
```typescript
Competition {
  id, title, slug, shortDescription, fullDescription,
  officialLink, registrationOpen, deadline, startDate, endDate,
  requirements, documents, stages, featuredImage,
  cityId → City, schoolId → School, categoryId → Category, levelId → Level,
  isFeatured, isPinned, isArchived,
  status: OPEN | CLOSED | EXPIRED | UPCOMING,
  type: RECRUITMENT | ACADEMIC | SCHOLARSHIP | CONTINUING_EDUCATION | ADMISSION,
  tags, media, seoTitle, seoDescription
}
```

### How to Extend
- Add new competition type: Update `CompetitionType` enum in schema + types
- Add new filter: Update `CompetitionFilters` type and `CompetitionsFilters` component
- Add new field: Update Prisma schema, types, API, and detail dialog

---

## 2. Schools Module

### Purpose
Browse and view Moroccan educational institutions with their associated competitions.

### Key Files

| File | Path | Description |
|------|------|-------------|
| SchoolsView | `src/components/schools/SchoolsView.tsx` | Listing page with filters and pagination |
| SchoolCard | `src/components/schools/SchoolCard.tsx` | Card with type badge, competition count, favorite |
| SchoolDetailDialog | `src/components/schools/SchoolDetailDialog.tsx` | Detail modal with contact info, related competitions |
| API List/Create | `src/app/api/schools/route.ts` | GET (list), POST (create) |
| API Single/Update | `src/app/api/schools/[id]/route.ts` | GET, PUT, DELETE |
| API Client | `src/lib/api.ts` → `schoolsApi` | list, get, create, update, delete |

### Dependencies
- **Navigation store** for `selectedSchoolId`, `schoolFilters`
- **Favorites store** for bookmark functionality
- **Recently viewed store** for tracking
- **ShareDialog** for social sharing

### Data Model
```typescript
School {
  id, name, slug, shortDescription, fullDescription,
  logo, coverImage, website, email, phone, address,
  cityId → City, categoryId → Category, levelId → Level,
  isFeatured, isActive, type: PUBLIC | PRIVATE | SEMI_PRIVATE,
  competitions, media, seoTitle, seoDescription
}
```

### How to Extend
- Add image gallery: Extend `SchoolDetailDialog` with media carousel
- Add school ratings: Add `Rating` model to Prisma schema
- Add school comparison fields: Update `ComparisonView` school rows

---

## 3. Categories Module

### Purpose
Organize competitions and schools into hierarchical categories for easy browsing.

### Key Files

| File | Path | Description |
|------|------|-------------|
| CategoriesView | `src/components/categories/CategoriesView.tsx` | Grid of categories with counts |
| CategoriesGrid | `src/components/home/CategoriesGrid.tsx` | Home page category showcase |
| API | `src/app/api/categories/route.ts` | GET (list), POST (create) |
| API Client | `src/lib/api.ts` → `categoriesApi` | list, create |

### Dependencies
- **Competitions API** for competition counts per category
- **Schools API** for school counts per category

### Data Model
```typescript
Category {
  id, name, slug, nameAr, nameFr,
  icon, color, description, order,
  parentId → Category (self-referencing hierarchy),
  children: Category[], competitions, schools
}
```

### How to Extend
- Add subcategory browsing: Expand CategoriesView with drill-down
- Add category icons: Upload custom SVG icons via admin
- Add category colors: Use `color` field for category card backgrounds

---

## 4. Search Module

### Purpose
Unified search across competitions and schools with filters and autocomplete suggestions.

### Key Files

| File | Path | Description |
|------|------|-------------|
| SearchView | `src/components/search/SearchView.tsx` | Main search page with results, filters, pills |
| SearchBar | `src/components/search/SearchBar.tsx` | Reusable search input component |
| SearchFilters | `src/components/search/SearchFilters.tsx` | Search filter panel |
| SearchAutocomplete | `src/components/search/SearchAutocomplete.tsx` | Autocomplete dropdown |
| API Search | `src/app/api/search/route.ts` | GET (search competitions + schools) |
| API Suggestions | `src/app/api/search/suggestions/route.ts` | GET (autocomplete) |
| API Client | `src/lib/api.ts` → `searchApi` | search |

### Dependencies
- **Navigation store** for `searchQuery`, view switching

### How It Works
1. User types query → debounced request to search API
2. API queries both `competition` and `school` tables with `contains`
3. Results merged into `SearchResult[]` with type discriminator
4. Frontend renders mixed results with type badges and status indicators

### How to Extend
- Add Arabic full-text search: Integrate Meilisearch or Typesense
- Add search history: Store in localStorage
- Add advanced filters: Date range, price, etc.
- Add search analytics: Track popular queries

---

## 5. Cities Module

### Purpose
Explore Moroccan cities and discover competitions/schools available in each city.

### Key Files

| File | Path | Description |
|------|------|-------------|
| CitiesExplorerView | `src/components/cities/CitiesExplorerView.tsx` | Region tabs, city grid, expandable detail panel |
| API Cities | `src/app/api/cities/route.ts` | GET (list with competition/school counts) |
| API Regions | `src/app/api/regions/route.ts` | GET (list) |
| API Client | `src/lib/api.ts` → `citiesApi`, `regionsApi` | list |

### Dependencies
- **Competitions API** for competitions by city
- **Schools API** for schools by city

### How to Extend
- Add city map: Integrate Leaflet or Google Maps
- Add city statistics: Population, university count, etc.
- Add Arabic city names: Populate `nameAr` field in database

---

## 6. Calendar Module

### Purpose
Visualize competition deadlines on a monthly calendar grid and upcoming deadline timeline.

### Key Files

| File | Path | Description |
|------|------|-------------|
| CalendarView | `src/components/calendar/CalendarView.tsx` | Monthly grid + upcoming timeline |

### Dependencies
- **Competitions API** for deadline data (no dedicated API route)
- **Navigation store** for clicking competition → opening detail dialog

### Features
- Monthly calendar grid with Arabic day names
- Colored dots on days with deadlines (status-based colors)
- Click day → show competitions with that deadline
- Upcoming deadlines timeline with urgency grouping
- framer-motion view transitions between monthly and timeline views

### How to Extend
- Add iCal export: Generate `.ics` files for calendar apps
- Add week view: Show weekly grid layout
- Add Google Calendar sync: Import deadlines to Google Calendar

---

## 7. FAQ Module

### Purpose
Provide commonly asked questions and answers to help users navigate the platform.

### Key Files

| File | Path | Description |
|------|------|-------------|
| FaqView | `src/components/faq/FaqView.tsx` | FAQ with search, categories, accordion |

### Dependencies
- **shadcn/ui Accordion** for expandable Q&A items
- No API route (data is hardcoded in the component)

### Features
- 4 categories with 10 total FAQ items
- Search filter by question/answer text
- Category filtering with pill buttons
- Contact CTA section at bottom
- All text in Arabic

### How to Extend
- Move FAQ data to database: Add `FaqItem` model to Prisma
- Add admin FAQ management: Create FaqManager in admin-system
- Add user-submitted questions: Allow users to submit questions

---

## 8. Stats Module

### Purpose
Analytics dashboard with interactive charts showing platform statistics.

### Key Files

| File | Path | Description |
|------|------|-------------|
| StatsView | `src/components/stats/StatsView.tsx` | 6 chart types + timeline + ranking cards |
| API | `src/app/api/dashboard/stats/route.ts` | GET (aggregated statistics) |
| API Client | `src/lib/api.ts` → `dashboardApi` | stats |

### Dependencies
- **Recharts** for data visualization (PieChart, BarChart)
- **Dashboard API** for aggregated data

### Charts
1. **Competitions by Status** — Donut chart (OPEN/CLOSED/EXPIRED/UPCOMING)
2. **Schools by Type** — Donut chart (PUBLIC/PRIVATE/SEMI_PRIVATE)
3. **Competitions by City** — Vertical bar chart
4. **Competitions by Category** — Horizontal bar chart
5. **Top Schools** — Horizontal bar chart (by competition count)
6. **Deadlines Timeline** — Visual calendar of upcoming deadlines

### How to Extend
- Add date range filter: Allow selecting time period
- Add trend charts: Line chart showing growth over time
- Add export: PDF/CSV export of statistics
- Add real-time updates: WebSocket for live stats

---

## 9. Comparison Module

### Purpose
Side-by-side comparison of 2-4 competitions or schools.

### Key Files

| File | Path | Description |
|------|------|-------------|
| ComparisonView | `src/components/comparison/ComparisonView.tsx` | Type toggle, item selector, comparison table |
| Store | `src/store/comparison.ts` | Comparison items with localStorage persistence |

### Dependencies
- **Competitions API** for fetching competition details
- **Schools API** for fetching school details
- **shadcn/ui Command** for searchable item selector

### Features
- Toggle between competition and school comparison
- Command-based combobox for adding items
- Side-by-side table with all relevant fields
- Max 4 items per comparison
- Clear all and remove individual items
- framer-motion animations for add/remove

### How to Extend
- Add PDF export of comparison
- Add highlight differences toggle (already exists)
- Add comparison sharing (URL-based)
- Add comparison templates (predefined comparisons)

---

## 10. Favorites Module

### Purpose
Bookmark competitions and schools for quick access later.

### Key Files

| File | Path | Description |
|------|------|-------------|
| FavoritesView | `src/components/favorites/FavoritesView.tsx` | Grouped favorites page |
| FavoriteButton | `src/components/shared/FavoriteButton.tsx` | Heart toggle button |
| Store | `src/store/favorites.ts` | Favorites with localStorage persistence |
| API | `src/app/api/user/favorites/route.ts` | GET, POST, DELETE (for logged-in users) |

### Dependencies
- **Favorites store** for client-side state
- **User auth** for server-side sync (optional)

### Data Flow
- **Not logged in**: Favorites stored in localStorage only
- **Logged in**: Favorites synced to `UserFavorite` table in database
- On login: localStorage favorites merged with server favorites

### How to Extend
- Add favorite collections: Group favorites into named lists
- Add favorite sharing: Share a collection of favorites
- Add favorite notifications: Alert when favorited competition status changes

---

## 11. Reminders Module

### Purpose
Set reminders for competition deadlines with customizable timing.

### Key Files

| File | Path | Description |
|------|------|-------------|
| RemindersView | `src/components/reminders/RemindersView.tsx` | Reminders management page |
| ReminderButton | `src/components/reminders/ReminderButton.tsx` | Set reminder dialog |
| Store | `src/store/reminders.ts` | Reminders with localStorage persistence |
| API | `src/app/api/user/reminders/route.ts` | GET, POST, DELETE |

### Dependencies
- **Competitions API** for competition deadline data
- **Reminders store** for client-side state
- **User auth** for server-side sync

### Reminder Options
- 1 hour before deadline
- 1 day before deadline
- 3 days before deadline
- 1 week before deadline
- Custom notes field

### How to Extend
- Add push notifications: Service Worker + Web Push API
- Add email reminders: Integrate email sending service
- Add SMS reminders: Integrate Twilio or similar
- Add smart reminders: AI-based optimal reminder timing

---

## 12. Applications Module

### Purpose
Track application status for competitions across 6 stages.

### Key Files

| File | Path | Description |
|------|------|-------------|
| ApplicationsView | `src/components/applications/ApplicationsView.tsx` | Application tracking page |
| ApplicationTrackerButton | `src/components/applications/ApplicationTrackerButton.tsx` | Track application dialog |
| Store | `src/store/applications.ts` | Applications with localStorage persistence |
| API | `src/app/api/user/applications/route.ts` | GET, POST, PUT |

### Dependencies
- **Competitions API** for competition details
- **Applications store** for client-side state
- **User auth** for server-side sync

### Application Statuses
| Status (Arabic) | English | Color |
|-----------------|---------|-------|
| لم أبدأ | Not Started | gray |
| أحضّر | Preparing | amber |
| قدّمت | Applied | blue |
| قيد المراجعة | Under Review | violet |
| مقبول | Accepted | emerald |
| مرفوض | Rejected | red |

### How to Extend
- Add document upload for applications
- Add application timeline (history of status changes)
- Add email notifications for status changes
- Add application deadline alerts

---

## 13. Notifications Module

### Purpose
Display system and user-specific notifications with real-time updates.

### Key Files

| File | Path | Description |
|------|------|-------------|
| NotificationBell | `src/components/notifications/NotificationBell.tsx` | Bell dropdown with unread count |
| API System | `src/app/api/notifications/route.ts` | GET, POST, PUT, DELETE |
| API User | `src/app/api/user/notifications/route.ts` | GET, PUT |
| API Client | `src/lib/api.ts` → `notificationsApi` | list, markRead, markAllRead, create, delete |

### Dependencies
- **TanStack Query** for data fetching with 30-second polling
- **Admin auth** for creating system notifications

### Notification Types
| Type | Color | Icon |
|------|-------|------|
| INFO | blue | Info |
| WARNING | amber | AlertTriangle |
| SUCCESS | emerald | CheckCircle |
| ERROR | red | XCircle |

### How to Extend
- Add push notifications (Web Push API)
- Add email notifications
- Add notification preferences per user
- Add notification channels (in-app, email, SMS)

---

## 14. Auth Module

### Purpose
Handle authentication for both admin users and regular platform users.

### Key Files

#### Admin Auth
| File | Path | Description |
|------|------|-------------|
| AdminLogin | `src/components/admin/AdminLogin.tsx` | Admin login form |
| AdminSession | `src/app/api/admin/session/route.ts` | GET (session check) |
| NextAuth Handler | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth.js catch-all |
| Auth Config | `src/lib/auth/config.ts` | NextAuth options |
| API Guard | `src/lib/auth/api-guard.ts` | withAdminAuth, requireAdminAuth |
| Admin Auth Store | `src/store/admin-auth.ts` | Admin auth state |

#### User Auth
| File | Path | Description |
|------|------|-------------|
| UserAuthModal | `src/components/user/UserAuthModal.tsx` | Login/Signup modal |
| UserProfileView | `src/components/user/UserProfileView.tsx` | Profile page |
| UserProfileMenu | `src/components/user/UserProfileMenu.tsx` | Profile dropdown |
| Signup | `src/app/api/user/auth/signup/route.ts` | POST |
| Login | `src/app/api/user/auth/login/route.ts` | POST |
| Logout | `src/app/api/user/auth/logout/route.ts` | POST |
| Session | `src/app/api/user/auth/session/route.ts` | GET |
| User Auth Lib | `src/lib/auth/user-auth.ts` | JWT sign/verify, cookies |
| User Guard | `src/lib/auth/user-guard.ts` | requireUserAuth |
| User Auth Store | `src/store/user-auth.ts` | User auth state |

### Dependencies
- **NextAuth.js v4** for admin authentication
- **jose** for user JWT signing/verification
- **bcryptjs** for password hashing

### How to Extend
- Add OAuth providers: Google, GitHub (in NextAuth config)
- Add email verification: Send verification email on signup
- Add two-factor authentication: TOTP or SMS
- Add password strength requirements
- Add account lockout after failed attempts

---

## 15. Admin Module

### Purpose
Full content management dashboard for administrators and editors.

### Key Files

| File | Path | Description |
|------|------|-------------|
| AdminDashboard | `src/components/admin/AdminDashboard.tsx` | Main dashboard with tab panels |
| AdminLogin | `src/components/admin/AdminLogin.tsx` | Login form |
| CompetitionsManager | `src/admin-system/components/managers/CompetitionsManager.tsx` | Competition CRUD table |
| SchoolsManager | `src/admin-system/components/managers/SchoolsManager.tsx` | School CRUD table |
| CategoriesManager | `src/admin-system/components/managers/CategoriesManager.tsx` | Category management |
| NotificationsManager | `src/admin-system/components/managers/NotificationsManager.tsx` | Notification management |
| NewsManager | `src/admin-system/components/managers/NewsManager.tsx` | News/Announcement CRUD |
| AdminHeader | `src/admin-system/components/shared/AdminHeader.tsx` | Admin page header |
| TablePagination | `src/admin-system/components/shared/TablePagination.tsx` | Table pagination |
| Admin API Client | `src/admin-system/services/admin-api.ts` | Authenticated API client |
| Admin Logger | `src/admin-system/services/admin-logger.ts` | Activity logging |
| Admin Hooks | `src/admin-system/hooks/use-admin-auth.ts` | Auth hook |
| Admin Hooks | `src/admin-system/hooks/use-admin-data.ts` | Data fetching hooks |
| Admin Types | `src/admin-system/types/admin.ts` | Form types, action labels, config |
| Admin Helpers | `src/admin-system/utils/admin-helpers.ts` | Utility functions |
| Activity API | `src/app/api/admin/activity/route.ts` | GET (log), POST (log action) |
| Seed API | `src/app/api/admin/seed/route.ts` | POST (seed data) |

### Admin Dashboard Tabs
1. **نظرة عامة** (Overview) — Statistics cards + recent activity
2. **المباريات** (Competitions) — CRUD table with filters
3. **المدارس** (Schools) — CRUD table with filters
4. **التصنيفات** (Categories) — Category management
5. **الأخبار** (News) — News/announcement CRUD
6. **الإشعارات** (Notifications) — Create and manage notifications
7. **الإعدادات** (Settings) — Site content and SEO settings
8. **النشاط** (Activity) — Admin audit log

### Access Control
- Route: `/?admin=true` (hidden from public navigation)
- Roles: ADMIN (full access), EDITOR (content management)
- Session: 24-hour JWT via NextAuth.js

### How to Extend
- Add dashboard widgets: Custom stats cards
- Add bulk actions: Multi-select + batch operations
- Add data export: CSV/PDF export for reports
- Add media library: Upload and manage images
- Add user management: Manage platform users from admin
