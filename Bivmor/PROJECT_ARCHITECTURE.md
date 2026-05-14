# Project Architecture | هيكل المشروع

> BIVMOR - Moroccan Educational Competitions & Opportunities Platform

---

## System Overview | نظرة عامة على النظام

```
┌─────────────────────────────────────────────────────────┐
│                     BROWSER (Client)                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Single Page Application (SPA)           │   │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────┐ │   │
│  │  │ Zustand │  │ TanStack │  │  Framer Motion  │ │   │
│  │  │  Stores │  │  Query   │  │   Animations    │ │   │
│  │  │ (9)     │  │ (Cache)  │  │                 │ │   │
│  │  └────┬────┘  └────┬─────┘  └─────────────────┘ │   │
│  │       │            │                             │   │
│  │  ┌────▼────────────▼──────────────────────────┐ │   │
│  │  │          React Components (100+)            │ │   │
│  │  │  Home | Competitions | Schools | Admin ...  │ │   │
│  │  └────────────────┬───────────────────────────┘ │   │
│  └───────────────────┼──────────────────────────────┘   │
│                      │ fetch('/api/...')                 │
└──────────────────────┼─────────────────────────────────┘
                       │
┌──────────────────────┼─────────────────────────────────┐
│                 NEXT.JS SERVER                         │
│  ┌───────────────────▼───────────────────────────┐     │
│  │            API Routes (30+ endpoints)          │     │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────────┐ │     │
│  │  │ Public   │ │ Admin    │ │ User          │ │     │
│  │  │ APIs     │ │ APIs     │ │ APIs          │ │     │
│  │  └────┬─────┘ └────┬─────┘ └──────┬────────┘ │     │
│  │       │            │              │          │     │
│  │  ┌────▼────────────▼──────────────▼────────┐ │     │
│  │  │          Auth Middleware Layer            │ │     │
│  │  │  withAdminAuth() | requireUserAuth()     │ │     │
│  │  └──────────────────┬──────────────────────┘ │     │
│  └─────────────────────┼────────────────────────┘     │
│                        │                               │
│  ┌─────────────────────▼────────────────────────┐     │
│  │          Prisma ORM (SQLite)                  │     │
│  │  20 Models | 8 Enums | Relations             │     │
│  └─────────────────────┬────────────────────────┘     │
│                        │                               │
│  ┌─────────────────────▼────────────────────────┐     │
│  │          SQLite Database File                 │     │
│  │          db/custom.db                         │     │
│  └──────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────┘
```

---

## Frontend Architecture | هيكل الواجهة

### SPA-Style View Switching

BIVMOR uses a **single-route SPA architecture** instead of traditional Next.js page routing. All views render within `src/app/page.tsx` using a Zustand-managed navigation state.

**How it works:**

```
User clicks "المباريات" (Competitions)
  → navigationStore.setView('competitions')
  → page.tsx reads currentView from store
  → Renders <CompetitionsView /> in place
  → URL stays at / (no page reload)
```

**Navigation state** (`src/store/navigation.ts`):
- `currentView: ViewType` — Which view to display
- `selectedCompetitionId: string | null` — For detail dialogs
- `selectedSchoolId: string | null` — For detail dialogs
- `searchQuery: string` — For search view
- `competitionFilters / schoolFilters` — Active filters

**ViewType** (`src/types/index.ts`):
```typescript
type ViewType = 
  | 'home' | 'competitions' | 'competition-detail' 
  | 'schools' | 'school-detail' | 'categories' 
  | 'search' | 'favorites' | 'comparison' 
  | 'stats' | 'cities' | 'calendar' 
  | 'faq' | 'reminders' | 'applications' | 'profile';
```

**Why SPA-style instead of page routing?**
- Faster view transitions (no server round-trip)
- State persistence across views (filters, search, scroll position)
- Shared dialog state (competition/school detail dialogs remain open)
- Simpler navigation for RTL Arabic layout
- Better mobile UX with bottom navigation bar

### Component Architecture

```
page.tsx (Root SPA Controller)
├── Providers (Theme, QueryClient, Toast)
├── Header (Navigation + NotificationBell + UserProfileMenu)
├── Breadcrumb (Current view path)
├── Main Content Area (renderView switch)
│   ├── HomeView
│   │   ├── HeroSection
│   │   ├── QuickStatsBar
│   │   ├── FeaturedCompetitions / OpenCompetitionsSection
│   │   ├── FeaturedSchools / SchoolsSection
│   │   ├── CategoriesGrid
│   │   ├── DeadlineTimeline
│   │   ├── RecentlyViewedSection
│   │   ├── TestimonialsSection
│   │   ├── TipsSection
│   │   ├── NewsSection
│   │   ├── NewsletterSection
│   │   └── HowItWorksSection
│   ├── CompetitionsView (filters + cards + pagination)
│   ├── SchoolsView (filters + cards + pagination)
│   ├── SearchView (search + filters + results)
│   ├── CategoriesView (grid + navigation)
│   ├── FavoritesView (grouped favorites)
│   ├── ComparisonView (side-by-side table)
│   ├── StatsView (charts + rankings)
│   ├── CitiesExplorerView (region tabs + city cards)
│   ├── CalendarView (monthly grid + deadlines)
│   ├── FaqView (accordion + search)
│   ├── RemindersView (upcoming + past reminders)
│   ├── ApplicationsView (tracker with statuses)
│   ├── UserProfileView (profile + settings)
│   └── AdminDashboard (CRUD tabs + login)
├── CompetitionDetailDialog (modal overlay)
├── SchoolDetailDialog (modal overlay)
├── ShareDialog (social sharing)
├── BackToTop (floating button)
├── MobileBottomNav (mobile bottom bar)
└── Footer
```

### State Management

**Zustand Stores** (`src/store/`):

| Store | File | Purpose | Persistence |
|---|---|---|---|
| Navigation | `navigation.ts` | Current view, filters, selections | None |
| User Auth | `user-auth.ts` | User session state | None |
| Admin Auth | `admin-auth.ts` | Admin session state | None |
| Favorites | `favorites.ts` | Bookmarked items | localStorage |
| Recently Viewed | `recently-viewed.ts` | Browsing history | localStorage |
| Comparison | `comparison.ts` | Items being compared | localStorage |
| Reminders | `reminders.ts` | Competition reminders | localStorage |
| Applications | `applications.ts` | Application tracker | localStorage |
| Onboarding | `onboarding.ts` | First-visit guide | localStorage |

**TanStack Query** handles all server state:
- Automatic caching and background refetching
- Loading/error states for every data-fetching component
- Query invalidation on mutations
- Centralized in `src/lib/api.ts`

### RTL Arabic Layout

The entire platform is built RTL-first:
- `dir="rtl"` on the root HTML element
- Tailwind CSS RTL-aware utilities
- Arabic typography with proper line heights
- Navigation flows right-to-left
- Form inputs aligned for Arabic text

---

## Backend Architecture | هيكل الخادم

### API Routes Structure

API routes follow Next.js App Router convention (`src/app/api/`):

```
src/app/api/
├── competitions/              # Competition CRUD
│   ├── route.ts               # GET (list), POST (create)
│   ├── [id]/route.ts          # GET (detail), PUT (update), DELETE
│   └── auto-update-status/    # POST (auto status update)
├── schools/                   # School CRUD
│   ├── route.ts               # GET (list), POST (create)
│   └── [id]/route.ts          # GET (detail), PUT (update), DELETE
├── categories/route.ts        # GET (list), POST (create)
├── cities/route.ts            # GET (list)
├── regions/route.ts           # GET (list)
├── levels/route.ts            # GET (list)
├── search/                    # Search
│   ├── route.ts               # GET (search)
│   └── suggestions/route.ts   # GET (autocomplete)
├── news/                      # News CRUD
│   ├── route.ts               # GET (list), POST (create)
│   └── [id]/route.ts          # GET, PUT, DELETE
├── notifications/route.ts     # GET, PUT, POST, DELETE
├── settings/route.ts          # GET, PUT
├── dashboard/stats/route.ts   # GET (statistics)
├── seed/route.ts              # POST (data seeding)
├── auth/[...nextauth]/route.ts # NextAuth.js handler
├── admin/                     # Admin-specific
│   ├── session/route.ts       # GET (session check)
│   ├── activity/route.ts      # GET (logs), POST (log action)
│   └── seed/route.ts          # POST (admin user creation)
└── user/                      # User account APIs
    ├── auth/
    │   ├── signup/route.ts    # POST (register)
    │   ├── login/route.ts    # POST (login)
    │   ├── logout/route.ts   # POST (logout)
    │   ├── session/route.ts  # GET (session info)
    │   └── reset-password/route.ts # PUT (change password)
    ├── profile/route.ts      # GET, PUT
    ├── favorites/route.ts    # GET, POST, DELETE
    ├── reminders/route.ts    # GET, POST, PUT, DELETE
    ├── applications/route.ts # GET, POST, DELETE
    └── notifications/route.ts # GET, PUT
```

### Services Pattern

The backend follows a **thin controller** pattern:
- **Route handlers** (`route.ts`) handle HTTP parsing, validation, and responses
- **Prisma** is used directly in route handlers (no separate service layer for simple CRUD)
- **Auth guards** (`requireAdminAuth`, `requireUserAuth`) protect sensitive endpoints
- **Configuration** is centralized in `src/config/`

### Data Flow

```
UI Component
    │
    ├── TanStack Query (useQuery / useMutation)
    │       │
    │       └── fetchApi<T>() from src/lib/api.ts
    │               │
    │               └── fetch('/api/endpoint')
    │                       │
    │                       └── Next.js API Route Handler
    │                               │
    │                               ├── Auth Guard (optional)
    │                               │
    │                               ├── Validation
    │                               │
    │                               └── Prisma Query
    │                                       │
    │                                       └── SQLite (db/custom.db)
    │
    └── Zustand Store (local state, no server)
            │
            └── localStorage (persistence)
```

---

## Admin System Isolation | عزل نظام الإدارة

The admin system is **architecturally isolated** from the public platform:

```
src/
├── admin-system/              ← Isolated admin module
│   ├── auth/                  ← Separate auth config
│   │   ├── admin-config.ts    ← NextAuth options (standalone copy)
│   │   ├── admin-session.ts   ← Session utilities (standalone copy)
│   │   ├── admin-guard.ts     ← API protection (standalone copy)
│   │   └── admin-store.ts     ← Client-side admin auth store
│   ├── components/
│   │   ├── managers/          ← CRUD managers
│   │   │   ├── CompetitionsManager.tsx
│   │   │   ├── SchoolsManager.tsx
│   │   │   ├── CategoriesManager.tsx
│   │   │   ├── NotificationsManager.tsx
│   │   │   └── NewsManager.tsx
│   │   └── shared/            ← Admin-specific UI
│   │       ├── AdminHeader.tsx
│   │       └── TablePagination.tsx
│   ├── hooks/                 ← Admin data + auth hooks
│   ├── services/              ← Admin API client + logger
│   ├── types/                 ← Admin type definitions
│   └── utils/                 ← Admin helpers
├── components/admin/          ← Admin UI components
│   ├── AdminLogin.tsx         ← Login form
│   └── AdminDashboard.tsx     ← Main dashboard
└── lib/auth/                  ← Auth utilities (shared)
    ├── api-guard.ts           ← withAdminAuth wrapper
    ├── session.ts             ← getAdminSession
    └── config.ts              ← authOptions (main copy)
```

**Access mechanism:**
- Admin panel is hidden — no public navigation link
- Access via URL query: `/?admin=true`
- Admin authentication via NextAuth.js (separate from user auth)
- Admin API routes protected with `withAdminAuth()` or `requireAdminAuth()`

**Future subdomain deployment:**
- Set `ADMIN_IS_SEPARATE=true` in ENV
- Set `ADMIN_API_BASE_URL` to external admin server URL
- The `adminConfig.deployment.isSeparate` flag controls this behavior
- Admin components can be extracted to a separate Next.js project

---

## User Auth System | نظام مصادقة المستخدمين

User authentication is **completely separate** from admin auth:

| Aspect | Admin Auth | User Auth |
|---|---|---|
| **Provider** | NextAuth.js v4 | Custom JWT (jose) |
| **Strategy** | JWT (session strategy) | httpOnly cookie |
| **Cookie Name** | `next-auth.session-token` | `bivmor_user_session` |
| **Session Duration** | 24 hours | 7 days |
| **Database Table** | `User` | `PlatformUser` |
| **Password Hashing** | bcryptjs | bcryptjs (12 rounds) |
| **Token Library** | NextAuth internal | jose (HS256) |
| **Login Route** | `/api/auth/callback/credentials` | `/api/user/auth/login` |
| **Session Check** | `/api/admin/session` | `/api/user/auth/session` |
| **Logout Route** | `/api/auth/signout` | `/api/user/auth/logout` |

See [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) for complete documentation.

---

## Config System | نظام الإعدادات

All configuration is **ENV-driven** and centralized in `src/config/`:

```
src/config/
├── index.ts       ← Central export hub
├── env.ts         ← All ENV variables (database, auth, API, features, security)
├── api.ts         ← API endpoint URLs (centralized, portable)
├── auth.ts        ← Admin auth config + User auth config
├── admin.ts       ← Admin route, API, deployment, RBAC config
└── features.ts    ← Feature flags (user accounts, reminders, etc.)
```

**Key design decisions:**
1. **No hardcoded URLs** — All API endpoints defined in `apiConfig`
2. **Feature flags** — Toggle features without code changes
3. **Portable admin** — Admin can be pointed to a different server via `ADMIN_API_BASE_URL`
4. **Environment-specific** — Different values for dev/staging/production

---

## Key Architectural Decisions | القرارات المعمارية

### 1. SPA instead of Multi-Page Routing

**Decision:** Use single-route SPA with Zustand navigation state.

**Why:**
- Competition/school detail dialogs need to persist across "page" changes
- Filter state should be preserved when navigating back
- Faster perceived performance (no full page reloads)
- Better for mobile bottom navigation pattern

**Trade-off:** Loses URL-based deep linking and SEO per view. Can be mitigated with hash-based routing in the future.

### 2. Dual Authentication System

**Decision:** Separate auth systems for admin (NextAuth) and users (custom JWT).

**Why:**
- Admin needs RBAC with role-based access (ADMIN, EDITOR, MODERATOR)
- User auth should be lightweight without NextAuth overhead
- Different session durations (24h admin vs 7d user)
- Admin system may be deployed separately in the future
- Security isolation: compromising one system doesn't compromise the other

### 3. SQLite over PostgreSQL

**Decision:** Use SQLite via Prisma.

**Why:**
- Zero-configuration deployment
- Single-file database easy to backup
- Sufficient for expected traffic volume
- Easy local development
- Can migrate to PostgreSQL later via Prisma migrations

**Trade-off:** No concurrent write scaling. Suitable for low-to-medium traffic.

### 4. Admin System Isolation

**Decision:** Separate `/admin-system/` folder with standalone auth copies.

**Why:**
- Admin can be extracted to a separate deployment (subdomain)
- Code isolation improves security
- Different deployment and scaling needs
- Admin code doesn't bloat public bundle

### 5. localStorage + Server Sync for User Data

**Decision:** Favorites, reminders, and applications stored in localStorage, with server sync when logged in.

**Why:**
- Unauthenticated users can still use favorites/reminders/applications
- Instant UI updates without waiting for API
- Server sync when logged in provides cross-device access
- Graceful degradation (works offline)

### 6. ENV-Driven Feature Flags

**Decision:** All features configurable via environment variables.

**Why:**
- Toggle features without code deployment
- A/B testing capability
- Environment-specific feature availability
- Gradual rollout support

---

## Multi-Deployment Readiness | جاهزية النشر المتعدد

The architecture supports multiple deployment scenarios:

### Current: Single Server
```
[bivmor.com] → Next.js (public + admin)
```

### Future: Separate Admin Subdomain
```
[bivmor.com]     → Next.js (public only)
[admin.bivmor.com] → Next.js (admin only)
```
Set `ADMIN_IS_SEPARATE=true` and `ADMIN_API_BASE_URL=https://admin-api.bivmor.com`.

### Future: API-Only Backend
```
[bivmor.com]     → Static/CDN (frontend)
[api.bivmor.com] → Node.js API (backend)
```
Update `NEXT_PUBLIC_API_BASE_URL` to point to the API server.

---

## Performance Considerations | اعتبارات الأداء

1. **Prisma Singleton** — Single PrismaClient instance via `globalThis` pattern in `src/lib/db.ts`
2. **TanStack Query Caching** — API responses cached with configurable stale times
3. **Lazy Component Loading** — Heavy components (Recharts, comparison) can be code-split
4. **Image Optimization** — Next.js Image component ready (needs actual image hosting)
5. **CSS Utility Classes** — Complex animations defined once in `globals.css`, not duplicated
6. **localStorage Caching** — Favorites/reminders available instantly without API calls
