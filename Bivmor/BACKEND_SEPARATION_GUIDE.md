# BIVMOR Backend Separation Guide | دليل فصل الواجهة الخلفية

> Step-by-step guide for separating the backend API from the Next.js frontend, enabling independent scaling, mobile app support, and multi-client architecture.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Phase 1: API-First Architecture](#2-phase-1-api-first-architecture)
3. [Phase 2: Extract Backend](#3-phase-2-extract-backend)
4. [Phase 3: Deploy Separately](#4-phase-3-deploy-separately)
5. [Phase 4: Mobile App Readiness](#5-phase-4-mobile-app-readiness)
6. [File Change Checklists](#6-file-change-checklists)
7. [What Stays the Same / What Changes](#7-what-stays-the-same--what-changes)

---

## 1. Current State Analysis

### Architecture Overview

BIVMOR is currently a monolithic Next.js application where the frontend and backend are tightly coupled:

```
User → Next.js (:3000)
         ├── Frontend (React SPA)
         │   └── src/components/ (13+ views)
         │   └── src/store/ (Zustand stores)
         │   └── src/hooks/ (TanStack Query)
         │
         └── Backend (Next.js API Routes)
             └── src/app/api/ (30+ route files)
             └── src/lib/auth/ (authentication)
             └── src/lib/db.ts (Prisma database)
             └── src/config/ (configuration)
```

### Current API Routes

All API routes live in `src/app/api/`:

**Public API Routes:**
| Route | Method | Purpose |
|-------|--------|---------|
| `/api` | GET | Health check |
| `/api/competitions` | GET | List competitions |
| `/api/competitions/[id]` | GET | Get competition by ID |
| `/api/competitions/auto-update-status` | POST | Auto-update competition statuses |
| `/api/schools` | GET | List schools |
| `/api/schools/[id]` | GET | Get school by ID |
| `/api/categories` | GET | List categories |
| `/api/cities` | GET | List cities |
| `/api/regions` | GET | List regions |
| `/api/levels` | GET | List levels |
| `/api/search` | GET | Search competitions & schools |
| `/api/search/suggestions` | GET | Search autocomplete |
| `/api/news` | GET | List news |
| `/api/news/[id]` | GET/PUT/DELETE | News CRUD |
| `/api/notifications` | GET/PUT | List & mark notifications |
| `/api/settings` | GET/PUT | Site settings |
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/seed` | POST | Seed reference data |

**User API Routes:**
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/user/auth/signup` | POST | User registration |
| `/api/user/auth/login` | POST | User login (JWT) |
| `/api/user/auth/logout` | POST | User logout |
| `/api/user/auth/session` | GET | Check user session |
| `/api/user/auth/reset-password` | POST | Password reset |
| `/api/user/profile` | GET/PUT | User profile CRUD |
| `/api/user/favorites` | GET/POST/DELETE | User favorites |
| `/api/user/reminders` | GET/POST/DELETE | User reminders |
| `/api/user/applications` | GET/POST/PUT | User applications |
| `/api/user/notifications` | GET/PUT | User notifications |

**Admin API Routes:**
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/session` | GET | Admin session check |
| `/api/admin/activity` | GET/POST | Admin audit log |
| `/api/admin/seed` | POST | Seed admin user |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth endpoints |

### How Frontend Currently Accesses Data

The frontend uses TanStack Query with a centralized API client (`src/lib/api.ts`):

```typescript
// src/lib/api.ts
import { apiConfig } from '@/config/api';

// Example: competitionsApi.list()
export const competitionsApi = {
  list: async (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetch(`${apiConfig.public.competitions}${query}`);
    return response.json();
  },
  // ...
};
```

The API config in `src/config/api.ts` centralizes all endpoint URLs:

```typescript
export const apiConfig = {
  public: {
    competitions: `${API_BASE}/competitions`,
    schools: `${API_BASE}/schools`,
    categories: `${API_BASE}/categories`,
    cities: `${API_BASE}/cities`,
    regions: `${API_BASE}/regions`,
    levels: `${API_BASE}/levels`,
    search: `${API_BASE}/search`,
    searchSuggestions: `${API_BASE}/search/suggestions`,
    news: `${API_BASE}/news`,
    notifications: `${API_BASE}/notifications`,
    settings: `${API_BASE}/settings`,
    dashboardStats: `${API_BASE}/dashboard/stats`,
    autoUpdateStatus: `${API_BASE}/competitions/auto-update-status`,
  },
  admin: {
    baseUrl: ADMIN_BASE,
    session: `${ADMIN_BASE}/session`,
    activity: `${ADMIN_BASE}/activity`,
    seed: `${ADMIN_BASE}/seed`,
  },
  user: {
    signup: `${API_BASE}/user/auth/signup`,
    login: `${API_BASE}/user/auth/login`,
    session: `${API_BASE}/user/auth/session`,
    logout: `${API_BASE}/user/auth/logout`,
    profile: `${API_BASE}/user/profile`,
    favorites: `${API_BASE}/user/favorites`,
    reminders: `${API_BASE}/user/reminders`,
    applications: `${API_BASE}/user/applications`,
    notifications: `${API_BASE}/user/notifications`,
  },
  auth: {
    csrf: `${API_BASE}/auth/csrf`,
    callback: `${API_BASE}/auth/callback/credentials`,
    signout: `${API_BASE}/auth/signout`,
  },
};
```

**Key insight:** The frontend already uses `NEXT_PUBLIC_API_BASE_URL` (default: `/api`), which means switching to an external API only requires changing one ENV variable.

---

## 2. Phase 1: API-First Architecture

### Goal

Ensure all frontend data comes exclusively from API calls. No direct database access in React components. Enforce API as the single source of truth.

### Current Status: Mostly Done

The BIVMOR project already follows API-first principles:

✅ All frontend data fetching goes through `src/lib/api.ts`  
✅ All components use TanStack Query (`useQuery`) for data fetching  
✅ No direct Prisma imports in any component files  
✅ API config is centralized in `src/config/api.ts`  
✅ `NEXT_PUBLIC_API_BASE_URL` is configurable  

### Step 1: Audit for Direct DB Access in Components

```bash
# Check for any Prisma/db imports in component files
rg "from '@/lib/db'" src/components/ -l
rg "import { db }" src/components/ -l
rg "prisma\." src/components/ -l

# Check for any server-side data fetching in components
rg "getServerSideProps\|getStaticProps" src/components/ -l

# These should return NO results. If they do, those components
# need to be refactored to use API calls instead.
```

### Step 2: Add API Versioning

Prefix all API routes with `/api/v1/`:

Create a versioned API structure:

```
src/app/api/
├── v1/                          ← New versioned routes
│   ├── competitions/
│   ├── schools/
│   ├── categories/
│   ├── cities/
│   ├── regions/
│   ├── levels/
│   ├── search/
│   ├── news/
│   ├── notifications/
│   ├── settings/
│   ├── dashboard/
│   ├── user/
│   └── admin/
├── competitions/                ← Keep for backward compatibility
│   └── route.ts                 ← Redirects to /api/v1/competitions
└── ...
```

Implementation approach — add version prefix via middleware or config:

```typescript
// src/config/api.ts — Update to use versioned routes
const API_VERSION = envConfig.api.version; // 'v1'

export const apiConfig = {
  public: {
    competitions: `${API_BASE}/${API_VERSION}/competitions`,
    schools: `${API_BASE}/${API_VERSION}/schools`,
    // ... etc
  },
  // ... etc
};
```

Or use Next.js middleware to rewrite:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rewrite /api/v1/* to /api/* (internal routing)
  if (pathname.startsWith('/api/v1/')) {
    const newPath = pathname.replace('/api/v1/', '/api/');
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};
```

### Step 3: Add Consistent Error Responses

Ensure all API routes return consistent error formats:

```typescript
// src/lib/api-response.ts
import { NextResponse } from 'next/server';

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400, errors?: unknown) {
  return NextResponse.json(
    { success: false, error: message, ...(errors && { errors }) },
    { status }
  );
}

export function paginatedResponse(data: unknown, total: number, page: number, limit: number) {
  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### Step 4: Add Request Validation

Use Zod schemas for all API inputs:

```typescript
// src/lib/validations/competition.ts
import { z } from 'zod';

export const createCompetitionSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  shortDescription: z.string().optional(),
  fullDescription: z.string().optional(),
  officialLink: z.string().url('رابط غير صالح').optional().or(z.literal('')),
  deadline: z.string().datetime().optional(),
  cityId: z.string().optional(),
  schoolId: z.string().optional(),
  categoryId: z.string().optional(),
  levelId: z.string().optional(),
  status: z.enum(['OPEN', 'CLOSED', 'EXPIRED', 'UPCOMING']).optional(),
  type: z.enum(['RECRUITMENT', 'ACADEMIC', 'SCHOLARSHIP', 'CONTINUING_EDUCATION', 'ADMISSION']).optional(),
});

export const updateCompetitionSchema = createCompetitionSchema.partial();

export type CreateCompetitionInput = z.infer<typeof createCompetitionSchema>;
export type UpdateCompetitionInput = z.infer<typeof updateCompetitionSchema>;
```

### Step 5: Add Rate Limiting to API Routes

```typescript
// src/lib/rate-limit.ts
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(request: Request): Response | null {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '100');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '60000');

  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + windowMs });
    return null;
  }

  if (entry.count >= maxRequests) {
    return new Response(JSON.stringify({ error: 'طلبات كثيرة جداً' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  entry.count++;
  return null;
}
```

### What Stays the Same in Phase 1

- ✅ Same Next.js application
- ✅ Same API route handlers
- ✅ Same database access pattern
- ✅ Same frontend components
- ✅ Same deployment

### What Changes in Phase 1

- 🔄 API routes may have `/v1/` prefix (optional, backward compatible)
- 🔄 Consistent error response format
- 🔄 Request validation with Zod
- 🔄 Rate limiting middleware
- 🔄 API documentation (OpenAPI/Swagger)

---

## 3. Phase 2: Extract Backend

### Goal

Create a separate backend service using Express/Hono/Fastify that handles all API routes, database access, and authentication. The Next.js frontend becomes a pure client-side application.

### Recommended: Hono (Lightweight, Fast, TypeScript-native)

Hono is ideal because:
- Ultra-lightweight (~14KB)
- TypeScript-first
- Works on Bun natively
- Similar middleware pattern to Express
- Edge-ready (Cloudflare Workers, Deno)

### Step 1: Create the Backend Project

```bash
# Create backend directory
mkdir bivmor-backend && cd bivmor-backend

# Initialize with Bun
bun init

# Install dependencies
bun add hono @prisma/client bcryptjs jose zod
bun add -d prisma @types/bcryptjs

# Copy shared files from Next.js project
cp -r ../my-project/prisma/ ./prisma/
cp -r ../my-project/src/lib/auth/ ./src/lib/auth/
cp ../my-project/src/lib/db.ts ./src/lib/db.ts
cp -r ../my-project/src/config/ ./src/config/
cp -r ../my-project/src/types/ ./src/types/
```

### Step 2: Create Backend Entry Point

```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { rateLimit } from './middleware/rate-limit';

// Route imports
import { publicRoutes } from './routes/public';
import { userRoutes } from './routes/user';
import { adminRoutes } from './routes/admin';
import { authRoutes } from './routes/auth';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors({
  origin: (process.env.CORS_ORIGINS || '*').split(','),
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Service-Token'],
  credentials: true,
  maxAge: 86400,
}));
app.use('*', rateLimit);

// Health check
app.get('/api', (c) => c.json({
  status: 'ok',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  service: 'bivmor-api',
}));

// Mount route groups
app.route('/api', publicRoutes);
app.route('/api/user', userRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/auth', authRoutes);

// Start server
const port = parseInt(process.env.PORT || '3002');
console.log(`🚀 BIVMOR API server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
```

### Step 3: Implement Public Routes

```typescript
// src/routes/public.ts
import { Hono } from 'hono';
import { db } from '../lib/db';

export const publicRoutes = new Hono();

// GET /api/competitions
publicRoutes.get('/competitions', async (c) => {
  const { page = '1', limit = '20', status, cityId, categoryId, search } = c.req.query();

  const where: any = {};
  if (status) where.status = status;
  if (cityId) where.cityId = cityId;
  if (categoryId) where.categoryId = categoryId;
  if (search) where.title = { contains: search };

  const [competitions, total] = await Promise.all([
    db.competition.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      include: { city: true, school: true, category: true, level: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.competition.count({ where }),
  ]);

  return c.json({
    success: true,
    data: competitions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// GET /api/competitions/:id
publicRoutes.get('/competitions/:id', async (c) => {
  const { id } = c.req.param();
  const competition = await db.competition.findUnique({
    where: { id },
    include: { city: true, school: true, category: true, level: true, tags: { include: { tag: true } } },
  });

  if (!competition) {
    return c.json({ success: false, error: 'المباراة غير موجودة' }, 404);
  }

  return c.json({ success: true, data: competition });
});

// GET /api/schools
publicRoutes.get('/schools', async (c) => {
  // Similar implementation
  const schools = await db.school.findMany({
    include: { city: true, category: true, level: true },
  });
  return c.json({ success: true, data: schools });
});

// GET /api/categories, /api/cities, /api/regions, /api/levels
// Similar pattern for each...
```

### Step 4: Implement User Routes

```typescript
// src/routes/user.ts
import { Hono } from 'hono';
import { db } from '../lib/db';
import { userAuthMiddleware } from '../middleware/user-auth';

export const userRoutes = new Hono();

// Public routes (no auth)
userRoutes.post('/auth/signup', async (c) => {
  const body = await c.req.json();
  // ... signup logic from src/app/api/user/auth/signup/route.ts
});

userRoutes.post('/auth/login', async (c) => {
  const body = await c.req.json();
  // ... login logic from src/app/api/user/auth/login/route.ts
});

// Protected routes (require auth)
userRoutes.use('/profile/*', userAuthMiddleware);
userRoutes.use('/favorites/*', userAuthMiddleware);
userRoutes.use('/reminders/*', userAuthMiddleware);
userRoutes.use('/applications/*', userAuthMiddleware);
userRoutes.use('/notifications/*', userAuthMiddleware);

userRoutes.get('/profile', async (c) => {
  const userId = c.get('userId');
  const user = await db.platformUser.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, avatar: true },
  });
  return c.json({ success: true, data: user });
});

// ... more user routes
```

### Step 5: Implement Admin Routes

```typescript
// src/routes/admin.ts
import { Hono } from 'hono';
import { adminAuthMiddleware } from '../middleware/admin-auth';

export const adminRoutes = new Hono();

// All admin routes require authentication
adminRoutes.use('*', adminAuthMiddleware);

adminRoutes.get('/session', async (c) => {
  const admin = c.get('admin');
  return c.json({ success: true, data: admin });
});

adminRoutes.get('/activity', async (c) => {
  const logs = await db.adminAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return c.json({ success: true, data: logs });
});

// ... admin CRUD routes for competitions, schools, etc.
```

### Step 6: Create Authentication Middleware

```typescript
// src/middleware/user-auth.ts
import { createMiddleware } from 'hono/factory';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'bivmor-user-dev-secret-change-in-production'
);

export const userAuthMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'غير مصرح' }, 401);
  }

  const token = authHeader.substring(7);

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    c.set('userId', payload.sub as string);
    c.set('userEmail', payload.email as string);
    await next();
  } catch {
    return c.json({ success: false, error: 'رمز غير صالح' }, 401);
  }
});
```

```typescript
// src/middleware/admin-auth.ts
import { createMiddleware } from 'hono/factory';
import { getServerSession } from '../lib/auth/admin-session';

export const adminAuthMiddleware = createMiddleware(async (c, next) => {
  // Check for session cookie (NextAuth)
  const session = await getServerSession(c.req.raw);

  if (!session) {
    return c.json({ success: false, error: 'غير مصرح' }, 401);
  }

  if (!['ADMIN', 'EDITOR'].includes(session.user.role)) {
    return c.json({ success: false, error: 'ليس لديك صلاحية' }, 403);
  }

  c.set('admin', session.user);
  await next();
});
```

### Step 7: Update Frontend API Configuration

In the Next.js project, update `src/config/api.ts`:

```typescript
// BEFORE:
const API_BASE = envConfig.api.baseUrl; // '/api'

// AFTER:
const API_BASE = envConfig.api.baseUrl; // '/api' or 'https://api.bivmor.com/api'
```

And update `.env`:

```env
# BEFORE (same-origin API):
NEXT_PUBLIC_API_BASE_URL=/api

# AFTER (external API):
NEXT_PUBLIC_API_BASE_URL=https://api.bivmor.com/api
```

### Step 8: Update Frontend User Auth for External API

When the API is on a different domain, the frontend needs to handle JWT tokens differently:

```typescript
// src/store/user-auth.ts — Updated for external API
import { zustand } from 'zustand';

interface UserAuthState {
  token: string | null;
  user: PlatformUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useUserAuth = zustand<UserAuthState>((set) => ({
  token: localStorage.getItem('bivmor-token'),
  user: null,

  login: async (email, password) => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    const response = await fetch(`${API_BASE}/user/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem('bivmor-token', data.data.token);
      set({ token: data.data.token, user: data.data.user });
    } else {
      throw new Error(data.error);
    }
  },

  logout: () => {
    localStorage.removeItem('bivmor-token');
    set({ token: null, user: null });
  },
}));
```

Update all API calls to include the JWT token:

```typescript
// src/lib/api.ts — Updated for external API with JWT
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('bivmor-token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch(path: string, options?: RequestInit) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return response.json();
}
```

---

## 4. Phase 3: Deploy Separately

### Goal

Frontend on bivmor.com (Vercel/CDN), Backend on api.bivmor.com (Railway/Render/VPS).

### Architecture

```
User Browser
    ├── bivmor.com          → Next.js Static/SSR (Vercel)
    │   └── React SPA
    │   └── TanStack Query
    │
    └── api.bivmor.com      → Hono API Server (Railway/VPS)
        └── /api/v1/*
        └── Database (PostgreSQL)
        └── Authentication
```

### Step 1: Deploy Backend

```bash
# Build backend
cd bivmor-backend
bun build src/index.ts --outdir dist --target bun

# Start production server
bun run dist/index.js

# Or with PM2
pm2 start dist/index.js --name bivmor-api
```

Backend `.env`:

```env
# Database
DATABASE_URL="postgresql://bivmor:password@host:5432/bivmor"

# Admin Auth
NEXTAUTH_SECRET="<generate-with-openssl>"
NEXTAUTH_URL="https://api.bivmor.com"

# User Auth
USER_JWT_SECRET="<generate-with-openssl>"

# API Configuration
PORT=3002
CORS_ORIGINS=https://bivmor.com,https://admin.bivmor.com

# Feature Flags
NEXT_PUBLIC_ENABLE_USER_ACCOUNTS=true
NEXT_PUBLIC_ENABLE_REMINDERS=true
NEXT_PUBLIC_ENABLE_APPLICATIONS=true

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
NODE_ENV=production
```

### Step 2: Deploy Frontend

The Next.js frontend is now much simpler — it's primarily a client-side SPA:

```env
# Frontend .env
NEXT_PUBLIC_APP_NAME="BIVMOR"
NEXT_PUBLIC_APP_DESCRIPTION="منصة المباريات والفرص التعليمية في المغرب"
NEXT_PUBLIC_APP_URL="https://bivmor.com"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_API_BASE_URL="https://api.bivmor.com/api"
NEXT_PUBLIC_ADMIN_API_PREFIX="/api/admin"
NEXT_PUBLIC_API_VERSION="v1"
NEXT_PUBLIC_ADMIN_ROUTE="/admin-panel"
NEXT_PUBLIC_ENABLE_USER_ACCOUNTS=true
NEXT_PUBLIC_ENABLE_REMINDERS=true
NEXT_PUBLIC_ENABLE_APPLICATIONS=true
NEXT_PUBLIC_ENABLE_COMPARISON=true
NEXT_PUBLIC_ENABLE_NEWSLETTER=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

### Step 3: Configure CORS on Backend

The backend must allow requests from the frontend origin:

```typescript
// In Hono app
app.use('*', cors({
  origin: ['https://bivmor.com', 'https://admin.bivmor.com'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Service-Token'],
  credentials: true,
  maxAge: 86400,
}));
```

### Step 4: Nginx Configuration for API

```nginx
server {
    listen 443 ssl http2;
    server_name api.bivmor.com;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Max upload size
    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 5: Remove Backend Code from Frontend

After the backend is extracted, clean up the Next.js project:

```bash
# Remove API routes (now handled by backend)
rm -rf src/app/api/

# Remove server-only auth libraries (now in backend)
rm -rf src/lib/auth/
rm src/lib/db.ts

# Remove admin system (now in admin project or backend)
rm -rf src/admin-system/
rm -rf src/components/admin/

# Keep these in frontend:
# - src/components/ (UI components)
# - src/store/ (client state)
# - src/hooks/ (custom hooks)
# - src/lib/api.ts (API client)
# - src/config/ (frontend config only)
# - src/types/ (shared types)
```

### Step 6: Update Frontend Configuration

Simplify `src/config/env.ts` for frontend-only:

```typescript
export const envConfig = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'BIVMOR',
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'منصة المباريات والفرص التعليمية في المغرب',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
    adminPrefix: process.env.NEXT_PUBLIC_ADMIN_API_PREFIX || '/api/admin',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
  },
  features: {
    enableUserAccounts: process.env.NEXT_PUBLIC_ENABLE_USER_ACCOUNTS !== 'false',
    enableReminders: process.env.NEXT_PUBLIC_ENABLE_REMINDERS !== 'false',
    enableApplications: process.env.NEXT_PUBLIC_ENABLE_APPLICATIONS !== 'false',
    enableComparison: process.env.NEXT_PUBLIC_ENABLE_COMPARISON !== 'false',
    enableNewsletter: process.env.NEXT_PUBLIC_ENABLE_NEWSLETTER !== 'false',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  },
} as const;
```

---

## 5. Phase 4: Mobile App Readiness

### Goal

The same API backend serves web, iOS, and Android clients.

### API Design for Mobile

#### Authentication for Mobile (JWT with Refresh Tokens)

Mobile apps need long-lived sessions with refresh tokens:

```typescript
// src/routes/user.ts — Mobile-ready auth

// POST /api/user/auth/login
userRoutes.post('/auth/login', async (c) => {
  const { email, password } = await c.req.json();

  const user = await db.platformUser.findUnique({ where: { email } });
  if (!user || !user.password) {
    return c.json({ success: false, error: 'بيانات غير صحيحة' }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return c.json({ success: false, error: 'بيانات غير صحيحة' }, 401);
  }

  // Generate access token (short-lived: 15 minutes)
  const accessToken = await new SignJWT({
    sub: user.id,
    email: user.email,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(JWT_SECRET);

  // Generate refresh token (long-lived: 30 days)
  const refreshToken = await new SignJWT({
    sub: user.id,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(REFRESH_SECRET);

  // Store refresh token hash in database
  await db.platformUser.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      // Store refresh token for validation
    },
  });

  return c.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    },
  });
});

// POST /api/user/auth/refresh
userRoutes.post('/auth/refresh', async (c) => {
  const { refreshToken } = await c.req.json();

  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);
    if (payload.type !== 'refresh') {
      return c.json({ success: false, error: 'رمز غير صالح' }, 401);
    }

    // Generate new access token
    const accessToken = await new SignJWT({
      sub: payload.sub,
      email: payload.email,
      type: 'access',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    return c.json({
      success: true,
      data: { accessToken },
    });
  } catch {
    return c.json({ success: false, error: 'يجب تسجيل الدخول مجدداً' }, 401);
  }
});
```

#### Push Notification Setup

```typescript
// src/lib/notifications/push.ts
interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushNotification(payload: PushNotificationPayload) {
  // Get user's device tokens
  const user = await db.platformUser.findUnique({
    where: { id: payload.userId },
  });

  if (!user) return;

  // Future: Implement with Firebase Cloud Messaging (FCM)
  // or Apple Push Notification Service (APNs)

  // For now, create a UserNotification record
  await db.userNotification.create({
    data: {
      userId: payload.userId,
      title: payload.title,
      message: payload.body,
      type: 'INFO',
      link: payload.data?.link,
    },
  });
}

// Usage: When a competition deadline is approaching
export async function notifyDeadlineReminder(competitionId: string) {
  const reminders = await db.userReminder.findMany({
    where: { competitionId, isNotified: false },
    include: { competition: true, user: true },
  });

  for (const reminder of reminders) {
    if (new Date(reminder.reminderDate) <= new Date()) {
      await sendPushNotification({
        userId: reminder.userId,
        title: `تذكير: ${reminder.competition.title}`,
        body: `اقترب موعد التسجيل! باقي وقت قليل.`,
        data: { link: `/competitions/${competitionId}` },
      });

      await db.userReminder.update({
        where: { id: reminder.id },
        data: { isNotified: true },
      });
    }
  }
}
```

#### API Documentation for Mobile Developers

Generate OpenAPI/Swagger documentation:

```typescript
// Install: bun add @hono/zod-openapi swagger-ui-react

import { createRoute } from '@hono/zod-openapi';
import { z } from 'zod';

const listCompetitionsRoute = createRoute({
  method: 'get',
  path: '/api/competitions',
  summary: 'List competitions',
  description: 'Get a paginated list of competitions with optional filters',
  request: {
    query: z.object({
      page: z.string().optional().describe('Page number'),
      limit: z.string().optional().describe('Items per page'),
      status: z.enum(['OPEN', 'CLOSED', 'EXPIRED', 'UPCOMING']).optional(),
      cityId: z.string().optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'List of competitions',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.array(z.object({
              id: z.string(),
              title: z.string(),
              status: z.string(),
              deadline: z.string().nullable(),
              // ... more fields
            })),
            pagination: z.object({
              total: z.number(),
              page: z.number(),
              limit: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
  },
});
```

### Mobile App API Contract

For mobile developers, the API should support:

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `POST /api/user/auth/login` | POST | No | Login (returns JWT + refresh token) |
| `POST /api/user/auth/signup` | POST | No | Register |
| `POST /api/user/auth/refresh` | POST | Refresh Token | Get new access token |
| `GET /api/competitions` | GET | No | List competitions |
| `GET /api/competitions/:id` | GET | No | Competition detail |
| `GET /api/schools` | GET | No | List schools |
| `GET /api/schools/:id` | GET | No | School detail |
| `GET /api/categories` | GET | No | List categories |
| `GET /api/cities` | GET | No | List cities |
| `GET /api/regions` | GET | No | List regions |
| `GET /api/search` | GET | No | Search |
| `GET /api/news` | GET | No | News |
| `GET /api/user/profile` | GET | JWT | User profile |
| `PUT /api/user/profile` | PUT | JWT | Update profile |
| `GET /api/user/favorites` | GET | JWT | User favorites |
| `POST /api/user/favorites` | POST | JWT | Add favorite |
| `DELETE /api/user/favorites/:id` | DELETE | JWT | Remove favorite |
| `GET /api/user/reminders` | GET | JWT | User reminders |
| `POST /api/user/reminders` | POST | JWT | Add reminder |
| `GET /api/user/applications` | GET | JWT | User applications |
| `POST /api/user/applications` | POST | JWT | Add application |
| `PUT /api/user/applications/:id` | PUT | JWT | Update application |
| `GET /api/user/notifications` | GET | JWT | User notifications |
| `PUT /api/user/notifications/:id` | PUT | JWT | Mark as read |

### Mobile SDK Example (React Native)

```typescript
// bivmor-mobile-sdk.ts
const API_BASE = 'https://api.bivmor.com/api';

class BivmorSDK {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE}/user/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
      this.refreshToken = data.data.refreshToken;
    }
    return data;
  }

  private async fetchWithAuth(path: string, options?: RequestInit) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (response.status === 401 && this.refreshToken) {
      // Auto-refresh token
      await this.refreshAccessToken();
      return this.fetchWithAuth(path, options);
    }

    return response.json();
  }

  private async refreshAccessToken() {
    const response = await fetch(`${API_BASE}/user/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });
    const data = await response.json();
    if (data.success) {
      this.accessToken = data.data.accessToken;
    }
  }

  async getCompetitions(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.fetchWithAuth(`/competitions${query}`);
  }

  async getCompetition(id: string) {
    return this.fetchWithAuth(`/competitions/${id}`);
  }

  // ... more methods
}
```

---

## 6. File Change Checklists

### Phase 1: API-First Architecture

| File | Change | New/Modified |
|------|--------|-------------|
| `src/lib/api-response.ts` | Standardized response helpers | New |
| `src/lib/rate-limit.ts` | Rate limiting middleware | New |
| `src/lib/validations/*.ts` | Zod validation schemas | New |
| `src/config/api.ts` | Add API versioning support | Modified |
| `src/middleware.ts` | Add API version rewrites | New |
| All API route files | Add validation, consistent responses | Modified |

### Phase 2: Extract Backend

| File in Backend | Source | Change |
|----------------|--------|--------|
| `src/index.ts` | New | Hono app entry point |
| `src/routes/public.ts` | From `src/app/api/competitions/`, etc. | Convert to Hono handlers |
| `src/routes/user.ts` | From `src/app/api/user/` | Convert to Hono handlers |
| `src/routes/admin.ts` | From `src/app/api/admin/` | Convert to Hono handlers |
| `src/routes/auth.ts` | From `src/app/api/auth/` | Convert to Hono handlers |
| `src/middleware/user-auth.ts` | From `src/lib/auth/user-guard.ts` | Convert to Hono middleware |
| `src/middleware/admin-auth.ts` | From `src/lib/auth/api-guard.ts` | Convert to Hono middleware |
| `src/middleware/rate-limit.ts` | From `src/lib/rate-limit.ts` | Adapt for Hono |
| `src/lib/db.ts` | Copied from main project | No changes |
| `src/lib/auth/` | Copied from main project | Adapt for Hono context |
| `src/config/` | Copied from main project | Remove frontend-only config |
| `prisma/schema.prisma` | Copied from main project | No changes |
| `package.json` | New | Hono + dependencies |

| File in Frontend | Change |
|------------------|--------|
| `src/lib/api.ts` | Add JWT token to headers |
| `src/store/user-auth.ts` | Store JWT token in localStorage |
| `src/config/api.ts` | Use `NEXT_PUBLIC_API_BASE_URL` for all URLs |
| `.env` | Set `NEXT_PUBLIC_API_BASE_URL=https://api.bivmor.com/api` |

### Phase 3: Deploy Separately

| Component | Change |
|-----------|--------|
| Backend deployment | New server (Railway/VPS) on port 3002 |
| Frontend deployment | Vercel or CDN |
| DNS | Add `api.bivmor.com` pointing to backend |
| SSL | Certificate for `api.bivmor.com` |
| CORS | Backend allows `bivmor.com` origin |
| Frontend `.env` | `NEXT_PUBLIC_API_BASE_URL=https://api.bivmor.com/api` |
| Remove from frontend | `src/app/api/`, `src/lib/auth/`, `src/lib/db.ts`, `src/admin-system/` |

### Phase 4: Mobile App Readiness

| File | Change |
|------|--------|
| `src/routes/user.ts` | Add refresh token endpoint |
| `src/lib/notifications/push.ts` | New — Push notification service |
| `src/lib/db.ts` | Add device token storage |
| OpenAPI spec | New — API documentation |
| Mobile SDK | New — TypeScript SDK for React Native |

---

## 7. What Stays the Same / What Changes

### What Stays the Same (Across All Phases)

- ✅ **Database schema** — `prisma/schema.prisma` unchanged
- ✅ **Business logic** — Same validation rules, same data transformations
- ✅ **Authentication** — Same JWT/NextAuth mechanisms (adapted to framework)
- ✅ **Frontend components** — All 13+ views and their UI remain the same
- ✅ **State management** — Zustand stores and TanStack Query configuration
- ✅ **Styling** — Tailwind CSS, shadcn/ui, RTL Arabic layout
- ✅ **User experience** — Same look and feel across all phases
- ✅ **Data model** — 17 Prisma models, 6 enums unchanged

### What Changes (Per Phase)

| Aspect | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|--------|---------|---------|---------|---------|
| **API URL** | `/api/*` | `/api/*` or `/api/v1/*` | `https://api.bivmor.com/api/*` | Same + mobile SDK |
| **Database Access** | Next.js API routes | Hono routes | Hono routes (separate server) | Same |
| **Auth Token Storage** | HttpOnly cookie | Cookie + JWT | JWT in localStorage | JWT + refresh token |
| **Deployment** | Single Next.js | Backend + Frontend | Vercel + Railway | + Mobile CDN |
| **CORS** | Same-origin | Same-origin | Cross-origin | Cross-origin |
| **Rate Limiting** | Optional | Backend | Backend | Backend |
| **API Docs** | None | Optional | OpenAPI/Swagger | OpenAPI + SDK |

### Migration Risk Assessment

| Risk | Phase 1 | Phase 2 | Phase 3 | Phase 4 |
|------|---------|---------|---------|---------|
| **Breaking changes** | Low | Medium | High | Medium |
| **Downtime** | None | Minutes | Hours | None |
| **Data loss** | None | None | None | None |
| **Rollback complexity** | Easy | Medium | Hard | Easy |
| **Testing effort** | Low | Medium | High | Medium |

---

*This guide is specific to the BIVMOR platform at `/home/z/my-project/`. All file paths, ENV variables, API routes, and configuration values reference the actual project.*
