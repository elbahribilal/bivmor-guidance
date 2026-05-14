# BIVMOR - Project Structure

> منصة المباريات والفرص التعليمية في المغرب
> Moroccan Educational Competitions & Opportunities Platform

This document provides a comprehensive overview of the project's file and directory structure, with descriptions of each module and key file.

---

## Top-Level Directory

```
/home/z/my-project/
├── prisma/              # Database schema and migrations
├── src/                 # Application source code
├── public/              # Static assets
├── db/                  # SQLite database file (custom.db)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration (v4)
├── Caddyfile            # Reverse proxy / gateway config
└── .env                 # Environment variables
```

---

## Complete Source Tree

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main SPA page (single entry point)
│   ├── layout.tsx                # Root layout with providers
│   ├── globals.css               # Global styles + 30+ CSS utility classes
│   └── api/                      # Backend API routes
│       ├── competitions/         # Competition CRUD + auto-status
│       │   ├── route.ts          # GET (list), POST (create)
│       │   ├── [id]/route.ts     # GET (single), PUT (update), DELETE
│       │   └── auto-update-status/route.ts  # POST auto-status updater
│       ├── schools/              # School CRUD
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [id]/route.ts     # GET (single), PUT (update), DELETE
│       ├── categories/route.ts   # GET (list), POST (create)
│       ├── cities/route.ts       # GET (list with counts)
│       ├── regions/route.ts      # GET (list)
│       ├── levels/route.ts       # GET (list)
│       ├── search/               # Search endpoints
│       │   ├── route.ts          # GET (search competitions + schools)
│       │   └── suggestions/route.ts  # GET (autocomplete suggestions)
│       ├── news/                 # News/Announcements CRUD
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [id]/route.ts     # GET, PUT, DELETE
│       ├── notifications/route.ts  # GET (list), POST (create), PUT (mark read), DELETE
│       ├── settings/route.ts     # GET, PUT (site settings)
│       ├── dashboard/stats/route.ts  # GET (dashboard statistics)
│       ├── admin/                # Admin-specific APIs
│       │   ├── session/route.ts  # GET (check admin session)
│       │   ├── activity/route.ts # GET (activity log), POST (log activity)
│       │   └── seed/route.ts     # POST (initial data seeding)
│       ├── auth/                 # NextAuth.js authentication
│       │   └── [...nextauth]/route.ts  # NextAuth catch-all handler
│       ├── user/                 # User (platform user) APIs
│       │   ├── auth/             # User authentication
│       │   │   ├── signup/route.ts   # POST (register)
│       │   │   ├── login/route.ts    # POST (login)
│       │   │   ├── logout/route.ts   # POST (logout)
│       │   │   ├── session/route.ts  # GET (check session)
│       │   │   └── reset-password/route.ts  # POST (password reset)
│       │   ├── favorites/route.ts    # GET, POST, DELETE (user favorites)
│       │   ├── reminders/route.ts    # GET, POST, DELETE (user reminders)
│       │   ├── applications/route.ts # GET, POST, PUT (user applications)
│       │   ├── notifications/route.ts # GET, PUT (user notifications)
│       │   └── profile/route.ts      # GET, PUT (user profile)
│       ├── seed/route.ts         # Public seed endpoint
│       └── route.ts              # API root / health check
│
├── components/                   # React UI Components
│   ├── home/                     # Home page sections (15 components)
│   │   ├── HeroSection.tsx       # Hero banner with search, stats, particles
│   │   ├── QuickStatsBar.tsx     # Animated statistics strip with counters
│   │   ├── FeaturedCompetitions.tsx  # Featured competitions carousel
│   │   ├── OpenCompetitionsSection.tsx  # Open competitions grid
│   │   ├── DeadlineTimeline.tsx  # Visual deadline timeline with urgency
│   │   ├── CategoriesGrid.tsx    # Categories grid with icons and counts
│   │   ├── FeaturedSchools.tsx   # Featured schools showcase
│   │   ├── RecentlyViewedSection.tsx  # Recently viewed items
│   │   ├── TestimonialsSection.tsx  # Testimonials carousel (embla)
│   │   ├── TipsSection.tsx       # Success tips for students
│   │   ├── NewsSection.tsx       # News/announcements feed
│   │   ├── NewsletterSection.tsx  # Email newsletter subscription
│   │   ├── HowItWorksSection.tsx # How the platform works steps
│   │   └── StatsSection.tsx      # Quick stats on home page
│   │
│   ├── competitions/             # Competition views
│   │   ├── CompetitionsView.tsx  # Competitions listing page
│   │   ├── CompetitionCard.tsx   # Competition card component
│   │   ├── CompetitionFilters.tsx # Filter sidebar/bar
│   │   └── CompetitionDetailDialog.tsx  # Full detail modal
│   │
│   ├── schools/                  # School views
│   │   ├── SchoolsView.tsx       # Schools listing page
│   │   ├── SchoolCard.tsx        # School card component
│   │   └── SchoolDetailDialog.tsx # Full detail modal
│   │
│   ├── categories/               # Category browsing
│   │   └── CategoriesView.tsx    # Categories grid page
│   │
│   ├── search/                   # Search views
│   │   ├── SearchView.tsx        # Main search page with filters
│   │   ├── SearchBar.tsx         # Reusable search input
│   │   ├── SearchFilters.tsx     # Search filter panel
│   │   └── SearchAutocomplete.tsx # Autocomplete dropdown
│   │
│   ├── cities/                   # City explorer
│   │   └── CitiesExplorerView.tsx # City explorer with regions
│   │
│   ├── calendar/                 # Competition calendar
│   │   └── CalendarView.tsx      # Monthly calendar + deadline timeline
│   │
│   ├── faq/                      # FAQ section
│   │   └── FaqView.tsx           # FAQ with search + categories
│   │
│   ├── stats/                    # Analytics dashboard
│   │   └── StatsView.tsx         # Charts and statistics (recharts)
│   │
│   ├── comparison/               # Comparison tool
│   │   └── ComparisonView.tsx    # Side-by-side comparison (2-4 items)
│   │
│   ├── favorites/                # Favorites/Bookmarks
│   │   └── FavoritesView.tsx     # Favorites page with grouping
│   │
│   ├── reminders/                # Competition reminders
│   │   ├── RemindersView.tsx     # Reminders management page
│   │   └── ReminderButton.tsx    # Set reminder dialog
│   │
│   ├── applications/             # Application tracker
│   │   ├── ApplicationsView.tsx  # Application tracking page
│   │   └── ApplicationTrackerButton.tsx  # Track application dialog
│   │
│   ├── notifications/            # Notification system
│   │   └── NotificationBell.tsx  # Bell dropdown with unread count
│   │
│   ├── user/                     # User authentication + profile
│   │   ├── UserAuthModal.tsx     # Login/Signup modal
│   │   ├── UserProfileView.tsx   # User profile page
│   │   └── UserProfileMenu.tsx   # Profile dropdown menu
│   │
│   ├── admin/                    # Admin dashboard (legacy inline)
│   │   ├── AdminDashboard.tsx    # Main admin dashboard
│   │   └── AdminLogin.tsx        # Admin login form
│   │
│   ├── layout/                   # Layout components
│   │   ├── Header.tsx            # Top navigation bar + dropdown menu
│   │   ├── Footer.tsx            # Footer with links, newsletter, social
│   │   └── MobileBottomNav.tsx   # Mobile bottom navigation bar
│   │
│   ├── shared/                   # Reusable components
│   │   ├── Breadcrumb.tsx        # Navigation breadcrumb trail
│   │   ├── BackToTop.tsx         # Scroll-to-top floating button
│   │   ├── PageTransition.tsx    # framer-motion page transitions
│   │   ├── FavoriteButton.tsx    # Heart toggle button
│   │   ├── ShareDialog.tsx       # Social share dialog
│   │   ├── CountdownTimer.tsx    # Live countdown with animations
│   │   ├── StatusBadge.tsx       # Competition status badge
│   │   ├── CompetitionTypeBadge.tsx  # Competition type badge
│   │   ├── EmptyState.tsx        # Empty state illustration
│   │   ├── ErrorBoundary.tsx     # React error boundary
│   │   ├── LoadingSkeleton.tsx   # Loading skeleton placeholder
│   │   ├── PaginationControls.tsx # Pagination UI
│   │   ├── QuickViewTooltip.tsx  # Hover tooltip preview
│   │   ├── WelcomeGuide.tsx      # First-time visitor onboarding
│   │   └── KeyboardShortcuts.tsx  # Keyboard shortcut handler
│   │
│   ├── Providers.tsx             # Client providers (QueryClient, Theme, Toaster)
│   │
│   └── ui/                       # shadcn/ui component library (50+ components)
│       ├── button.tsx            ├── card.tsx
│       ├── dialog.tsx            ├── input.tsx
│       ├── select.tsx            ├── badge.tsx
│       ├── tabs.tsx              ├── accordion.tsx
│       ├── dropdown-menu.tsx     ├── command.tsx (cmdk)
│       ├── scroll-area.tsx       ├── sheet.tsx
│       ├── skeleton.tsx          ├── tooltip.tsx
│       ├── toast.tsx             ├── sonner.tsx
│       ├── calendar.tsx          ├── carousel.tsx
│       ├── chart.tsx             ├── form.tsx
│       └── ... (50+ more shadcn/ui primitives)
│
├── admin-system/                 # Isolated admin system (portable)
│   ├── auth/                     # Admin authentication
│   │   ├── admin-config.ts       # Auth configuration export
│   │   ├── admin-guard.ts        # Route guard logic
│   │   ├── admin-session.ts      # Session management
│   │   └── admin-store.ts        # Auth state store
│   ├── components/               # Admin-specific components
│   │   ├── managers/             # CRUD manager components
│   │   │   ├── CompetitionsManager.tsx  # Competition CRUD table
│   │   │   ├── SchoolsManager.tsx      # School CRUD table
│   │   │   ├── CategoriesManager.tsx   # Category management
│   │   │   ├── NotificationsManager.tsx # Notification management
│   │   │   └── NewsManager.tsx         # News/Announcement management
│   │   └── shared/               # Shared admin components
│   │       ├── AdminHeader.tsx   # Admin page header
│   │       └── TablePagination.tsx  # Table pagination control
│   ├── services/                 # Admin services
│   │   ├── admin-api.ts          # Admin API client (with auth headers)
│   │   └── admin-logger.ts       # Activity logging service
│   ├── hooks/                    # Admin hooks
│   │   ├── use-admin-auth.ts     # Admin authentication hook
│   │   └── use-admin-data.ts     # Admin data fetching hooks
│   ├── types/                    # Admin type definitions
│   │   └── admin.ts              # All admin types (forms, actions, entities)
│   └── utils/                    # Admin utilities
│       └── admin-helpers.ts      # Helper functions for admin
│
├── config/                       # Configuration system (centralized)
│   ├── env.ts                    # Environment variables (all ENV here)
│   ├── api.ts                    # API endpoint URLs
│   ├── admin.ts                  # Admin system config
│   ├── auth.ts                   # Auth system config (admin + user)
│   ├── features.ts               # Feature flags
│   └── index.ts                  # Main re-export hub
│
├── lib/                          # Core libraries and utilities
│   ├── db.ts                     # Prisma client singleton
│   ├── api.ts                    # Public API client (fetch wrapper)
│   ├── utils.ts                  # Utility functions (cn, formatters)
│   └── auth/                     # Authentication utilities
│       ├── config.ts             # NextAuth.js options (admin auth)
│       ├── session.ts            # Admin session helpers
│       ├── api-guard.ts          # Admin API guard (withAdminAuth, requireAdminAuth)
│       ├── user-auth.ts          # User JWT auth (sign, verify, cookies)
│       └── user-guard.ts         # User API guard (requireUserAuth)
│
├── store/                        # Zustand state stores
│   ├── navigation.ts             # Navigation state (ViewType, filters, selection)
│   ├── admin-auth.ts             # Admin authentication state
│   ├── user-auth.ts              # User authentication state
│   ├── favorites.ts              # Favorites (localStorage persisted)
│   ├── comparison.ts             # Comparison items (localStorage persisted)
│   ├── reminders.ts              # Competition reminders (localStorage persisted)
│   ├── applications.ts           # Application tracker (localStorage persisted)
│   ├── recently-viewed.ts        # Recently viewed items (localStorage persisted)
│   └── onboarding.ts             # Welcome guide state
│
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile device detection
│   └── use-toast.ts              # Toast notification hook
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # All shared types (50+ interfaces/types)
│
└── app/                          # (continued from above)
    ├── layout.tsx                # Root layout: html[dir=rtl], ThemeProvider, QueryProvider
    └── globals.css               # ~1400 lines of CSS: themes, animations, utilities
```

---

## Prisma Schema

```
prisma/
└── schema.prisma                 # Database schema
    ├── User (admin users)        # id, email, password, role (ADMIN/EDITOR/MODERATOR)
    ├── PlatformUser              # Regular users with preferences
    ├── Region                    # Geographic regions of Morocco
    ├── City                      # Cities within regions
    ├── Level                     # Education levels
    ├── Category                  # Hierarchical categories (self-referencing)
    ├── School                    # Educational institutions
    ├── Competition               # Competitions/concours
    ├── Tag / CompetitionTag      # Tagging system
    ├── Media                     # Media attachments (images, docs, logos)
    ├── Notification              # System notifications
    ├── News                      # News/announcements
    ├── SiteSetting               # Dynamic site configuration
    ├── ActivityLog               # Admin activity audit trail
    ├── UserFavorite              # User favorites (synced to DB)
    ├── UserReminder              # User reminders (synced to DB)
    ├── UserApplication           # User application tracker (synced to DB)
    ├── UserNotification          # User-specific notifications
    └── AdminAuditLog             # Admin audit log with IP/user-agent
    # 20+ models, 6 enums (Role, SchoolType, CompetitionStatus,
    #                       CompetitionType, MediaType, SettingType)
```

---

## Key File Descriptions

### `src/app/page.tsx`
The **single page** of this SPA application. Renders different views based on `currentView` from the navigation Zustand store. Contains:
- `HomeView` component with all home page sections
- `PageContent` that switches between 16 views
- Always-mounted `CompetitionDetailDialog` and `SchoolDetailDialog`
- Admin route detection via `?admin=true` query parameter
- `MobileBottomNav`, `WelcomeGuide`, `KeyboardShortcuts` overlays

### `src/app/layout.tsx`
Root layout that sets:
- `dir="rtl"` for Arabic RTL
- `lang="ar"` attribute
- `ThemeProvider` (next-themes) for light/dark mode
- `QueryClientProvider` (TanStack Query)
- `Toaster` (sonner) for toast notifications

### `src/app/globals.css`
~1400 lines of custom CSS including:
- shadcn/ui theme variables (light/dark with oklch colors)
- Custom scrollbar styling
- RTL adjustments
- 30+ animation keyframes (particles, float, glow, shimmer, pulse, etc.)
- 20+ utility classes (glass-card, moroccan-pattern, gradient-text, etc.)
- Calendar, dropdown, and card hover effects
- Moroccan-inspired decorative patterns (Zellige)

### `src/store/navigation.ts`
Central navigation store that drives the SPA:
- `currentView`: Which view is active (ViewType union)
- `selectedCompetitionId` / `selectedSchoolId`: For detail dialogs
- `searchQuery`: Current search query
- `competitionFilters` / `schoolFilters`: Active filters
- Actions: `setView`, `setSelectedCompetition`, `goHome`, `resetFilters`

### `src/lib/api.ts`
Public API client with typed methods for:
- `competitionsApi` (list, get, create, update, delete, autoUpdateStatus)
- `schoolsApi` (list, get, create, update, delete)
- `categoriesApi`, `citiesApi`, `levelsApi`, `regionsApi`
- `searchApi` (search, with filters)
- `dashboardApi` (stats)
- `settingsApi` (get, update)
- `notificationsApi` (list, markRead, markAllRead, create, delete)
- `adminAuthApi` (checkSession, login, logout)
- `newsApi` (list, get, create, update, delete)
- `activityApi` (list, create)

### `src/config/index.ts`
Central configuration hub that re-exports:
- `envConfig` - All environment variables
- `apiConfig` - API endpoint URLs
- `adminConfig` - Admin system settings
- `authConfig` - Auth system settings (admin NextAuth + user JWT)
- `featuresConfig` - Feature flags

### `src/types/index.ts`
Complete type system with 50+ interfaces:
- Geographic types (Region, City, Level, Category)
- Core entity types (School, Competition, Tag, Media)
- Status/enum types (CompetitionStatus, SchoolType, CompetitionType)
- API response types (PaginatedResponse, ApiResponse, DashboardStats)
- Navigation types (ViewType union with 16 values, NavigationState)
- Filter types (CompetitionFilters, SchoolFilters, SearchFilters)
- Notification and settings types

### `src/admin-system/`
Isolated admin system that can be:
- Deployed on the same server (default)
- Deployed separately via `ADMIN_IS_SEPARATE=true` and `ADMIN_API_BASE_URL`
- Contains its own auth, components, services, hooks, and types

---

## Naming Conventions

| Pattern | Example | Usage |
|---------|---------|-------|
| PascalCase | `CompetitionCard.tsx` | React components |
| camelCase | `useNavigationStore` | Hooks and functions |
| kebab-case | `user-auth.ts` | Utility files |
| UPPER_SNAKE | `CompetitionStatus` | TypeScript types/enums |
| `*View.tsx` | `CompetitionsView.tsx` | Page-level view components |
| `*Dialog.tsx` | `CompetitionDetailDialog.tsx` | Modal dialog components |
| `*Section.tsx` | `HeroSection.tsx` | Home page section components |
| `*Manager.tsx` | `CompetitionsManager.tsx` | Admin CRUD manager components |
| `*Button.tsx` | `FavoriteButton.tsx` | Reusable button components |
| `*Store.ts` / `*.ts` | `favorites.ts` | Zustand store files |

---

## Import Aliases

The project uses Next.js path aliases:

```typescript
import { Component } from '@/components/...'
import { useStore } from '@/store/...'
import { apiConfig } from '@/config/...'
import { db } from '@/lib/db'
import { Type } from '@/types'
```

All `@/` imports resolve to `src/`.
