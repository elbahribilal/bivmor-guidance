# BIVMOR - Data Flow Documentation

> How data flows from Database → API → Frontend across all major features.

---

## Overview: Data Flow Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   SQLite DB  │◄───►│  Prisma ORM  │◄───►│  API Routes      │
│  (custom.db) │     │  (db.ts)     │     │  (/api/...)       │
└─────────────┘     └──────────────┘     └──────┬───────────┘
                                                  │
                                          HTTP JSON Response
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │  API Client      │
                                         │  (lib/api.ts)    │
                                         └──────┬───────────┘
                                                  │
                                         TanStack Query / fetch
                                                  │
                                                  ▼
                                         ┌──────────────────┐
                                         │  React Components│
                                         │  + Zustand Stores│
                                         └──────────────────┘
```

---

## Competition Data Flow

### Read: Listing Competitions

```
1. User navigates to Competitions view
       │
       ▼
2. CompetitionsView.tsx renders
       │
       ▼
3. useQuery({ queryKey: ['competitions', filters] })
       │
       ▼
4. competitionsApi.list(filters) → fetch('/api/competitions?cityId=...&status=...')
       │
       ▼
5. GET /api/competitions handler
       │
       ▼
6. Parse query params → build Prisma where clause
       │
       ▼
7. db.competition.findMany({ where, include: { city, school, category, level }, skip, take })
   db.competition.count({ where })
       │
       ▼
8. Return { data: [...], pagination: { page, limit, total, totalPages } }
       │
       ▼
9. TanStack Query caches result under ['competitions', filters] key
       │
       ▼
10. Component renders CompetitionCard[] with data
```

### Read: Competition Detail

```
1. User clicks CompetitionCard
       │
       ▼
2. useNavigationStore.setSelectedCompetition(id)
   → currentView = 'competition-detail'
       │
       ▼
3. CompetitionDetailDialog detects selectedCompetitionId change
       │
       ▼
4. useQuery({ queryKey: ['competition', id] })
       │
       ▼
5. competitionsApi.get(id) → fetch('/api/competitions/{id}')
       │
       ▼
6. db.competition.findUnique({ where: { id }, include: { city: { include: { region } }, school, category, level, tags: { include: { tag } } } })
       │
       ▼
7. Dialog opens with full competition data
       │
       ▼
8. Also tracks in recently-viewed store: recentlyViewedStore.addItem({ type: 'competition', id, title })
```

### Write: Admin Creates Competition

```
1. Admin clicks "إضافة مباراة" in AdminDashboard
       │
       ▼
2. CompetitionFormDialog opens
       │
       ▼
3. Admin fills form and submits
       │
       ▼
4. competitionsApi.create(formData) → POST /api/competitions
       │
       ▼
5. withAdminAuth validates session
       │
       ▼
6. db.competition.create({ data: { title, slug, ... } })
       │
       ▼
7. db.adminAuditLog.create({ action: 'CREATE', entity: 'competition' })
       │
       ▼
8. Return { data: competition }
       │
       ▼
9. queryClient.invalidateQueries({ queryKey: ['competitions'] })
       │
       ▼
10. Competitions list refreshes, new competition appears
```

### Auto-Status Update

```
1. Trigger: Admin clicks "تحديث الحالات" or cron job fires
       │
       ▼
2. POST /api/competitions/auto-update-status
       │
       ▼
3. Database bulk updates:
   - OPEN + deadline < now → EXPIRED
   - UPCOMING + startDate <= now → OPEN
   - UPCOMING + deadline < now → EXPIRED
       │
       ▼
4. Return { updatedCount, details }
       │
       ▼
5. Admin sees update count, lists refresh
```

---

## School Data Flow

### Read: Listing Schools

```
1. User navigates to Schools view
       │
       ▼
2. SchoolsView.tsx renders
       │
       ▼
3. useQuery({ queryKey: ['schools', filters] })
       │
       ▼
4. schoolsApi.list(filters) → fetch('/api/schools?cityId=...&type=...')
       │
       ▼
5. db.school.findMany({ where, include: { city, category, level, _count: { select: { competitions: true } } } })
       │
       ▼
6. Return paginated results with competition counts
       │
       ▼
7. SchoolCard[] renders with type badges and competition counts
```

### Read: School Detail

```
1. User clicks SchoolCard
       │
       ▼
2. useNavigationStore.setSelectedSchool(id)
       │
       ▼
3. SchoolDetailDialog detects selectedSchoolId change
       │
       ▼
4. useQuery({ queryKey: ['school', id] })
       │
       ▼
5. db.school.findUnique({ where: { id }, include: { city: { include: { region } }, category, level, competitions: { include: { category } }, media } })
       │
       ▼
6. Dialog shows school info + related competitions list
       │
       ▼
7. recentlyViewedStore.addItem({ type: 'school', id, name })
```

---

## Search Flow

```
1. User types query in SearchBar
       │
       ▼
2. Debounced input → useNavigationStore.setSearchQuery(q)
   useNavigationStore.setView('search')
       │
       ▼
3. SearchView renders with query
       │
       ▼
4. useQuery({ queryKey: ['search', filters] })
       │
       ▼
5. searchApi.search({ q, cityId, categoryId, levelId, type })
   → fetch('/api/search?q=مباراة&cityId=...&type=competition')
       │
       ▼
6. GET /api/search handler
       │
       ▼
7. Parallel queries:
   const competitions = db.competition.findMany({ where: { title: { contains: q } } })
   const schools = db.school.findMany({ where: { name: { contains: q } } })
       │
       ▼
8. Merge results into SearchResult[] with type discriminator:
   [
     { type: 'competition', id, title, slug, description, city, status },
     { type: 'school', id, title, slug, description, city, schoolType },
     ...
   ]
       │
       ▼
9. Frontend renders mixed results list with type badges
```

### Autocomplete/Suggestions Flow

```
1. User types in SearchBar (before pressing Enter)
       │
       ▼
2. Debounced (300ms) fetch to /api/search/suggestions?q=مب
       │
       ▼
3. db.competition.findMany({ where: { title: { contains: q } }, take: 5 })
   db.school.findMany({ where: { name: { contains: q } }, take: 5 })
       │
       ▼
4. Return dropdown suggestions
```

---

## User Authentication Flow

### Signup

```
1. User clicks "إنشاء حساب" in UserAuthModal
       │
       ▼
2. POST /api/user/auth/signup { email, password, name }
       │
       ▼
3. Validate: email not taken, password length
       │
       ▼
4. hash = bcryptjs.hash(password, 12)
       │
       ▼
5. db.platformUser.create({ data: { email, password: hash, name } })
       │
       ▼
6. token = SignJWT({ id, email, name }).sign(JWT_SECRET)
       │
       ▼
7. Set cookie: bivmor_user_session = token
       │
       ▼
8. Return { user: { id, email, name }, token }
       │
       ▼
9. userAuthStore.setUser({ id, email, name })
       │
       ▼
10. UI updates: show user menu instead of login button
```

### Login

```
1. User enters credentials in UserAuthModal
       │
       ▼
2. POST /api/user/auth/login { email, password }
       │
       ▼
3. db.platformUser.findUnique({ where: { email } })
       │
       ▼
4. bcryptjs.compare(password, storedHash)
       │
       ▼
5. If valid: SignJWT → set cookie → return user
       │
       ▼
6. If invalid: Return 401 { error: 'بيانات الدخول غير صحيحة' }
```

### Session Check

```
1. App loads → userAuthStore.checkSession()
       │
       ▼
2. GET /api/user/auth/session
       │
       ▼
3. requireUserAuth reads cookie → jwtVerify → return user
       │
       ▼
4. If valid: userAuthStore.setUser(data)
   If invalid: userAuthStore remains logged out
```

### Protected User APIs

```
1. User clicks "Add to Favorites" while logged in
       │
       ▼
2. POST /api/user/favorites { itemId, itemType }
       │
       ▼
3. requireUserAuth validates JWT
       │
       ▼
4. db.userFavorite.create({ data: { userId, itemId, itemType } })
       │
       ▼
5. Favorite is now synced to database (not just localStorage)
```

---

## Admin Authentication Flow

```
1. Admin navigates to /?admin=true
       │
       ▼
2. adminAuthStore.checkSession()
       │
       ▼
3. GET /api/admin/session
       │
       ▼
4. getServerSession(authOptions) → NextAuth JWT verification
       │
       ▼
5. If authenticated: Return { authenticated: true, user }
   If not: Return { authenticated: false }
       │
       ▼
6. AdminLogin shows if not authenticated
       │
       ▼
7. Admin submits credentials
       │
       ▼
8. POST /api/auth/callback/credentials (NextAuth)
       │
       ▼
9. CredentialsProvider.authorize():
   - db.user.findUnique({ where: { email } })
   - bcryptjs.compare(password, hash)
   - Check role is ADMIN or EDITOR
   - Return user object
       │
       ▼
10. NextAuth creates JWT session → sets cookie
       │
       ▼
11. All subsequent admin API calls use session cookie
       │
       ▼
12. requireAdminAuth() on each protected route validates session
```

---

## Favorites Flow

### Client-Only (Not Logged In)

```
1. User clicks FavoriteButton on competition card
       │
       ▼
2. favoritesStore.addItem({ type: 'competition', id, title })
       │
       ▼
3. Zustand persist middleware writes to localStorage:
   key: 'bivmor-favorites'
   value: { state: { items: [...] }, version: 0 }
       │
       ▼
4. Heart icon fills, FavoritesView shows the item
```

### Synced to DB (Logged In)

```
1. User clicks FavoriteButton while logged in
       │
       ▼
2. favoritesStore.addItem() (localStorage for instant UI)
       │
       ▼
3. POST /api/user/favorites { itemId: id, itemType: 'competition' }
       │
       ▼
4. requireUserAuth validates JWT
       │
       ▼
5. db.userFavorite.create({ data: { userId, itemId, itemType } })
       │
       ▼
6. Favorite persists across devices and sessions
```

### Loading Favorites on Login

```
1. User logs in
       │
       ▼
2. GET /api/user/favorites
       │
       ▼
3. db.userFavorite.findMany({ where: { userId } })
       │
       ▼
4. Merge server favorites with localStorage favorites
       │
       ▼
5. Update favoritesStore with merged result
```

---

## Notifications Flow

### System Notifications (Admin-Generated)

```
1. Admin creates notification in AdminDashboard
       │
       ▼
2. POST /api/notifications { title, message, type }
       │
       ▼
3. db.notification.create({ data: { title, message, type } })
       │
       ▼
4. NotificationBell polls every 30 seconds:
   GET /api/notifications?limit=10
       │
       ▼
5. db.notification.findMany({ orderBy: { createdAt: 'desc' } })
   + db.notification.count({ where: { isRead: false } })
       │
       ▼
6. Return { data: [...notifications], unreadCount: 3 }
       │
       ▼
7. Bell shows unread count badge
       │
       ▼
8. User clicks bell → dropdown shows notifications
       │
       ▼
9. User clicks notification → PUT /api/notifications { markReadId: id }
       │
       ▼
10. db.notification.update({ where: { id }, data: { isRead: true } })
```

### User Notifications (Personalized)

```
1. System event triggers (deadline approaching, etc.)
       │
       ▼
2. db.userNotification.create({ data: { userId, title, message, type, link } })
       │
       ▼
3. GET /api/user/notifications (authenticated)
       │
       ▼
4. db.userNotification.findMany({ where: { userId } })
       │
       ▼
5. Show in user's notification panel
```

---

## Settings Flow

```
1. Admin modifies settings in AdminDashboard → Settings tab
       │
       ▼
2. PUT /api/settings { settings: { site_name: 'مباريات المغرب', hero_title: '...', seo_description: '...' } }
       │
       ▼
3. withAdminAuth validates admin session
       │
       ▼
4. For each key-value pair:
   db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value, type } })
       │
       ▼
5. Return updated settings map
       │
       ▼
6. Frontend components read settings from API
```

### Reading Settings (Public)

```
1. GET /api/settings
       │
       ▼
2. db.siteSetting.findMany()
       │
       ▼
3. Return { data: { site_name: '...', hero_title: '...', ... } }
       │
       ▼
4. Components use settings for dynamic content (titles, footer text, etc.)
```

---

## Reminders Flow

### Client-Side (Default)

```
1. User clicks ReminderButton in CompetitionDetailDialog
       │
       ▼
2. Dialog opens: "تذكير قبل" options (1hr, 1day, 3days, 1week)
       │
       ▼
3. remindersStore.addReminder({ competitionId, reminderDate, notes })
       │
       ▼
4. Zustand persist writes to localStorage: 'bivmor-reminders'
       │
       ▼
5. RemindersView shows upcoming reminders with countdown
```

### Server-Side Sync (When Logged In)

```
1. User sets reminder while logged in
       │
       ▼
2. POST /api/user/reminders { competitionId, reminderDate, notes }
       │
       ▼
3. db.userReminder.create({ data: { userId, competitionId, reminderDate, notes } })
       │
       ▼
4. Reminder persists to database, survives device changes
```

---

## Applications Flow

### Client-Side Status Tracking

```
1. User clicks ApplicationTrackerButton in CompetitionDetailDialog
       │
       ▼
2. Dialog shows current status with options:
   لم أبدأ → أحضّر → قدّمت → قيد المراجعة → مقبول/مرفوض
       │
       ▼
3. applicationsStore.addOrUpdate({ competitionId, status, notes })
       │
       ▼
4. Zustand persist writes to localStorage: 'bivmor-applications'
       │
       ▼
5. ApplicationsView shows all tracked applications with status badges
```

### Server-Side Sync (When Logged In)

```
1. POST /api/user/applications { competitionId, status, notes }
       │
       ▼
2. db.userApplication.upsert({
     where: { userId_competitionId: { userId, competitionId } },
     update: { status, notes },
     create: { userId, competitionId, status, notes }
   })
```

---

## Recently Viewed Flow

```
1. User clicks CompetitionCard or SchoolCard
       │
       ▼
2. Component calls recentlyViewedStore.addItem({ type, id, title, timestamp })
       │
       ▼
3. Store maintains max 10 items, deduplicates by id
       │
       ▼
4. Zustand persist writes to localStorage: 'bivmor-recently-viewed'
       │
       ▼
5. RecentlyViewedSection on home page shows last 6 items
       │
       ▼
6. Items are clickable → navigate to detail dialog
```

---

## Comparison Flow

```
1. User clicks "مقارنة" button on CompetitionCard or SchoolCard
       │
       ▼
2. comparisonStore.addItem({ type: 'competition', id, title })
       │
       ▼
3. Store enforces max 4 items, same type only
       │
       ▼
4. Zustand persist writes to localStorage: 'bivmor-comparison'
       │
       ▼
5. ComparisonView reads items from store
       │
       ▼
6. For each item: useQuery(['competition', id]) fetches full data
       │
       ▼
7. Side-by-side comparison table renders with all fields
```

---

## Dashboard Stats Flow

```
1. User navigates to Stats view (or admin dashboard)
       │
       ▼
2. useQuery({ queryKey: ['dashboard-stats'] })
       │
       ▼
3. GET /api/dashboard/stats
       │
       ▼
4. Parallel Prisma queries:
   - db.competition.count() (total, by status)
   - db.school.count() (total, by type)
   - db.category.count()
   - db.competition.findMany({ include: { city, school, category } })
       │
       ▼
5. Return aggregated DashboardStats object
       │
       ▼
6. StatsView renders charts using recharts:
   - Status donut chart
   - Type donut chart
   - City bar chart
   - Category bar chart
   - Top schools bar chart
   - Deadline timeline
```

---

## Data Flow Summary

| Feature | Storage | API Protected | Sync to DB |
|---------|---------|---------------|------------|
| Competitions (read) | — | No (public) | — |
| Schools (read) | — | No (public) | — |
| Search | — | No (public) | — |
| Admin CRUD | — | Yes (NextAuth) | Yes |
| User Auth | JWT cookie | Yes (custom JWT) | Yes |
| Favorites | localStorage + DB | Yes (when logged in) | Optional |
| Reminders | localStorage + DB | Yes (when logged in) | Optional |
| Applications | localStorage + DB | Yes (when logged in) | Optional |
| Comparison | localStorage | No | No |
| Recently Viewed | localStorage | No | No |
| Notifications (system) | — | Partial | Yes |
| User Notifications | — | Yes | Yes |
| Settings | — | Yes (admin) | Yes |
| Dashboard Stats | — | No (public) | — |
