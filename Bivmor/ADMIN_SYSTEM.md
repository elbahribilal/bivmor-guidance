# Admin System Documentation | وثائق نظام الإدارة

> BIVMOR - Moroccan Educational Competitions & Opportunities Platform

---

## Overview | نظرة عامة

The BIVMOR admin system is an **architecturally isolated** module for managing platform content. It uses a completely separate authentication system from the public user system and is designed to be deployable as a standalone subdomain in the future.

**Key principle:** Admin is hidden, not just protected. There are no public links to the admin panel.

---

## Admin Access | الوصول للإدارة

### How to Access

The admin panel is accessible via a **hidden URL parameter**:

```
https://bivmor.com/?admin=true
```

This triggers the `AdminLogin` component (if not authenticated) or the `AdminDashboard` component (if authenticated) to render instead of the regular home page.

### Access Flow

```
1. User navigates to /?admin=true
2. page.tsx checks URL for admin query parameter
3. If no admin session → renders <AdminLogin />
4. If admin session exists → renders <AdminDashboard />
5. Admin dashboard has tabs for managing all content
```

**Implementation in `src/app/page.tsx`:**
```typescript
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get('admin') === 'true';
// If isAdmin → show AdminLogin or AdminDashboard
```

### Why Hidden Access?

- **Security through obscurity** — Not discoverable by casual users
- **Clean public UI** — No admin links cluttering the public interface
- **Subdomain-ready** — When moved to `admin.bivmor.com`, the same code works
- **Simple** — No separate route or middleware needed

> ⚠️ This is NOT a replacement for proper authentication. Always use strong passwords.

---

## Admin Authentication | مصادقة الأدمين

### Technology Stack

| Component | Technology | File |
|---|---|---|
| Auth Framework | NextAuth.js v4 | `src/lib/auth/config.ts` |
| Strategy | JWT | `session: { strategy: 'jwt' }` |
| Password Hashing | bcryptjs | Inside `authorize()` function |
| Session Duration | 24 hours | `session: { maxAge: 86400 }` |
| Secret | `NEXTAUTH_SECRET` | Environment variable |

### Authentication Flow

```
1. Admin enters email + password in AdminLogin form
2. Frontend calls adminAuthApi.login(email, password)
   ├── GET  /api/auth/csrf          → Get CSRF token
   └── POST /api/auth/callback/credentials  → Submit credentials
3. NextAuth authorize() function in src/lib/auth/config.ts:
   ├── Find User by email
   ├── Check isActive flag
   ├── Compare password with bcrypt
   ├── Verify role is ADMIN or EDITOR
   └── Return user object with id, email, name, role
4. NextAuth creates JWT session
5. Session stored in httpOnly cookie: next-auth.session-token
6. Frontend verifies session via GET /api/admin/session
```

### Session Verification

Admin session is verified via:

**Server-side** (`src/lib/auth/session.ts`):
```typescript
import { getAdminSession, requireAdmin } from '@/lib/auth/session';

// Get session (returns null if not authenticated)
const session = await getAdminSession();

// Require session (throws if not authenticated)
const admin = await requireAdmin();
```

**Client-side** (`src/admin-system/auth/admin-store.ts`):
- Zustand store manages admin auth state on the client
- Checks session via `adminAuthApi.checkSession()`
- Used by admin components to show/hide authenticated UI

### Session Object

```typescript
interface AdminSession {
  id: string;
  email: string;
  name: string | null;
  role: string; // 'ADMIN' | 'EDITOR' | 'MODERATOR'
}
```

---

## Role-Based Access Control (RBAC) | التحكم في الوصول حسب الدور

### Roles

| Role | Arabic | Description | Access Level |
|---|---|---|---|
| `ADMIN` | مدير | Full access to all admin features | Super Admin |
| `EDITOR` | محرر | Can create/edit content, limited settings | Content Manager |
| `MODERATOR` | مشرف | Can review and moderate content (reserved) | Limited |

### Current Role Enforcement

Currently, the system allows **ADMIN** and **EDITOR** roles to access the admin panel. The `MODERATOR` role exists in the database schema but is not yet implemented in the UI.

**Enforcement points:**

1. **Login** (`src/lib/auth/config.ts`):
   ```typescript
   if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
     throw new Error('ليس لديك صلاحية الوصول');
   }
   ```

2. **Session Check** (`src/lib/auth/session.ts`):
   ```typescript
   if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
     return null;
   }
   ```

3. **API Protection** (`src/lib/auth/api-guard.ts`):
   ```typescript
   if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
     return { authorized: false, response: NextResponse.json(...) };
   }
   ```

4. **Admin Config** (`src/config/admin.ts`):
   ```typescript
   access: {
     allowedRoles: ['ADMIN', 'EDITOR', 'MODERATOR'] as const,
     superAdminRole: 'ADMIN' as const,
   }
   ```

### Future: Fine-Grained Permissions

To implement more granular permissions:

1. Add a `permissions` JSON field to the `User` model
2. Create a `hasPermission(action, entity)` helper
3. Check specific permissions in API routes
4. Hide/show UI elements based on permissions

---

## Admin API Protection | حماية واجهات الأدمين

### withAdminAuth Wrapper

All admin-protected API routes use the `withAdminAuth` wrapper:

```typescript
import { withAdminAuth } from '@/lib/auth/api-guard';

export const POST = withAdminAuth(async (request) => {
  // This handler only runs if admin is authenticated
  const body = await request.json();
  // ... process request
  return NextResponse.json({ success: true });
});
```

### requireAdminAuth Direct

For more control, use `requireAdminAuth` directly:

```typescript
import { requireAdminAuth } from '@/lib/auth/api-guard';

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  
  if (!authResult.authorized) {
    return authResult.response; // 401 or 403
  }
  
  // Access the authenticated user
  const { id, email, role } = authResult.user;
  
  // ... process request
}
```

### Auth Response Codes

| Status | Meaning |
|---|---|
| `401` | No session / not logged in |
| `403` | Session exists but role is not ADMIN/EDITOR |
| `500` | Error checking authentication |

---

## Admin Audit Logging | سجل تدقيق الأدمين

### Overview

All admin actions are logged in the `AdminAuditLog` table for security and compliance.

### Log Structure

```typescript
interface AdminAuditLog {
  id: string;
  userId: string;        // Who performed the action
  userEmail: string;     // Denormalized for fast queries
  userRole: string;      // Role at time of action
  action: string;        // CREATE, UPDATE, DELETE, LOGIN, etc.
  entity: string;        // Competition, School, Category, etc.
  entityId: string?;     // ID of affected entity
  details: string?;      // Human-readable description
  ipAddress: string?;    // Request IP (for future implementation)
  userAgent: string?;    // Browser user agent (for future implementation)
  createdAt: DateTime;
}
```

### Activity Log API

**GET `/api/admin/activity`** — Retrieve logs (paginated, filterable)
**POST `/api/admin/activity`** — Create a log entry

### Logged Actions

The admin system logs these action types (configured in `src/config/admin.ts`):

```typescript
audit: {
  enabled: true,
  logSensitiveActions: ['CREATE', 'UPDATE', 'DELETE'],
}
```

### How to Add Logging to a New API Route

```typescript
import { db } from '@/lib/db';
import { withAdminAuth } from '@/lib/auth/api-guard';

export const POST = withAdminAuth(async (request) => {
  // ... perform the action
  
  // Log it
  await db.adminAuditLog.create({
    data: {
      userId: authResult.user.id,
      userEmail: authResult.user.email,
      userRole: authResult.user.role,
      action: 'CREATE',
      entity: 'Competition',
      entityId: newCompetition.id,
      details: `Created competition: ${newCompetition.title}`,
    },
  });
  
  return NextResponse.json({ data: newCompetition });
});
```

---

## Admin Components Structure | هيكل مكونات الأدمين

### Isolated Module (`src/admin-system/`)

```
src/admin-system/
├── auth/
│   ├── admin-config.ts     ← NextAuth options (standalone copy)
│   ├── admin-session.ts    ← getAdminSession, requireAdmin
│   ├── admin-guard.ts      ← requireAdminAuth, withAdminAuth
│   └── admin-store.ts      ← Client-side auth Zustand store
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
│   ├── use-admin-auth.ts   ← Admin authentication hook
│   └── use-admin-data.ts   ← Admin data fetching hook
├── services/
│   ├── admin-api.ts        ← Admin API client
│   └── admin-logger.ts     ← Audit logging utility
├── types/
│   └── admin.ts            ← Admin-specific type definitions
└── utils/
    └── admin-helpers.ts    ← Admin utility functions
```

### UI Components (`src/components/admin/`)

```
src/components/admin/
├── AdminLogin.tsx           ← Login form with email/password
└── AdminDashboard.tsx       ← Main dashboard with tabs:
    ├── Overview tab (stats cards)
    ├── Competitions tab (CompetitionsManager)
    ├── Schools tab (SchoolsManager)
    ├── Categories tab (CategoriesManager)
    ├── Notifications tab (NotificationsManager)
    ├── News tab (NewsManager)
    └── Settings tab (site settings form)
```

### Why Two Locations?

The `admin-system/` folder contains **isolated, portable** code that can be extracted to a separate project. The `components/admin/` folder contains **UI components** that are rendered in the main page.tsx.

When moving admin to a subdomain:
1. Copy `src/admin-system/` to the new project
2. Copy `src/components/admin/` to the new project
3. Update `ADMIN_API_BASE_URL` to point to the main API

---

## First Admin Setup | إعداد الأدمين الأول

### Step 1: Seed the Admin User

```bash
curl -X POST http://localhost:3000/api/admin/seed \
  -H "x-admin-init: bivmor-init-2024" \
  -H "Content-Type: application/json"
```

**Required header:** `x-admin-init: bivmor-init-2024`

This is a security measure to prevent unauthorized admin creation. The header value is a shared secret that should be changed in production.

### Step 2: Access Admin Panel

Navigate to: `http://localhost:3000/?admin=true`

### Step 3: Login

- **Email:** `admin@bivmor.ma`
- **Password:** `Bivmor@Admin2024!`

### Step 4: Change Password (Important!)

After first login, immediately change the default password via the admin settings.

### Seed Endpoint Code (`src/app/api/admin/seed/route.ts`)

```typescript
export async function POST(request: Request) {
  // Verify secret header
  const authHeader = request.headers.get('x-admin-init');
  if (authHeader !== 'bivmor-init-2024') {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  // Check if admin already exists
  const existingAdmin = await db.user.findUnique({
    where: { email: 'admin@bivmor.ma' },
  });

  if (existingAdmin) {
    return NextResponse.json({ message: 'حساب الأدمين موجود بالفعل', existing: true });
  }

  // Create admin user
  const hashedPassword = await hash('Bivmor@Admin2024!', 12);
  const admin = await db.user.create({
    data: {
      email: 'admin@bivmor.ma',
      name: 'مدير المنصة',
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  return NextResponse.json({ message: 'تم إنشاء حساب الأدمين بنجاح', admin });
}
```

---

## Separating Admin to a Subdomain | فصل الأدمين إلى نطاق فرعي

The architecture is designed for future separation:

### Current (Single Server)
```
bivmor.com/?admin=true → Next.js (public + admin)
```

### Future (Separate Subdomain)
```
bivmor.com           → Next.js (public only)
admin.bivmor.com     → Next.js (admin only)
api.bivmor.com       → Shared API server
```

### Migration Steps

1. **Set environment variables:**
   ```env
   ADMIN_IS_SEPARATE=true
   ADMIN_API_BASE_URL=https://api.bivmor.com
   NEXT_PUBLIC_ADMIN_ROUTE=/admin-panel
   ADMIN_SUBDOMAIN=admin
   ```

2. **Create a new Next.js project** with the admin code:
   - Copy `src/admin-system/` → new project
   - Copy `src/components/admin/` → new project
   - Copy admin-related API routes → new project
   - Update `admin-config.ts` to use the shared database

3. **Update the main project:**
   - Remove admin components from `page.tsx`
   - Remove `?admin=true` handling
   - Point admin API calls to `ADMIN_API_BASE_URL`

4. **Configure DNS:**
   - Add `admin.bivmor.com` DNS record
   - Configure SSL certificate for the subdomain

5. **Update CORS settings:**
   ```env
   CORS_ORIGINS=https://bivmor.com,https://admin.bivmor.com
   ```

---

## Security Considerations | اعتبارات الأمان

1. **Change default credentials** — The seeded admin password must be changed immediately
2. **Change the init secret** — `bivmor-init-2024` should be replaced in production
3. **Use HTTPS** — Admin sessions are cookies; always use HTTPS in production
4. **Secure NEXTAUTH_SECRET** — Must be a strong, random string in production
5. **IP restrictions** — Consider restricting admin access by IP range
6. **Audit logging** — Monitor `AdminAuditLog` for suspicious activity
7. **Session expiry** — Admin sessions expire after 24 hours (configurable)
8. **No CORS for admin** — Admin API routes should not be accessible cross-origin
