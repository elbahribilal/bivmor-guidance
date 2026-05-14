# BIVMOR Admin Separation Guide | دليل فصل نظام الإدارة

> Step-by-step guide for separating the admin system from the main BIVMOR application, from subdomain deployment to full microservice.

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Phase 1: Subdomain Deployment](#2-phase-1-subdomain-deployment)
3. [Phase 2: Separate Project](#3-phase-2-separate-project)
4. [Phase 3: Full Microservice](#4-phase-3-full-microservice)
5. [File Change Checklists](#5-file-change-checklists)
6. [Testing Strategy](#6-testing-strategy)

---

## 1. Current State Analysis

### How Admin Works Today

The admin system is architecturally isolated but served from the same Next.js application:

```
User Request: /?admin=true
    ↓
src/app/page.tsx (checks URL parameter)
    ↓
├── Not authenticated → src/components/admin/AdminLogin.tsx
└── Authenticated → src/components/admin/AdminDashboard.tsx
    ↓
Admin API calls go to /api/admin/*
    ↓
Protected by withAdminAuth wrapper (src/lib/auth/api-guard.ts)
```

### Current File Structure

```
src/admin-system/                    ← ISOLATED, PORTABLE MODULE
├── auth/
│   ├── admin-config.ts              ← NextAuth options (standalone copy)
│   ├── admin-session.ts             ← getAdminSession, requireAdmin
│   ├── admin-guard.ts               ← requireAdminAuth, withAdminAuth
│   └── admin-store.ts               ← Client-side auth Zustand store
├── components/
│   ├── managers/
│   │   ├── CompetitionsManager.tsx   ← CRUD for competitions
│   │   ├── SchoolsManager.tsx        ← CRUD for schools
│   │   ├── CategoriesManager.tsx     ← CRUD for categories
│   │   ├── NotificationsManager.tsx  ← CRUD for notifications
│   │   └── NewsManager.tsx           ← CRUD for news
│   └── shared/
│       ├── AdminHeader.tsx           ← Admin panel header
│       └── TablePagination.tsx       ← Pagination component
├── hooks/
│   ├── use-admin-auth.ts             ← Admin authentication hook
│   └── use-admin-data.ts             ← Admin data fetching hook
├── services/
│   ├── admin-api.ts                  ← Admin API client
│   └── admin-logger.ts               ← Audit logging utility
├── types/
│   └── admin.ts                      ← Admin-specific types
└── utils/
    └── admin-helpers.ts              ← Utility functions

src/components/admin/                ← UI COMPONENTS (rendered in main page)
├── AdminLogin.tsx                    ← Login form
└── AdminDashboard.tsx                ← Main dashboard with tabs

src/app/api/admin/                   ← ADMIN API ROUTES
├── session/route.ts                  ← Session check
├── activity/route.ts                 ← Audit log
└── seed/route.ts                     ← Admin user seeding

src/lib/auth/                        ← SHARED AUTH (used by both admin and user)
├── config.ts                         ← NextAuth configuration
├── session.ts                        ← Session utilities
├── api-guard.ts                      ← API route protection
├── user-auth.ts                      ← User JWT authentication
└── user-guard.ts                     ← User route protection

src/store/admin-auth.ts               ← Admin auth Zustand store (client)
```

### Configuration Already Designed for Separation

The admin system is already configured for future separation in `src/config/admin.ts`:

```typescript
export const adminConfig = {
  route: {
    path: envConfig.admin.routePath,           // "/admin-panel"
    queryParam: 'admin',                        // "?admin=true"
  },
  api: {
    baseUrl: envConfig.admin.apiBaseUrl || '',  // Empty = same server
    isRemote: !!envConfig.admin.apiBaseUrl,     // true = separate server
  },
  deployment: {
    isSeparate: envConfig.admin.isSeparate,      // false by default
    subdomain: process.env.ADMIN_SUBDOMAIN || 'admin',
  },
  session: {
    maxAge: envConfig.adminAuth.sessionMaxAge,
    strategy: 'jwt' as const,
  },
  access: {
    allowedRoles: ['ADMIN', 'EDITOR', 'MODERATOR'] as const,
    superAdminRole: 'ADMIN' as const,
  },
  audit: {
    enabled: true,
    logSensitiveActions: ['CREATE', 'UPDATE', 'DELETE'],
  },
} as const;
```

Key ENV variables:
- `ADMIN_IS_SEPARATE` — Set to `true` when admin is on a separate subdomain
- `ADMIN_API_BASE_URL` — Set to the API URL when admin is remote
- `NEXT_PUBLIC_ADMIN_ROUTE` — Route path for admin panel
- `ADMIN_SUBDOMAIN` — Subdomain prefix (default: `admin`)

---

## 2. Phase 1: Subdomain Deployment

### Goal

Deploy admin on `admin.bivmor.com` while keeping the same codebase and API server.

```
BEFORE:
bivmor.com/?admin=true → Next.js (public + admin)

AFTER:
bivmor.com             → Next.js (public only)
admin.bivmor.com       → Next.js (admin only, same codebase)
```

### Step 1: DNS Configuration

Add a CNAME record for the admin subdomain:

| Record | Type | Value |
|--------|------|-------|
| `bivmor.com` | A | Your server IP |
| `www.bivmor.com` | CNAME | `bivmor.com` |
| `admin.bivmor.com` | CNAME | `bivmor.com` |

### Step 2: Update Environment Variables

```env
# .env additions for admin subdomain
ADMIN_IS_SEPARATE=true
ADMIN_API_BASE_URL=              # Keep empty — same API server
ADMIN_SUBDOMAIN=admin
NEXTAUTH_URL=https://admin.bivmor.com   # Admin auth callback URL
```

### Step 3: Update Nginx Configuration

```nginx
# Public site
server {
    listen 443 ssl http2;
    server_name bivmor.com www.bivmor.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin subdomain
server {
    listen 443 ssl http2;
    server_name admin.bivmor.com;

    # Restrict access (optional, additional security)
    # allow 192.168.1.0/24;  # Office IP range
    # deny all;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: Update page.tsx for Subdomain Detection

Modify `src/app/page.tsx` to detect the admin subdomain:

```typescript
// Add this logic to the admin detection
const isAdminSubdomain = typeof window !== 'undefined' &&
  window.location.hostname.startsWith('admin.');

const urlParams = new URLSearchParams(window.location.search);
const isAdminParam = urlParams.get('admin') === 'true';

// Show admin if on admin subdomain OR ?admin=true parameter
const shouldShowAdmin = isAdminSubdomain || isAdminParam;
```

### Step 5: Update CORS

```env
CORS_ORIGINS=https://bivmor.com,https://admin.bivmor.com
```

### Step 6: SSL Certificate for Admin Subdomain

```bash
# Obtain SSL certificate for admin subdomain
sudo certbot --nginx -d admin.bivmor.com

# Or use a wildcard certificate
sudo certbot --nginx -d bivmor.com -d www.bivmor.com -d admin.bivmor.com
```

### Step 7: Hide Admin from Public Site

When `ADMIN_IS_SEPARATE=true`, the public site should NOT show admin UI even with `?admin=true`:

Update `src/app/page.tsx`:

```typescript
const shouldShowAdmin = adminConfig.deployment.isSeparate
  ? isAdminSubdomain  // Only show on admin subdomain
  : isAdminParam;     // Or via ?admin=true on same domain
```

### What Stays the Same in Phase 1

- ✅ Same codebase (single git repository)
- ✅ Same API server (port 3000)
- ✅ Same database
- ✅ Same Prisma client
- ✅ Same authentication system (NextAuth)
- ✅ Same admin components and managers
- ✅ No code splitting or refactoring needed

### What Changes in Phase 1

- 🔄 Nginx configuration (add admin subdomain)
- 🔄 DNS records (add CNAME for admin subdomain)
- 🔄 `.env` file (add `ADMIN_IS_SEPARATE=true`)
- 🔄 `src/app/page.tsx` (add subdomain detection logic)
- 🔄 SSL certificate (add admin subdomain)
- 🔄 `CORS_ORIGINS` (add admin subdomain)

---

## 3. Phase 2: Separate Project

### Goal

Extract the admin system into a completely separate Next.js project with its own deployment, but sharing the same API and database.

```
BEFORE (Phase 1):
bivmor.com             → Next.js (public only, same codebase)
admin.bivmor.com       → Next.js (admin only, same codebase)

AFTER (Phase 2):
bivmor.com             → Next.js (public frontend)
admin.bivmor.com       → Separate Next.js project (admin only)
api.bivmor.com         → Shared API server (could still be Next.js)
```

### Step 1: Create the Admin Project

```bash
# Create a new Next.js project for admin
mkdir bivmor-admin && cd bivmor-admin
bunx create-next-app@latest . --typescript --tailwind --app

# Install same dependencies
bun add @prisma/client next-auth bcryptjs zustand @tanstack/react-query
bun add @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-select
bun add framer-motion lucide-react recharts sonner
bun add -d prisma
```

### Step 2: Copy Admin Files

```bash
# Copy the isolated admin-system module
cp -r ../my-project/src/admin-system/ ./src/admin-system/

# Copy admin UI components
cp -r ../my-project/src/components/admin/ ./src/components/admin/

# Copy admin-related API routes
cp -r ../my-project/src/app/api/admin/ ./src/app/api/admin/
cp -r ../my-project/src/app/api/auth/ ./src/app/api/auth/

# Copy shared auth library
cp -r ../my-project/src/lib/auth/ ./src/lib/auth/
cp ../my-project/src/lib/db.ts ./src/lib/

# Copy shared config
cp -r ../my-project/src/config/ ./src/config/

# Copy Prisma schema
cp -r ../my-project/prisma/ ./prisma/

# Copy shared types
cp ../my-project/src/types/index.ts ./src/types/index.ts

# Copy shared UI components used by admin
cp -r ../my-project/src/components/ui/ ./src/components/ui/
```

### Step 3: Create Admin page.tsx

Create `src/app/page.tsx` for the admin project:

```typescript
'use client';

import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAdminAuth } from '@/admin-system/hooks/use-admin-auth';

export default function AdminPage() {
  const { session, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return session ? <AdminDashboard /> : <AdminLogin />;
}
```

### Step 4: Update Environment Variables

Create `.env` for the admin project:

```env
# Admin Project Environment

# Database (SHARED with main app)
DATABASE_URL="file:./db/custom.db"
# Or PostgreSQL: "postgresql://bivmor:password@host:5432/bivmor"

# Admin Auth
NEXTAUTH_SECRET="<same-as-main-app-or-different>"
NEXTAUTH_URL="https://admin.bivmor.com"
ADMIN_SESSION_MAX_AGE="43200"

# User Auth (needed for shared lib)
USER_JWT_SECRET="<same-as-main-app>"

# Admin System
NEXT_PUBLIC_ADMIN_ROUTE="/"
ADMIN_API_BASE_URL="https://api.bivmor.com"  # Point to main API
ADMIN_IS_SEPARATE="true"
ADMIN_SUBDOMAIN="admin"

# Application
NEXT_PUBLIC_APP_NAME="BIVMOR Admin"
NEXT_PUBLIC_APP_URL="https://admin.bivmor.com"
NEXT_PUBLIC_API_BASE_URL="https://api.bivmor.com/api"
NEXT_PUBLIC_ADMIN_API_PREFIX="/api/admin"

# Feature Flags
NEXT_PUBLIC_ENABLE_USER_ACCOUNTS="false"  # No user accounts in admin project
NEXT_PUBLIC_ENABLE_REMINDERS="false"
NEXT_PUBLIC_ENABLE_APPLICATIONS="false"
NEXT_PUBLIC_ENABLE_COMPARISON="false"
NEXT_PUBLIC_ENABLE_NEWSLETTER="false"
NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"   # Admin notifications

# Security
CORS_ORIGINS="https://bivmor.com,https://admin.bivmor.com"
NODE_ENV="production"
```

### Step 5: Update API Client for Remote Backend

Modify `src/admin-system/services/admin-api.ts` to use remote API:

```typescript
// BEFORE: Same-origin API calls
const API_BASE = '/api/admin';

// AFTER: Remote API calls
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL
  ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin`
  : '/api/admin';

// All fetch calls should include credentials for cookies
async function adminFetch(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',  // Important for cross-origin cookies
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}
```

### Step 6: Configure CORS on Main Backend

Update the main BIVMOR project's CORS settings:

```env
# Main project .env
CORS_ORIGINS=https://bivmor.com,https://admin.bivmor.com
```

Or update the CORS middleware in the main project's API routes.

### Step 7: Handle Cross-Origin Authentication

NextAuth cookies need to work across subdomains. Update `src/lib/auth/config.ts`:

```typescript
// In NextAuth options:
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',  // or 'none' for cross-origin
      path: '/',
      secure: true,
      domain: '.bivmor.com',  // Share cookies across subdomains
    },
  },
},
```

### Step 8: Update Nginx for Separate Deployments

```nginx
# Main site
server {
    listen 443 ssl http2;
    server_name bivmor.com www.bivmor.com;

    location / {
        proxy_pass http://127.0.0.1:3000;  # Main Next.js app
    }
}

# Admin site
server {
    listen 443 ssl http2;
    server_name admin.bivmor.com;

    location / {
        proxy_pass http://127.0.0.1:3001;  # Admin Next.js app
    }
}

# API (could be either app, or dedicated)
server {
    listen 443 ssl http2;
    server_name api.bivmor.com;

    location / {
        proxy_pass http://127.0.0.1:3000;  # Main app serves API
    }
}
```

### APIs That Need to Be Shared

These API routes are needed by both the public site and admin:

| API Route | Used By | Notes |
|-----------|---------|-------|
| `GET /api/competitions` | Public + Admin | Read-only for public, CRUD for admin |
| `GET/POST/PUT/DELETE /api/competitions/[id]` | Admin | Admin-only mutations |
| `GET /api/schools` | Public + Admin | Read-only for public, CRUD for admin |
| `GET/POST/PUT/DELETE /api/schools/[id]` | Admin | Admin-only mutations |
| `GET/POST /api/categories` | Public + Admin | Categories are shared |
| `GET/POST /api/admin/session` | Admin | Session verification |
| `GET/POST /api/admin/activity` | Admin | Audit logging |
| `POST /api/admin/seed` | Admin | Initial setup |
| `GET/POST /api/auth/[...nextauth]` | Admin | NextAuth endpoints |
| `GET/PUT /api/notifications` | Public + Admin | Different data for each |
| `GET/POST/PUT/DELETE /api/news` | Admin | News CRUD |
| `GET /api/settings` | Public + Admin | Site settings |
| `GET /api/dashboard/stats` | Admin | Dashboard statistics |

### What Stays the Same in Phase 2

- ✅ Database schema and data
- ✅ Prisma client configuration
- ✅ Admin components (managers, headers, etc.)
- ✅ Admin authentication (NextAuth)
- ✅ Admin audit logging
- ✅ Main public site functionality
- ✅ API route logic (just accessed from different origins)

### What Changes in Phase 2

- 🔄 Separate git repository for admin project
- 🔄 Separate deployment (different port/server)
- 🔄 API client uses `NEXT_PUBLIC_API_BASE_URL` for remote calls
- 🔄 CORS configuration allows admin subdomain
- 🔄 NextAuth cookies shared across subdomains (`.bivmor.com`)
- 🔄 Main project removes admin components from `page.tsx`
- 🔄 Admin project has its own `page.tsx` (always shows admin)
- 🔄 Two PM2 processes or Docker containers

---

## 4. Phase 3: Full Microservice

### Goal

Admin as a completely separate service with its own database access, API-only communication, and event-driven updates.

```
BEFORE (Phase 2):
bivmor.com             → Next.js (public frontend)
admin.bivmor.com       → Separate Next.js (admin, reads same DB)
api.bivmor.com         → Main API server

AFTER (Phase 3):
bivmor.com             → Next.js (public frontend)
admin.bivmor.com       → Admin Next.js (own DB access + API)
api.bivmor.com         → Main API server (primary data source)
                          ↕ Event bus / Webhooks
admin-api.bivmor.com   → Admin API service (audit, settings)
```

### Step 1: Define API Contracts

Create shared API type definitions in a shared package:

```typescript
// packages/api-types/src/admin.ts
export interface AdminCompetitionAPI {
  list(params: { page?: number; limit?: number; status?: string }): Promise<{
    data: Competition[];
    total: number;
  }>;
  create(data: CreateCompetitionInput): Promise<Competition>;
  update(id: string, data: UpdateCompetitionInput): Promise<Competition>;
  delete(id: string): Promise<void>;
}

export interface AdminSchoolAPI {
  list(params: { page?: number; limit?: number; type?: string }): Promise<{
    data: School[];
    total: number;
  }>;
  create(data: CreateSchoolInput): Promise<School>;
  update(id: string, data: UpdateSchoolInput): Promise<School>;
  delete(id: string): Promise<void>;
}
```

### Step 2: Add API Authentication Between Services

The admin project needs to authenticate with the main API:

```typescript
// src/lib/service-auth.ts
import { SignJWT, jwtVerify } from 'jose';

const SERVICE_SECRET = new TextEncoder().encode(
  process.env.SERVICE_AUTH_SECRET || 'service-auth-secret'
);

export async function createServiceToken(serviceName: string): Promise<string> {
  return new SignJWT({ service: serviceName })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')  // Short-lived tokens
    .sign(SERVICE_SECRET);
}

export async function verifyServiceToken(token: string) {
  const { payload } = await jwtVerify(token, SERVICE_SECRET);
  return payload;
}
```

Add a middleware to the main API that verifies service tokens:

```typescript
// In main project: src/middleware.ts or API route middleware
export async function verifyServiceRequest(request: Request) {
  const serviceToken = request.headers.get('X-Service-Token');
  if (!serviceToken) return null;

  try {
    const payload = await verifyServiceToken(serviceToken);
    return payload;
  } catch {
    return null;
  }
}
```

### Step 3: Implement Event-Driven Updates

When admin creates/updates/deletes data, events should be published:

```typescript
// src/lib/events.ts
type EventType = 'competition.created' | 'competition.updated' | 'competition.deleted'
  | 'school.created' | 'school.updated' | 'school.deleted'
  | 'category.created' | 'category.updated' | 'category.deleted';

interface PlatformEvent {
  type: EventType;
  entityId: string;
  entityType: string;
  data?: unknown;
  timestamp: Date;
  source: 'admin' | 'system';
}

// Option A: Database-based event queue (simple)
export async function publishEvent(event: PlatformEvent) {
  await db.platformEvent.create({ data: event });
}

// Option B: Webhook-based (real-time)
export async function publishWebhook(event: PlatformEvent) {
  const webhookUrl = process.env.MAIN_APP_WEBHOOK_URL;
  if (!webhookUrl) return;

  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Secret': process.env.WEBHOOK_SECRET || '',
    },
    body: JSON.stringify(event),
  });
}
```

### Step 4: Separate Admin Database Access

Admin can either:
- **A)** Access the same database (read/write) directly via Prisma
- **B)** Access the main API only (no direct DB access)

**Option A is simpler but creates coupling. Option B is cleaner.**

For Option B, the admin project makes API calls to the main backend:

```typescript
// src/admin-system/services/admin-api.ts (Phase 3 version)
import { createServiceToken } from '@/lib/service-auth';

const API_BASE = process.env.ADMIN_API_BASE_URL || 'https://api.bivmor.com';

async function adminFetch(path: string, options?: RequestInit) {
  const serviceToken = await createServiceToken('bivmor-admin');

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
      'X-Service-Token': serviceToken,
      // Also include admin session cookie for authorization
      credentials: 'include',
    },
  });

  return response;
}
```

### Step 5: Deploy Admin as Separate Service

```bash
# Admin project runs on port 3001
cd /home/bivmor/bivmor-admin
PORT=3001 bun .next/standalone/server.js
```

PM2 ecosystem for Phase 3:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'bivmor-public',
      script: '.next/standalone/server.js',
      cwd: '/home/bivmor/bivmor',
      env: { PORT: 3000, NODE_ENV: 'production' },
    },
    {
      name: 'bivmor-admin',
      script: '.next/standalone/server.js',
      cwd: '/home/bivmor/bivmor-admin',
      env: { PORT: 3001, NODE_ENV: 'production' },
    },
  ]
};
```

### What Stays the Same in Phase 3

- ✅ Database schema (same data, different access patterns)
- ✅ Public site functionality (unchanged)
- ✅ Admin UI components (same look and feel)
- ✅ Admin authentication (NextAuth)
- ✅ Prisma schema definitions

### What Changes in Phase 3

- 🔄 Admin uses API-only communication (no direct DB access in Option B)
- 🔄 Service-to-service authentication (JWT service tokens)
- 🔄 Event-driven architecture for data synchronization
- 🔄 Webhook or event queue for real-time updates
- 🔄 Separate deployment pipelines
- 🔄 Monitoring spans across multiple services
- 🔄 Need distributed tracing (optional)

---

## 5. File Change Checklists

### Phase 1: Subdomain Deployment

| File | Change | Priority |
|------|--------|----------|
| `.env` | Add `ADMIN_IS_SEPARATE=true`, update `NEXTAUTH_URL` | Required |
| `src/app/page.tsx` | Add subdomain detection for admin | Required |
| Nginx config | Add `admin.bivmor.com` server block | Required |
| DNS records | Add CNAME for `admin.bivmor.com` | Required |
| SSL certificate | Add `admin.bivmor.com` to certificate | Required |
| `src/config/admin.ts` | No changes (already supports subdomain) | N/A |
| `src/admin-system/**` | No changes | N/A |
| `src/components/admin/**` | No changes | N/A |
| `src/app/api/**` | No changes | N/A |

### Phase 2: Separate Project

| File in Admin Project | Source | Change |
|-----------------------|--------|--------|
| `src/admin-system/**` | Copied from main project | Update API base URL |
| `src/components/admin/**` | Copied from main project | No changes |
| `src/app/page.tsx` | New | Always show admin |
| `src/app/api/admin/**` | Copied from main project | Add CORS headers |
| `src/app/api/auth/**` | Copied from main project | Update cookie domain |
| `src/lib/auth/**` | Copied from main project | Update for subdomain |
| `src/lib/db.ts` | Copied from main project | No changes |
| `src/config/**` | Copied from main project | Update defaults |
| `prisma/schema.prisma` | Copied from main project | No changes |
| `package.json` | New project | Same dependencies |
| `.env` | New | Admin-specific config |

| File in Main Project | Change |
|---------------------|--------|
| `src/app/page.tsx` | Remove admin components, remove `?admin=true` |
| `src/admin-system/**` | Can be deleted (moved to admin project) |
| `src/components/admin/**` | Can be deleted (moved to admin project) |
| `.env` | Remove admin-specific variables |
| `src/config/admin.ts` | Simplify (no admin in main project) |

### Phase 3: Full Microservice

| File | Change |
|------|--------|
| `src/lib/service-auth.ts` | New — Service-to-service authentication |
| `src/lib/events.ts` | New — Event publishing system |
| `src/admin-system/services/admin-api.ts` | Updated — Use service tokens |
| `src/app/api/admin/**` | Add service token verification middleware |
| Main project API routes | Add `X-Service-Token` header verification |
| Webhook endpoint | New — `POST /api/webhooks/admin` |
| Event handlers | New — Process admin events |
| Monitoring | Updated — Span across services |
| Deployment config | Updated — Multiple services |

---

## 6. Testing Strategy

### Phase 1 Testing

```bash
# 1. Test admin subdomain access
curl -I https://admin.bivmor.com
# Expected: 200 OK

# 2. Test public site doesn't show admin with ?admin=true
curl -I "https://bivmor.com/?admin=true"
# Expected: 200 OK, but no admin UI rendered

# 3. Test admin login on subdomain
# Navigate to https://admin.bivmor.com
# Should show AdminLogin component

# 4. Test admin API from admin subdomain
curl https://admin.bivmor.com/api/admin/session
# Expected: 401 (not authenticated) or session data

# 5. Test CORS
curl -H "Origin: https://admin.bivmor.com" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS https://bivmor.com/api/competitions -I
# Expected: Access-Control-Allow-Origin: https://admin.bivmor.com

# 6. Test SSL
curl -vI https://admin.bivmor.com 2>&1 | grep "SSL\|TLS"
# Expected: TLSv1.3

# 7. Test all admin CRUD operations
# Login → Create competition → Update → Delete
```

### Phase 2 Testing

```bash
# 1. Test admin project runs independently
cd /home/bivmor/bivmor-admin
bun run dev  # Port 3001
curl http://localhost:3001
# Expected: Admin login page

# 2. Test admin API calls to main backend
# With admin running on 3001 and main on 3000:
curl http://localhost:3001/api/admin/session
# Should proxy/check against main backend

# 3. Test cross-origin authentication
# Login on admin.bivmor.com
# Verify session cookie is shared with .bivmor.com domain

# 4. Test all admin managers
# - CompetitionsManager: CRUD operations
# - SchoolsManager: CRUD operations
# - CategoriesManager: CRUD operations
# - NotificationsManager: CRUD operations
# - NewsManager: CRUD operations

# 5. Test main site still works
curl http://localhost:3000/api/competitions
# Expected: Competition data (public API works)

# 6. Test no admin UI on main site
curl http://localhost:3000/?admin=true
# Expected: Regular home page (no admin)
```

### Phase 3 Testing

```bash
# 1. Test service-to-service authentication
SERVICE_TOKEN=$(bun run scripts/generate-service-token.ts)
curl -H "X-Service-Token: $SERVICE_TOKEN" \
     https://api.bivmor.com/api/competitions
# Expected: Data response

# 2. Test invalid service token
curl -H "X-Service-Token: invalid-token" \
     https://api.bivmor.com/api/competitions
# Expected: 401 Unauthorized

# 3. Test event publishing
# Create a competition in admin
# Verify event is published (check webhook or event queue)

# 4. Test webhook delivery
curl -X POST https://bivmor.com/api/webhooks/admin \
  -H "X-Webhook-Secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{"type":"competition.created","entityId":"test"}'
# Expected: 200 OK

# 5. Test data consistency
# Create competition in admin
# Verify it appears on public site
# Update competition in admin
# Verify update reflects on public site
# Delete competition in admin
# Verify removal on public site

# 6. Test failure scenarios
# - Admin service is down → Public site still works (cached data)
# - API service is down → Admin shows error, doesn't break
# - Database is down → Both show appropriate error pages

# 7. Load testing
# Admin creates 100 competitions
# Public site can still serve read requests
```

### Automated Tests for Each Phase

```typescript
// tests/admin-separation.test.ts
import { describe, it, expect } from 'vitest';

describe('Admin Separation', () => {
  it('Phase 1: Admin subdomain is accessible', async () => {
    const response = await fetch('https://admin.bivmor.com');
    expect(response.ok).toBe(true);
  });

  it('Phase 1: Public site hides admin with ?admin=true', async () => {
    const response = await fetch('https://bivmor.com/?admin=true');
    const html = await response.text();
    expect(html).not.toContain('AdminDashboard');
  });

  it('Phase 2: Admin API uses remote base URL', async () => {
    process.env.ADMIN_API_BASE_URL = 'https://api.bivmor.com';
    process.env.ADMIN_IS_SEPARATE = 'true';
    // Verify admin-api.ts uses the correct base URL
  });

  it('Phase 3: Service tokens are valid', async () => {
    const token = await createServiceToken('bivmor-admin');
    const payload = await verifyServiceToken(token);
    expect(payload.service).toBe('bivmor-admin');
  });
});
```

---

## Decision Matrix: Which Phase to Choose?

| Factor | Phase 1 | Phase 2 | Phase 3 |
|--------|---------|---------|---------|
| **Implementation Time** | 2-4 hours | 1-2 days | 1-2 weeks |
| **Code Changes** | Minimal | Moderate | Significant |
| **Infrastructure** | Same server | Same or different | Separate services |
| **Security Isolation** | Low (same codebase) | Medium (separate deploy) | High (API-only) |
| **Scalability** | Same as monolith | Admin scales independently | Full microservice scaling |
| **Team Requirement** | 1 developer | 1-2 developers | 2+ developers |
| **Maintenance** | Low | Medium | High |
| **Recommended For** | Small teams, early stage | Growing teams, production | Large teams, enterprise |

### Recommendation

Start with **Phase 1** (subdomain deployment). It provides immediate security benefits with minimal effort. Move to Phase 2 when you need independent deployments. Phase 3 is only necessary for large-scale operations with dedicated DevOps.

---

*This guide is specific to the BIVMOR platform at `/home/z/my-project/`. All file paths, ENV variables, and configuration values reference the actual project.*
