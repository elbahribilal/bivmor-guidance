# BIVMOR - Services & Integrations Map

> Complete map of all services, libraries, and integrations used in the platform, with configuration details and extension guides.

---

## Service Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐ │
│  │ Zustand  │  │ TanStack     │  │ shadcn/ui │  │ Framer    │ │
│  │ (State)  │  │ Query        │  │ (UI Kit)  │  │ Motion    │ │
│  └──────────┘  └──────────────┘  └───────────┘  └───────────┘ │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐ │
│  │ Recharts │  │ embla        │  │ Lucide    │  │ Sonner    │ │
│  │ (Charts) │  │ (Carousel)  │  │ (Icons)   │  │ (Toasts)  │ │
│  └──────────┘  └──────────────┘  └───────────┘  └───────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP (fetch)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Next.js API)                        │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────────┐ │
│  │ NextAuth │  │ Custom JWT   │  │ Prisma    │  │ bcryptjs  │ │
│  │ (Admin)  │  │ (User Auth)  │  │ (ORM)     │  │ (Hash)    │ │
│  └──────────┘  └──────────────┘  └───────────┘  └───────────┘ │
│  ┌──────────┐  ┌──────────────┐                                 │
│  │ jose     │  │ zod          │                                 │
│  │ (JWT)    │  │ (Validation) │                                 │
│  └──────────┘  └──────────────┘                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │ Prisma Client
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (SQLite / PostgreSQL)                │
│                    20+ models, 6 enums                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Prisma ORM — Database Access

### Purpose
Type-safe database access layer with auto-generated TypeScript types from the schema.

### Configuration
- **Schema**: `prisma/schema.prisma`
- **Client**: `src/lib/db.ts` (singleton pattern)
- **Database**: SQLite (`file:./db/custom.db`)
- **Connection string**: `DATABASE_URL` env variable

### Usage Pattern
```typescript
import { db } from '@/lib/db';

// Read
const competitions = await db.competition.findMany({
  where: { status: 'OPEN' },
  include: { city: true, school: true },
  orderBy: { deadline: 'asc' },
});

// Write
const competition = await db.competition.create({
  data: { title, slug, status: 'OPEN' },
});

// Count
const total = await db.competition.count({ where: { status: 'OPEN' } });
```

### Available Models
User, PlatformUser, Region, City, Level, Category, School, Competition, Tag, CompetitionTag, Media, Notification, News, SiteSetting, ActivityLog, UserFavorite, UserReminder, UserApplication, UserNotification, AdminAuditLog

### Database Commands
```bash
bun run db:push      # Push schema to database (no migration)
bun run db:generate   # Generate Prisma client
bun run db:migrate    # Create and apply migration
bun run db:reset      # Reset database
```

### Configuration via ENV
```env
DATABASE_URL="file:./db/custom.db"          # SQLite
DATABASE_URL="postgresql://user:pass@host/db" # PostgreSQL
```

### How to Add a New Model
1. Add model definition to `prisma/schema.prisma`
2. Run `bun run db:push` to update database
3. Run `bun run db:generate` to update Prisma client
4. Add TypeScript types to `src/types/index.ts`
5. Create API route in `src/app/api/`
6. Add API client methods in `src/lib/api.ts`

---

## 2. NextAuth.js v4 — Admin Authentication

### Purpose
Handle admin user authentication with credentials-based login and JWT sessions.

### Configuration
- **Auth options**: `src/lib/auth/config.ts`
- **Route handler**: `src/app/api/auth/[...nextauth]/route.ts`
- **API guard**: `src/lib/auth/api-guard.ts`
- **Admin session**: `src/app/api/admin/session/route.ts`

### Provider Setup
```typescript
// src/lib/auth/config.ts
CredentialsProvider({
  id: 'admin-credentials',
  credentials: { email, password },
  authorize: async (credentials) => {
    const user = await db.user.findUnique({ where: { email } });
    const isValid = await compare(password, user.password);
    if (user.role !== 'ADMIN' && user.role !== 'EDITOR') throw new Error('No access');
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  },
})
```

### Session Strategy
- **Type**: JWT (not database sessions)
- **Max Age**: 24 hours (configurable via `ADMIN_SESSION_MAX_AGE`)
- **Secret**: `NEXTAUTH_SECRET` env variable
- **Cookie**: `next-auth.session-token`

### JWT Callbacks
```typescript
callbacks: {
  jwt: ({ token, user }) => {
    if (user) { token.role = user.role; token.id = user.id; }
    return token;
  },
  session: ({ session, token }) => {
    session.user.role = token.role;
    session.user.id = token.id;
    return session;
  },
}
```

### Configuration via ENV
```env
NEXTAUTH_SECRET="your-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_SESSION_MAX_AGE="86400"    # 24 hours in seconds
```

### How to Add OAuth Providers
```typescript
// In src/lib/auth/config.ts
import GoogleProvider from 'next-auth/providers/google';

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }),
  // ... existing CredentialsProvider
]
```

---

## 3. Custom JWT (jose) — User Authentication

### Purpose
Handle regular platform user authentication with custom JWT tokens stored in httpOnly cookies.

### Configuration
- **Auth library**: `src/lib/auth/user-auth.ts`
- **API guard**: `src/lib/auth/user-guard.ts`
- **Login**: `src/app/api/user/auth/login/route.ts`
- **Signup**: `src/app/api/user/auth/signup/route.ts`

### JWT Implementation
```typescript
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.USER_JWT_SECRET);

// Sign
const token = await new SignJWT({ id, email, name })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .setIssuedAt()
  .sign(JWT_SECRET);

// Verify
const { payload } = await jwtVerify(token, JWT_SECRET);
```

### Cookie Management
```typescript
// Set cookie (server-side)
const cookieStore = await cookies();
cookieStore.set('bivmor_user_session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
});

// Clear cookie (logout)
cookieStore.delete('bivmor_user_session');
```

### Password Hashing
```typescript
import { hash, compare } from 'bcryptjs';

// Hash on signup
const hashedPassword = await hash(password, 12);

// Verify on login
const isValid = await compare(password, hashedPassword);
```

### Configuration via ENV
```env
USER_JWT_SECRET="your-jwt-secret-min-32-chars"
USER_SESSION_MAX_AGE="604800"    # 7 days in seconds
BCRYPT_ROUNDS="12"
```

### How to Add Email Verification
1. Add `emailVerificationToken` field to `PlatformUser` model
2. Add `/api/user/auth/verify-email` route
3. Generate token with `jose`, send via email service
4. Verify token and set `emailVerified` on PlatformUser

---

## 4. Zustand — State Management

### Purpose
Client-side state management with lightweight, hook-based stores. Used for navigation, authentication, and feature stores with localStorage persistence.

### Stores

| Store | File | Persistence | Purpose |
|-------|------|-------------|---------|
| Navigation | `src/store/navigation.ts` | None | View switching, filters, selection |
| Admin Auth | `src/store/admin-auth.ts` | None | Admin login state |
| User Auth | `src/store/user-auth.ts` | None | User login state |
| Favorites | `src/store/favorites.ts` | localStorage | Bookmarked items |
| Comparison | `src/store/comparison.ts` | localStorage | Comparison items (max 4) |
| Reminders | `src/store/reminders.ts` | localStorage | Deadline reminders |
| Applications | `src/store/applications.ts` | localStorage | Application tracking |
| Recently Viewed | `src/store/recently-viewed.ts` | localStorage | Viewed items (max 10) |
| Onboarding | `src/store/onboarding.ts` | localStorage | Welcome guide state |

### Usage Pattern
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Without persistence
export const useNavigationStore = create<NavigationState>((set) => ({
  currentView: 'home',
  setView: (view) => set({ currentView: view }),
}));

// With localStorage persistence
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
    }),
    { name: 'bivmor-favorites' }
  )
);
```

### How to Add a New Store
1. Create `src/store/your-store.ts`
2. Define state interface and actions
3. Add `persist` middleware if localStorage needed
4. Use in components: `const { items, addItem } = useYourStore();`

---

## 5. TanStack Query — Server State

### Purpose
Manage server-fetched data with automatic caching, background refetching, and loading/error states.

### Configuration
- **Provider**: `src/components/Providers.tsx`
- **Usage**: All data-fetching components

### Provider Setup
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Usage Patterns

**Query (Read):**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['competitions', filters],
  queryFn: () => competitionsApi.list(filters),
});
```

**Mutation (Write):**
```typescript
const mutation = useMutation({
  mutationFn: (data) => competitionsApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['competitions'] });
    toast.success('تم الإنشاء بنجاح');
  },
});
```

**Infinite Scroll (Pagination):**
```typescript
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['competitions', filters],
  queryFn: ({ pageParam = 1 }) => competitionsApi.list({ ...filters, page: pageParam }),
  getNextPageParam: (lastPage) => lastPage.pagination.page < lastPage.pagination.totalPages
    ? lastPage.pagination.page + 1
    : undefined,
});
```

### Query Key Conventions
- Entity list: `['competitions', filters]`
- Single entity: `['competition', id]`
- Aggregated: `['dashboard-stats']`
- Search: `['search', { q, ...filters }]`

---

## 6. shadcn/ui — Component Library

### Purpose
Pre-built, accessible, customizable UI components based on Radix UI primitives.

### Installed Components (50+)
Located in `src/components/ui/`:

| Category | Components |
|----------|-----------|
| Layout | Card, Separator, AspectRatio, ScrollArea, Resizable |
| Form | Input, Textarea, Select, Checkbox, RadioGroup, Switch, Slider, Label, Form |
| Data Display | Table, Badge, Avatar, Progress, Skeleton, Tooltip, HoverCard |
| Navigation | Tabs, Breadcrumb, NavigationMenu, Menubar, Pagination |
| Overlay | Dialog, Sheet, Drawer, AlertDialog, Popover, DropdownMenu, ContextMenu |
| Feedback | Toast, Sonner (toast), Alert, Accordion, Collapsible |
| Input | Command (cmdk), InputOTP, Calendar, DayPicker, Toggle, ToggleGroup |
| Chart | Chart (recharts wrapper) |
| Carousel | Carousel (embla wrapper) |

### Customization
Components use Tailwind CSS variables for theming, so they automatically support light/dark mode.

### Adding New Components
```bash
npx shadcn@latest add [component-name]
```

---

## 7. Recharts — Data Visualization

### Purpose
Create interactive charts and data visualizations for the Stats module.

### Configuration
- Used in: `src/components/stats/StatsView.tsx`
- Component: `shadcn/ui Chart` wrapper

### Chart Types Used
- **PieChart** / **DonutChart**: Competitions by status, schools by type
- **BarChart**: Competitions by city, by category, top schools

### Usage Pattern
```typescript
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const data = [
  { name: 'مفتوحة', value: 15, color: '#10b981' },
  { name: 'مغلقة', value: 8, color: '#ef4444' },
  { name: 'منتهية', value: 12, color: '#6b7280' },
  { name: 'قادمة', value: 5, color: '#f59e0b' },
];

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100}>
      {data.map((entry, index) => (
        <Cell key={index} fill={entry.color} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

### Color Scheme
- Emerald (#10b981): Open, Public
- Amber (#f59e0b): Upcoming, Private, Warning
- Red (#ef4444): Closed, Error
- Gray (#6b7280): Expired
- Teal (#14b8a6): Semi-private
- Violet (#8b5cf6): Under review

---

## 8. Framer Motion — Animations

### Purpose
Add smooth animations and transitions throughout the platform.

### Usage Patterns

**Page Transitions:**
```typescript
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  <motion.div
    key={currentView}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.2 }}
  >
    {renderView()}
  </motion.div>
</AnimatePresence>
```

**Card Entrance Animations:**
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" whileInView="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={cardVariants}>
      <Card />
    </motion.div>
  ))}
</motion.div>
```

**Hover Effects:**
```typescript
<motion.div whileHover={{ scale: 1.04, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
  <Card />
</motion.div>
```

**Animated Counter:**
```typescript
import { useInView } from 'framer-motion';

const ref = useRef(null);
const isInView = useInView(ref, { once: true });
const [count, setCount] = useState(0);

useEffect(() => {
  if (isInView) {
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      setCount(prev => Math.min(prev + step, target));
    }, 16);
    return () => clearInterval(timer);
  }
}, [isInView]);
```

---

## 9. bcryptjs — Password Hashing

### Purpose
Secure password hashing for admin and user accounts.

### Usage
```typescript
import { hash, compare } from 'bcryptjs';

// Hash password (signup / password change)
const hashedPassword = await hash(plainPassword, 12); // 12 rounds

// Verify password (login)
const isValid = await compare(plainPassword, hashedPassword);
```

### Configuration
- **Rounds**: 12 (configurable via `BCRYPT_ROUNDS`)
- **Algorithm**: Blowfish cipher

---

## 10. jose — JWT Signing & Verification

### Purpose
Sign and verify JWT tokens for user authentication. Uses the Web Crypto API (no Node.js `crypto` dependency).

### Usage
```typescript
import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.USER_JWT_SECRET);

// Create token
const token = await new SignJWT({ id: user.id, email: user.email, name: user.name })
  .setProtectedHeader({ alg: 'HS256' })
  .setExpirationTime('7d')
  .setIssuedAt()
  .sign(secret);

// Verify token
try {
  const { payload } = await jwtVerify(token, secret);
  // payload.id, payload.email, payload.name
} catch {
  // Token invalid or expired
}
```

### Why jose over jsonwebtoken?
- Works in Edge Runtime (Vercel serverless)
- Uses Web Crypto API (no native dependencies)
- Smaller bundle size
- TypeScript-first

---

## 11. zod — Schema Validation

### Purpose
Runtime type validation for API request bodies and form inputs.

### Availability
Installed (`"zod": "^4.0.2"`) and available for use. Currently not heavily used in API routes but recommended for new endpoints.

### Usage Pattern
```typescript
import { z } from 'zod';

const competitionSchema = z.object({
  title: z.string().min(3, 'العنوان قصير جداً'),
  cityId: z.string().min(1, 'المدينة مطلوبة'),
  status: z.enum(['OPEN', 'CLOSED', 'EXPIRED', 'UPCOMING']),
  type: z.enum(['RECRUITMENT', 'ACADEMIC', 'SCHOLARSHIP', 'CONTINUING_EDUCATION', 'ADMISSION']),
  deadline: z.string().datetime().optional(),
  isFeatured: z.boolean().default(false),
});

// Validate
const result = competitionSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: result.error.flatten().fieldErrors },
    { status: 400 }
  );
}
```

### Integration with react-hook-form
```typescript
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodSchema(competitionSchema),
  defaultValues: { ... },
});
```

---

## 12. lucide-react — Icon Library

### Purpose
Consistent, accessible SVG icon library for the entire UI.

### Commonly Used Icons
```typescript
import {
  Search, MapPin, Calendar, Star, Heart, Bell, Settings,
  Trophy, GraduationCap, BookOpen, Clock, ExternalLink,
  Share2, ArrowUp, Home, BarChart3, GitCompare, HelpCircle,
  ChevronDown, ChevronRight, X, Check, AlertTriangle, Info,
  TrendingUp, Users, Mail, Phone, Globe, FileText, Award,
  Target, Lightbulb, Send, Moon, Sun, Menu,
} from 'lucide-react';
```

### Usage
```typescript
<Search className="h-5 w-5" />
<MapPin className="h-4 w-4 text-emerald-600" />
```

---

## 13. embla-carousel-react — Carousels

### Purpose
Touch-friendly, accessible carousel for testimonials and featured content.

### Configuration
- Used in: `src/components/home/TestimonialsSection.tsx`

### Usage Pattern
```typescript
import useEmblaCarousel from 'embla-carousel-react';

const [emblaRef, emblaApi] = useEmblaCarousel({
  direction: 'rtl',    // RTL support
  loop: true,          // Infinite loop
  align: 'start',      // Alignment
});

// Auto-play
useEffect(() => {
  if (!emblaApi) return;
  const autoplay = setInterval(() => emblaApi.scrollNext(), 5000);
  return () => clearInterval(autoplay);
}, [emblaApi]);
```

---

## 14. sonner — Toast Notifications

### Purpose
Beautiful, accessible toast notifications for user feedback.

### Configuration
- **Provider**: `src/components/Providers.tsx` → `<Toaster />`
- **Usage**: All mutation success/error callbacks

### Usage
```typescript
import { toast } from 'sonner';

toast.success('تم الحفظ بنجاح');
toast.error('حدث خطأ أثناء الحفظ');
toast.info('جاري تحميل البيانات');
toast.warning('المباراة closes soon');
toast('رسالة عادية', { description: 'وصف إضافي' });
```

### RTL Support
Configured in `globals.css`:
```css
[dir="rtl"] [data-sonner-toaster] {
  direction: rtl;
}
```

---

## 15. next-themes — Theme System

### Purpose
Light/dark mode toggle with system preference detection.

### Configuration
```typescript
// src/app/layout.tsx
import { ThemeProvider } from 'next-themes';

<ThemeProvider attribute="class" defaultTheme="light" enableSystem>
  {children}
</ThemeProvider>
```

### Usage in Components
```typescript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
// Toggle: setTheme(theme === 'dark' ? 'light' : 'dark');
```

---

## 16. Additional Libraries

### date-fns — Date Utilities
```typescript
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

format(deadline, 'dd MMMM yyyy', { locale: ar });
formatDistanceToNow(deadline, { addSuffix: true, locale: ar });
```

### cmdk — Command Palette
Used in ComparisonView for searchable item selection:
```typescript
import { Command } from 'cmdk';
// or shadcn/ui Command component
```

### react-hook-form — Form Management
Available for complex form handling with zod validation:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
```

### vaul — Drawer Component
Mobile-friendly drawer component (shadcn/ui integration):
```typescript
import { Drawer } from 'vaul';
```

---

## How to Add New Services

### Step-by-Step Guide

1. **Install the package:**
   ```bash
   bun add package-name
   ```

2. **Create configuration** (if needed):
   ```typescript
   // src/config/your-service.ts
   export const yourServiceConfig = {
     apiKey: process.env.YOUR_SERVICE_API_KEY,
     // ...
   };
   ```

3. **Add env variables:**
   ```env
   YOUR_SERVICE_API_KEY="..."
   NEXT_PUBLIC_YOUR_SERVICE_KEY="..."  # If needed on client
   ```

4. **Update env config:**
   ```typescript
   // src/config/env.ts
   export const envConfig = {
     // ... existing
     yourService: {
       apiKey: process.env.YOUR_SERVICE_API_KEY || '',
     },
   };
   ```

5. **Create service client** (if API-based):
   ```typescript
   // src/lib/your-service.ts
   export const yourServiceClient = {
     async doSomething() {
       // Implementation
     },
   };
   ```

6. **Use in components or API routes:**
   ```typescript
   // Client-side
   import { yourServiceClient } from '@/lib/your-service';
   
   // Server-side only (never expose secrets to client)
   // Use in src/app/api/ routes only
   ```

### Important Rules
- **Never expose API secrets to the client** (no `NEXT_PUBLIC_` for secrets)
- **Backend-only services** (z-ai-web-dev-sdk, database, etc.) must only be used in API routes
- **Client-side services** (UI libraries, analytics) can use `NEXT_PUBLIC_` variables
- **Keep configuration centralized** in `src/config/`

---

## Service Configuration via ENV Summary

| ENV Variable | Service | Default | Purpose |
|-------------|---------|---------|---------|
| `DATABASE_URL` | Prisma | `file:./db/custom.db` | Database connection |
| `NEXTAUTH_SECRET` | NextAuth | dev-secret | Admin JWT signing |
| `NEXTAUTH_URL` | NextAuth | `http://localhost:3000` | Admin auth callback URL |
| `USER_JWT_SECRET` | Custom JWT | dev-secret | User JWT signing |
| `ADMIN_SESSION_MAX_AGE` | NextAuth | `86400` | Admin session duration |
| `USER_SESSION_MAX_AGE` | Custom JWT | `604800` | User session duration |
| `BCRYPT_ROUNDS` | bcryptjs | `12` | Password hash rounds |
| `NEXT_PUBLIC_APP_NAME` | App | `BIVMOR` | Application name |
| `NEXT_PUBLIC_APP_URL` | App | `http://localhost:3000` | Public URL |
| `NEXT_PUBLIC_ADMIN_ROUTE` | Admin | `/admin-panel` | Admin route path |
| `ADMIN_API_BASE_URL` | Admin | `""` | External admin API URL |
| `ADMIN_IS_SEPARATE` | Admin | `false` | Separate admin deployment |
| `NEXT_PUBLIC_ENABLE_USER_ACCOUNTS` | Features | `true` | User accounts feature |
| `NEXT_PUBLIC_ENABLE_REMINDERS` | Features | `true` | Reminders feature |
| `NEXT_PUBLIC_ENABLE_APPLICATIONS` | Features | `true` | Applications feature |
| `NEXT_PUBLIC_ENABLE_COMPARISON` | Features | `true` | Comparison feature |
| `NEXT_PUBLIC_ENABLE_NEWSLETTER` | Features | `true` | Newsletter feature |
| `NEXT_PUBLIC_ENABLE_NOTIFICATIONS` | Features | `true` | Notifications feature |
| `RATE_LIMIT_MAX` | Security | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW` | Security | `60000` | Rate limit window (ms) |
| `CORS_ORIGINS` | Security | `*` | Allowed CORS origins |
