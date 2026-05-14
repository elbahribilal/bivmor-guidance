# BIVMOR - Backend Architecture & Flow

> Documentation of the backend API layer, authentication, database access, and server-side patterns.

---

## API Route Structure

All API routes follow Next.js 16 App Router conventions under `src/app/api/`. Each route file exports standard HTTP method handlers (`GET`, `POST`, `PUT`, `DELETE`).

```
src/app/api/
├── competitions/
│   ├── route.ts                    # GET (list), POST (create)
│   ├── [id]/route.ts               # GET (single), PUT (update), DELETE
│   └── auto-update-status/route.ts # POST (auto-status update)
├── schools/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [id]/route.ts               # GET (single), PUT (update), DELETE
├── categories/route.ts             # GET (list), POST (create)
├── cities/route.ts                 # GET (list with _count)
├── regions/route.ts                # GET (list)
├── levels/route.ts                 # GET (list)
├── search/
│   ├── route.ts                    # GET (search competitions + schools)
│   └── suggestions/route.ts        # GET (autocomplete)
├── news/
│   ├── route.ts                    # GET (list), POST (create)
│   └── [id]/route.ts               # GET, PUT, DELETE
├── notifications/route.ts          # GET, POST, PUT, DELETE
├── settings/route.ts               # GET, PUT
├── dashboard/stats/route.ts        # GET (dashboard statistics)
├── admin/
│   ├── session/route.ts            # GET (check admin session)
│   ├── activity/route.ts           # GET (list), POST (log)
│   └── seed/route.ts              # POST (seed initial data)
├── auth/
│   └── [...nextauth]/route.ts      # NextAuth.js catch-all handler
├── user/
│   ├── auth/
│   │   ├── signup/route.ts         # POST (register)
│   │   ├── login/route.ts          # POST (login)
│   │   ├── logout/route.ts         # POST (logout)
│   │   ├── session/route.ts        # GET (check session)
│   │   └── reset-password/route.ts # POST (password reset)
│   ├── favorites/route.ts          # GET, POST, DELETE
│   ├── reminders/route.ts          # GET, POST, DELETE
│   ├── applications/route.ts       # GET, POST, PUT
│   ├── notifications/route.ts      # GET, PUT
│   └── profile/route.ts            # GET, PUT
├── seed/route.ts                   # POST (public seed)
└── route.ts                        # API root / health check
```

---

## Request/Response Patterns

### Standard Response Formats

**Single Item:**
```json
{
  "data": {
    "id": "clx...",
    "title": "مباراة ولوج مدرسة الحسن الثاني",
    "status": "OPEN",
    ...
  }
}
```

**Paginated List:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 47,
    "totalPages": 4
  }
}
```

**Success Action:**
```json
{
  "success": true
}
```

**Error:**
```json
{
  "error": "يجب تسجيل الدخول أولاً"
}
```

### Query Parameters

List endpoints accept filter parameters via query string:

```
GET /api/competitions?cityId=abc&categoryId=def&status=OPEN&page=1&limit=12&sort=deadline
GET /api/schools?cityId=abc&type=PUBLIC&search=محمد&page=2
GET /api/search?q=مباراة&cityId=abc&type=competition
GET /api/news?category=إعلان&publishedOnly=true&limit=10
```

### Request Bodies

Create and update endpoints accept JSON bodies:

```typescript
// POST /api/competitions
{
  "title": "مباراة ولوج ...",
  "shortDescription": "...",
  "cityId": "clx...",
  "categoryId": "clx...",
  "status": "OPEN",
  "type": "ACADEMIC"
}

// POST /api/user/auth/signup
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "أحمد"
}
```

---

## Authentication System

The platform uses **two separate authentication systems**:

### 1. Admin Authentication (NextAuth.js)

**Files:**
- `src/lib/auth/config.ts` — NextAuth options
- `src/lib/auth/api-guard.ts` — Admin API guard
- `src/lib/auth/session.ts` — Admin session helpers
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler

**How It Works:**

```
1. Admin visits /?admin=true
2. AdminLogin form submits credentials
3. POST /api/auth/callback/credentials
   ├── NextAuth CredentialsProvider validates
   ├── Looks up User table by email
   ├── bcryptjs compare(password, stored hash)
   ├── Checks role is ADMIN or EDITOR
   └── Returns JWT token with { id, email, name, role }
4. NextAuth sets session cookie (next-auth.session-token)
5. Subsequent admin API calls include session cookie
6. requireAdminAuth() validates session server-side
```

**Session Configuration:**
- Strategy: JWT (not database sessions)
- Max age: 24 hours
- Secret: `NEXTAUTH_SECRET` env variable

**Protecting Admin Routes:**

Two approaches available:

```typescript
// Approach 1: Manual check
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (!authResult.authorized) {
    return authResult.response; // 401 or 403
  }
  const { user } = authResult;
  // ... proceed with admin logic
}

// Approach 2: Wrapper function
export const POST = withAdminAuth(async (request, context) => {
  // Already authenticated - proceed
  const session = await getServerSession(authOptions);
  // ...
});
```

### 2. User Authentication (Custom JWT)

**Files:**
- `src/lib/auth/user-auth.ts` — JWT sign/verify, cookie management
- `src/lib/auth/user-guard.ts` — User API guard
- `src/app/api/user/auth/login/route.ts` — Login endpoint
- `src/app/api/user/auth/signup/route.ts` — Registration endpoint
- `src/app/api/user/auth/logout/route.ts` — Logout endpoint
- `src/app/api/user/auth/session/route.ts` — Session check

**How It Works:**

```
1. User signs up via POST /api/user/auth/signup
   ├── Validate email uniqueness
   ├── bcryptjs hash(password, 12 rounds)
   ├── Create PlatformUser in DB
   ├── Sign JWT with jose: SignJWT({ id, email, name })
   └── Set httpOnly cookie: bivmor_user_session

2. User logs in via POST /api/user/auth/login
   ├── Find PlatformUser by email
   ├── bcryptjs compare(password, hash)
   ├── Sign JWT
   └── Set cookie

3. Subsequent requests include cookie automatically
4. requireUserAuth() validates JWT server-side
   ├── Read cookie from request
   ├── jwtVerify(token, JWT_SECRET)
   └── Return { id, email, name } or 401

5. Logout: Clear cookie
```

**JWT Configuration:**
- Algorithm: HS256
- Secret: `USER_JWT_SECRET` env variable
- Max age: 7 days
- Cookie: `bivmor_user_session` (httpOnly, secure in production, sameSite: lax)

**Protecting User Routes:**

```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireUserAuth(request);
  if (!authResult.authorized) {
    return authResult.response; // 401
  }
  const { user } = authResult;
  // user.id, user.email, user.name available
  // ... proceed with user-specific logic
}
```

---

## Database Access via Prisma ORM

### Prisma Client Singleton

`src/lib/db.ts` exports a singleton Prisma client:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

This prevents multiple Prisma instances in development (hot reloading).

### Common Query Patterns

**List with Filters and Pagination:**
```typescript
const where: Prisma.CompetitionWhereInput = {};
if (cityId) where.cityId = cityId;
if (status) where.status = status;
if (search) where.title = { contains: search };

const [data, total] = await Promise.all([
  db.competition.findMany({
    where,
    include: { city: true, school: true, category: true, level: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { deadline: 'asc' },
  }),
  db.competition.count({ where }),
]);
```

**Include Relations:**
```typescript
// Competition with full relations
const competition = await db.competition.findUnique({
  where: { id },
  include: {
    city: { include: { region: true } },
    school: true,
    category: true,
    level: true,
    tags: { include: { tag: true } },
    media: true,
  },
});

// City with counts
const cities = await db.city.findMany({
  include: {
    _count: { select: { schools: true, competitions: true } },
  },
});
```

**Create with Validation:**
```typescript
const school = await db.school.create({
  data: {
    name,
    slug: generateSlug(name),
    cityId,
    type: type || 'PUBLIC',
    isFeatured: isFeatured || false,
    isActive: isActive !== false,
  },
});
```

**Transaction:**
```typescript
// For operations that need atomicity
await db.$transaction([
  db.competitionTag.deleteMany({ where: { competitionId: id } }),
  db.competition.update({ where: { id }, data: updateData }),
]);
```

---

## Auto-Status Update System

Competitions automatically update their status based on deadlines and dates.

**Endpoint:** `POST /api/competitions/auto-update-status`

**Logic:**

```typescript
const now = new Date();

// 1. OPEN → EXPIRED: deadline has passed
const expiredFromOpen = await db.competition.updateMany({
  where: { status: 'OPEN', deadline: { lt: now } },
  data: { status: 'EXPIRED' },
});

// 2. OPEN → CLOSED: registrationOpen = false and deadline passed
const closedByRegistration = await db.competition.updateMany({
  where: { status: 'OPEN', registrationOpen: false, deadline: { lt: now } },
  data: { status: 'CLOSED' },
});

// 3. UPCOMING → OPEN: startDate has arrived
const upcomingToOpen = await db.competition.updateMany({
  where: { status: 'UPCOMING', startDate: { lte: now } },
  data: { status: 'OPEN' },
});

// 4. UPCOMING → EXPIRED: both startDate and deadline passed
const upcomingExpired = await db.competition.updateMany({
  where: { status: 'UPCOMING', deadline: { lt: now } },
  data: { status: 'EXPIRED' },
});
```

**Return:**
```json
{
  "success": true,
  "updatedCount": 5,
  "details": {
    "expiredFromOpen": 3,
    "closedByRegistration": 1,
    "upcomingToOpen": 0,
    "upcomingExpired": 1,
    "closingSoon": 7
  }
}
```

**When Triggered:**
- Can be called manually from the admin dashboard
- Could be triggered by a cron job in production
- Called automatically when the competitions list API is accessed (optional)

---

## Seeding System

### Admin Seed Endpoint

`POST /api/admin/seed` (requires admin auth)

Seeds the database with authentic Moroccan educational data:
- 12 regions of Morocco
- 30+ cities (Casablanca, Rabat, Marrakech, Fes, etc.)
- 8 education levels
- 10+ categories
- 22 competitions (various types and statuses)
- 21 schools (public, private, semi-private)
- 5 sample notifications
- Default site settings
- Admin user: `admin@bivmor.ma` / `admin123`

### Public Seed Endpoint

`POST /api/seed`

Same as admin seed but without authentication (for initial setup only).

---

## Error Handling Patterns

### API Route Error Handling

All API routes use try/catch with consistent error responses:

```typescript
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    
    // Database query
    const data = await db.competition.findMany({ ... });
    
    // Return success
    return NextResponse.json({ data, pagination: { ... } });
  } catch (error) {
    console.error('Competitions list error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل البيانات' },
      { status: 500 }
    );
  }
}
```

### Authentication Errors

| Status | Error Message (Arabic) | Meaning |
|--------|----------------------|---------|
| 401 | يجب تسجيل الدخول أولاً | Must login first |
| 403 | ليس لديك صلاحية تنفيذ هذا الإجراء | Insufficient permissions |
| 500 | حدث خطأ أثناء التحقق من الهوية | Auth check error |

### Validation Errors

| Status | Error Message | Meaning |
|--------|--------------|---------|
| 400 | البريد الإلكتروني مطلوب | Email required |
| 400 | كلمة المرور قصيرة جداً | Password too short |
| 409 | هذا البريد الإلكتروني مسجل مسبقاً | Email already registered |
| 404 | المباراة غير موجودة | Competition not found |

---

## Activity Logging

### Admin Activity Log

`src/app/api/admin/activity/route.ts` records admin actions:

```typescript
await db.adminAuditLog.create({
  data: {
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: 'CREATE',
    entity: 'competition',
    entityId: competition.id,
    details: `Created competition: ${competition.title}`,
    ipAddress: request.headers.get('x-forwarded-for'),
    userAgent: request.headers.get('user-agent'),
  },
});
```

**Logged Actions:**
- CREATE, UPDATE, DELETE (CRUD operations)
- LOGIN, LOGOUT (session events)
- STATUS_UPDATE (competition status changes)
- FEATURED (toggle featured status)

**Query Activity Log:**
```
GET /api/admin/activity?limit=50&entity=competition&action=CREATE
```

---

## How to Add a New API Endpoint

Follow these steps to add a new API endpoint:

### 1. Create the Route File

```
src/app/api/your-entity/route.ts
```

### 2. Implement Handlers

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth/api-guard';

// GET /api/your-entity
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const [data, total] = await Promise.all([
      db.yourEntity.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.yourEntity.count(),
    ]);

    return NextResponse.json({
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}

// POST /api/your-entity (protected)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (!authResult.authorized) return authResult.response;

    const body = await request.json();
    const entity = await db.yourEntity.create({ data: body });

    // Log activity
    await db.adminAuditLog.create({
      data: {
        userId: authResult.user.id,
        userEmail: authResult.user.email,
        userRole: authResult.user.role,
        action: 'CREATE',
        entity: 'yourEntity',
        entityId: entity.id,
      },
    });

    return NextResponse.json({ data: entity }, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 });
  }
}
```

### 3. Add Types

In `src/types/index.ts`:

```typescript
export interface YourEntity {
  id: string;
  name: string;
  // ...
}
```

### 4. Add API Client Method

In `src/lib/api.ts`:

```typescript
export const yourEntityApi = {
  list: async (filters = {}): Promise<PaginatedResponse<YourEntity>> => {
    const params = new URLSearchParams();
    // Add filter params
    return fetchApi<PaginatedResponse<YourEntity>>(`/your-entity?${params}`);
  },
  create: async (data: Partial<YourEntity>): Promise<{ data: YourEntity }> => {
    return fetchApi<{ data: YourEntity }>('/your-entity', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
```

### 5. Add API Endpoint Config

In `src/config/api.ts`:

```typescript
public: {
  // ... existing
  yourEntity: `${API_BASE}/your-entity`,
},
```

### 6. Use in Component

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['your-entity', filters],
  queryFn: () => yourEntityApi.list(filters),
});
```

---

## CORS and Security

### API Security Layers

1. **Authentication**: Admin routes protected by `requireAdminAuth` / `withAdminAuth`
2. **Authorization**: Role-based checks (ADMIN, EDITOR, MODERATOR)
3. **User Auth**: User routes protected by `requireUserAuth`
4. **Input Validation**: Server-side validation of request bodies
5. **Rate Limiting**: Configured via `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` env vars
6. **CSRF Protection**: NextAuth.js includes CSRF token validation

### Cookie Security

| Cookie | HttpOnly | Secure | SameSite |
|--------|----------|--------|----------|
| `next-auth.session-token` | Yes | Production | lax |
| `bivmor_user_session` | Yes | Production | lax |
| `next-auth.csrf-token` | Yes | Production | lax |

### Password Security

- Hashing: bcryptjs with 12 rounds
- No plaintext storage
- Password comparison uses constant-time bcrypt compare
