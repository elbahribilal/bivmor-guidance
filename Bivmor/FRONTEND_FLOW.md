# BIVMOR - Frontend Architecture & Flow

> Documentation of the frontend architecture, navigation system, state management, and rendering patterns.

---

## SPA-Style Navigation

BIVMOR is built as a **Single Page Application** within Next.js. Instead of using traditional page routing, the entire app lives in a single `src/app/page.tsx` file, and view switching is managed by a Zustand store.

### How It Works

```
User clicks nav item
       │
       ▼
useNavigationStore.setView(viewType)
       │
       ▼
currentView state updates
       │
       ▼
page.tsx renderView() switch
       │
       ▼
Correct view component renders
```

### ViewType Definition

From `src/types/index.ts`:

```typescript
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
```

### The Main Page Component

`src/app/page.tsx` has two rendering paths:

1. **Admin Route** (`?admin=true`): Shows `AdminDashboard` or `AdminLogin`
2. **Public Route** (default): Shows the public SPA with Header, Footer, and view content

```typescript
function PageContent() {
  const { currentView } = useNavigationStore();
  const { isAuthenticated } = useAdminAuthStore();
  const searchParams = useSearchParams();
  const isAdminRoute = searchParams.get('admin') === 'true';

  if (isAdminRoute) {
    return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':          return <HomeView />;
      case 'competitions':  return <CompetitionsView />;
      case 'schools':       return <SchoolsView />;
      case 'categories':    return <CategoriesView />;
      case 'search':        return <SearchView />;
      case 'favorites':     return <FavoritesView />;
      case 'stats':         return <StatsView />;
      case 'comparison':    return <ComparisonView />;
      case 'cities':        return <CitiesExplorerView />;
      case 'faq':           return <FaqView />;
      case 'calendar':      return <CalendarView />;
      case 'reminders':     return <RemindersView />;
      case 'applications':  return <ApplicationsView />;
      case 'profile':       return <UserProfileView />;
      case 'competition-detail':
      case 'school-detail':
        return <HomeView />; // Detail is shown via always-mounted dialog
      default:
        return <HomeView />;
    }
  };
  // ...
}
```

---

## Component Hierarchy

```
<HomePage>
  ├── <Suspense>
  │   └── <PageContent>
  │       │
  │       ├── [Admin Path]
  │       │   ├── <AdminLogin />       (if not authenticated)
  │       │   └── <AdminDashboard />   (if authenticated)
  │       │       ├── AdminHeader
  │       │       ├── Tab panels (Competitions, Schools, Categories, News, Notifications, Settings, Activity)
  │       │       └── Managers (CompetitionsManager, SchoolsManager, etc.)
  │       │
  │       └── [Public Path]
  │           ├── <Header />
  │           │   ├── Logo (clickable → goHome)
  │           │   ├── Navigation Links (6 primary + dropdown)
  │           │   ├── NotificationBell
  │           │   ├── ThemeToggle
  │           │   └── UserProfileMenu / LoginButton
  │           │
  │           ├── <Breadcrumb />
  │           │
  │           ├── <main> (flex-1)
  │           │   └── <ErrorBoundary>
  │           │       └── <PageTransition> (framer-motion)
  │           │           └── {renderView()} → specific view
  │           │
  │           ├── <Footer />
  │           │
  │           ├── <CompetitionDetailDialog />  ← Always mounted
  │           ├── <SchoolDetailDialog />       ← Always mounted
  │           ├── <WelcomeGuide />
  │           ├── <BackToTop />
  │           ├── <MobileBottomNav />
  │           ├── <UserAuthModal />
  │           └── <KeyboardShortcuts />
```

---

## Detail Dialogs (Always Mounted Pattern)

Both `CompetitionDetailDialog` and `SchoolDetailDialog` are **always mounted** in the DOM. They use the `selectedCompetitionId` / `selectedSchoolId` from the navigation store to determine what to display.

### Why Always Mounted?

1. **Instant display**: Dialog opens immediately without mounting delay
2. **Animation**: framer-motion enter/exit animations work smoothly
3. **Context**: Any component can open the dialog by calling `setSelectedCompetition(id)` or `setSelectedSchool(id)`
4. **Data sharing**: The dialog can be opened from any view (home cards, search results, comparison table, city explorer, etc.)

### Flow

```
User clicks competition card
       │
       ▼
CompetitionCard onClick →
  useNavigationStore.setSelectedCompetition(id)
       │
       ▼
navigation store updates:
  selectedCompetitionId = id
  currentView = 'competition-detail'
       │
       ▼
CompetitionDetailDialog detects selectedCompetitionId
       │
       ▼
useQuery fetches competition data via competitionsApi.get(id)
       │
       ▼
Dialog opens with fetched data
```

---

## State Management

### Zustand Stores (Client-Side State)

| Store | File | Persistence | Purpose |
|-------|------|-------------|---------|
| Navigation | `src/store/navigation.ts` | None | Current view, selected IDs, filters |
| Admin Auth | `src/store/admin-auth.ts` | None | Admin authentication state |
| User Auth | `src/store/user-auth.ts` | None | User authentication state |
| Favorites | `src/store/favorites.ts` | localStorage | Bookmarked competitions/schools |
| Comparison | `src/store/comparison.ts` | localStorage | Items selected for comparison |
| Reminders | `src/store/reminders.ts` | localStorage | Competition deadline reminders |
| Applications | `src/store/applications.ts` | localStorage | Application tracking statuses |
| Recently Viewed | `src/store/recently-viewed.ts` | localStorage | Last 10 viewed items |
| Onboarding | `src/store/onboarding.ts` | localStorage | Welcome guide dismissed state |

### localStorage Persistence Pattern

Stores that need persistence use Zustand's `persist` middleware:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      // ...
    }),
    {
      name: 'bivmor-favorites', // localStorage key
    }
  )
);
```

### TanStack Query (Server State)

TanStack Query manages all server-fetched data with automatic caching, refetching, and loading states:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['competitions', filters],
  queryFn: () => competitionsApi.list(filters),
});
```

**Query Key Patterns:**

| Data | Query Key | API |
|------|-----------|-----|
| Competitions list | `['competitions', filters]` | `competitionsApi.list()` |
| Single competition | `['competition', id]` | `competitionsApi.get(id)` |
| Schools list | `['schools', filters]` | `schoolsApi.list()` |
| Single school | `['school', id]` | `schoolsApi.get(id)` |
| Categories | `['categories']` | `categoriesApi.list()` |
| Cities | `['cities']` | `citiesApi.list()` |
| Regions | `['regions']` | `regionsApi.list()` |
| Dashboard stats | `['dashboard-stats']` | `dashboardApi.stats()` |
| Notifications | `['notifications']` | `notificationsApi.list()` |
| Search results | `['search', filters]` | `searchApi.search()` |
| News | `['news', filters]` | `newsApi.list()` |

**Mutation Pattern:**

```typescript
const mutation = useMutation({
  mutationFn: (data) => competitionsApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['competitions'] });
    toast.success('تم إنشاء المباراة بنجاح');
  },
  onError: (error) => {
    toast.error('حدث خطأ أثناء إنشاء المباراة');
  },
});
```

---

## Theme System

### Implementation: next-themes

The app supports **light** and **dark** modes via `next-themes`.

**Setup in `src/app/layout.tsx`:**

```typescript
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

**Toggle in Header:**

```typescript
import { useTheme } from 'next-themes';
const { theme, setTheme } = useTheme();
// Toggle: setTheme(theme === 'dark' ? 'light' : 'dark')
```

### CSS Variable System

All colors are defined as CSS variables using oklch color space in `globals.css`:

```css
:root {
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  /* ... */
}

.dark {
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  /* ... */
}
```

Components use Tailwind CSS variable classes:

```html
<div class="bg-background text-foreground">
<div class="bg-primary text-primary-foreground">
<div class="bg-muted text-muted-foreground">
```

### Custom Emerald Theme

The platform uses an **emerald/teal** color scheme for brand identity, applied through:
- Gradient backgrounds: `from-emerald-600 to-teal-600`
- Accent borders: `border-emerald-500`
- Interactive states: `hover:bg-emerald-50`, `focus:ring-emerald-500`
- Custom CSS classes: `.glass-card-emerald`, `.gradient-text`

---

## RTL Arabic Layout

### HTML Setup

```html
<html lang="ar" dir="rtl">
```

Set in `src/app/layout.tsx`. This affects:
- Text alignment (right-aligned by default)
- Flex direction (row reverses to right-to-left)
- Margin/padding (start/end instead of left/right)
- Scroll direction

### RTL Considerations in Code

1. **CSS**: `[dir="rtl"]` selectors in `globals.css` for specific adjustments
2. **Spacing**: Use `ms-` / `me-` (margin-start/margin-end) instead of `ml-` / `mr-`
3. **Icons**: Arrow icons flip automatically with `rtl:rotate-180`
4. **Toast**: RTL positioning via `[dir="rtl"] [data-sonner-toaster]`
5. **ScrollArea**: RTL scroll behavior handled by Radix UI

### Bilingual Data

Many database fields support both Arabic and French names:
- `nameAr` / `nameFr` for regions, cities, levels
- Primary display uses Arabic names
- Search supports both Arabic and French text

---

## Responsive Design

### Breakpoints

| Breakpoint | Width | Target |
|-----------|-------|--------|
| Default | 0-639px | Mobile phones |
| `sm:` | 640px+ | Large phones |
| `md:` | 768px+ | Tablets |
| `lg:` | 1024px+ | Desktops |
| `xl:` | 1280px+ | Large screens |

### Mobile-First Patterns

1. **Navigation**: Desktop uses top `Header`; Mobile uses `MobileBottomNav`
   ```html
   <Header /> <!-- visible on all screens -->
   <MobileBottomNav /> <!-- visible only on mobile (lg:hidden) -->
   ```

2. **Grid layouts**: Start with 1-2 columns, expand on larger screens
   ```html
   <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
   ```

3. **Touch targets**: Minimum 44px for interactive elements
4. **Mobile bottom padding**: `pb-16 lg:pb-0` for content above `MobileBottomNav`

### Mobile Bottom Navigation

`MobileBottomNav` (`src/components/layout/MobileBottomNav.tsx`) is a fixed bottom bar with 5 items:
- الرئيسية (Home)
- المباريات (Competitions)
- المدارس (Schools)
- البحث (Search)
- المفضلة (Favorites)

Features:
- Animated layout indicator using framer-motion
- Backdrop blur effect
- Safe area padding for iOS devices
- Only visible on screens < `lg` breakpoint

---

## Animation System

### framer-motion

Used throughout for:
- **Page transitions**: `<PageTransition>` wraps view content with `AnimatePresence`
- **Card entrance**: Staggered animations with `containerVariants` + `cardVariants`
- **Dialog animations**: Smooth open/close with `motion.div`
- **Hover effects**: `whileHover={{ scale: 1.04, y: -4 }}`
- **Counter animations**: `AnimatedCounter` with `useInView` for scroll-triggered counting
- **Carousel**: Testimonials auto-rotation
- **Filter pills**: `AnimatePresence` for add/remove

### CSS Animations (`globals.css`)

30+ custom CSS animations:
- `particle-drift`: Hero section floating particles
- `float-badge`: Floating badge animation
- `glow-pulse`: Search bar glow effect
- `shimmer`: Loading shimmer animation
- `float-icon`: Newsletter floating icons
- `focus-ring-pulse`: Input focus ring
- `badge-shimmer`: Badge hover effect
- `bounce-in`: Bouncy entrance animation
- `urgent-pulse`: Deadline urgency indicator
- `gradient-slide`: Animated gradient border

### Utility Classes

| Class | Purpose |
|-------|---------|
| `.card-hover-lift` | Lift card on hover with shadow |
| `.gradient-text` | Emerald-to-teal gradient text |
| `.shimmer-loading` | Skeleton loading shimmer |
| `.glass-card` | Glassmorphism with blur |
| `.glass-card-emerald` | Emerald-tinted glassmorphism |
| `.moroccan-pattern` | Zellige-inspired geometric pattern |
| `.section-divider` | Gradient line with ◆ diamond |
| `.animated-gradient-border` | Sliding gradient border |
| `.badge-shimmer` | Hover shimmer on badges |
| `.inner-glow` | Radial gradient glow inside cards |
| `.pulse-ring` | Animated pulse ring for badges |
| `.card-border-glow` | Border glow on hover |
| `.category-pattern` | Subtle dot pattern for categories |
| `.featured-ribbon` | Animated gradient ribbon on top |
| `.social-ring-hover` | Icon hover ring effect |
| `.detail-info-bar` | Gradient info bar in dialogs |
| `.tip-card-glow` | Emerald glow on tip cards |
| `.calendar-day` | Calendar cell hover/active states |
| `.competition-card-accent` | Status-colored side accent |
| `.newsletter-gradient` | Emerald gradient background |
| `.countdown-celebrate` | Scale animation on zero |
| `.urgent-deadline-pulse` | Pulsing urgency indicator |

---

## Component Communication Patterns

### Parent → Child (Props)
Standard React prop passing for configuration and callbacks.

### Cross-Component (Zustand Store)
Components that don't share a parent communicate via Zustand stores:
- Opening detail dialogs from any view: `setSelectedCompetition(id)`
- Adding to favorites from any card: `favoritesStore.addItem()`
- Adding to comparison: `comparisonStore.addItem()`

### Server Data (TanStack Query)
All server data flows through TanStack Query:
- Components call `useQuery` independently
- Data is cached and deduplicated by query key
- Mutations invalidate relevant caches

### Event-Based (Callbacks)
Some interactions use callback patterns:
- `CompetitionCard onClick` → navigates to detail
- `FavoriteButton onToggle` → updates store + tracks recently viewed
- `SearchBar onSearch` → updates navigation store + switches view

---

## Error Handling

### ErrorBoundary
`src/components/shared/ErrorBoundary.tsx` wraps view content to catch rendering errors.

### API Error Handling
The API client (`src/lib/api.ts`) throws errors for non-200 responses:
```typescript
if (!response.ok) {
  if (response.status === 401 || response.status === 403) {
    throw new Error('غير مصرح بالوصول - يجب تسجيل الدخول أولاً');
  }
  const error = await response.json().catch(() => ({ error: 'Network error' }));
  throw new Error(error.error || `API Error: ${response.status}`);
}
```

### Toast Notifications
All user-facing feedback uses `sonner` toast:
```typescript
import { toast } from 'sonner';
toast.success('تم الحفظ بنجاح');
toast.error('حدث خطأ');
```

### Loading States
Every data-fetching component shows loading skeletons:
- `shimmer-loading` CSS class for skeleton placeholders
- `<Skeleton />` from shadcn/ui for structured placeholders
- Spinner components for inline loading
