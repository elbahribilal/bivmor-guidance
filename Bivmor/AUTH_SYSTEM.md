# Authentication System Documentation | وثائق نظام المصادقة

> BIVMOR - Moroccan Educational Competitions & Opportunities Platform

---

## Overview | نظرة عامة

BIVMOR uses a **dual authentication architecture** with two completely separate systems:

1. **Admin Auth** — NextAuth.js v4 with JWT strategy (for admin panel users)
2. **User Auth** — Custom JWT with jose + bcryptjs (for regular platform users)

These systems use **different database tables**, **different cookies**, **different session durations**, and **different auth libraries**. They are intentionally isolated for security.

---

## Architecture Comparison | مقارنة البنية

| Aspect | Admin Auth (أدمين) | User Auth (مستخدم) |
|---|---|---|
| **Auth Library** | NextAuth.js v4 | Custom (jose + bcryptjs) |
| **Database Table** | `User` | `PlatformUser` |
| **Session Strategy** | JWT (via NextAuth) | httpOnly Cookie (via jose) |
| **Cookie Name** | `next-auth.session-token` | `bivmor_user_session` |
| **Session Duration** | 24 hours (86400s) | 7 days (604800s) |
| **Password Hashing** | bcryptjs (in authorize()) | bcryptjs (12 rounds) |
| **Token Algorithm** | NextAuth internal (HS256) | jose HS256 |
| **Login Endpoint** | `/api/auth/callback/credentials` | `/api/user/auth/login` |
| **Session Check** | `/api/admin/session` | `/api/user/auth/session` |
| **Logout Endpoint** | `/api/auth/signout` | `/api/user/auth/logout` |
| **Password Reset** | N/A (direct DB) | `/api/user/auth/reset-password` |
| **Signup** | Via seed endpoint | `/api/user/auth/signup` |
| **RBAC Roles** | ADMIN, EDITOR, MODERATOR | N/A (all users equal) |
| **Config File** | `src/config/auth.ts` | `src/config/auth.ts` |
| **Implementation** | `src/lib/auth/config.ts` | `src/lib/auth/user-auth.ts` |

---

## Admin Authentication | مصادقة الأدمين

### Flow Diagram

```
┌─────────────┐     POST /api/auth/callback/credentials     ┌────────────────┐
│  AdminLogin  │ ──────────────────────────────────────────→ │   NextAuth.js   │
│  Component   │     { email, password, csrfToken }          │   Handler       │
└─────────────┘                                             └───────┬────────┘
                                                                    │
                                                            ┌───────▼────────┐
                                                            │  authorize()   │
                                                            │  (config.ts)   │
                                                            └───────┬────────┘
                                                                    │
                                                    ┌───────────────┼───────────────┐
                                                    │               │               │
                                              ┌─────▼─────┐  ┌─────▼─────┐  ┌─────▼─────┐
                                              │ Find User │  │ Check     │  │ Verify    │
                                              │ by email  │  │ isActive  │  │ Role      │
                                              └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
                                                    │               │               │
                                                    └───────────────┼───────────────┘
                                                                    │
                                                            ┌───────▼────────┐
                                                            │  Compare pwd   │
                                                            │  bcryptjs      │
                                                            └───────┬────────┘
                                                                    │
                                                            ┌───────▼────────┐
                                                            │  Create JWT    │
                                                            │  (NextAuth)    │
                                                            └───────┬────────┘
                                                                    │
                                                            ┌───────▼────────┐
                                                            │  Set cookie:   │
                                                            │  next-auth.    │
                                                            │  session-token │
                                                            └────────────────┘
```

### Admin Login Process

**Step 1: Get CSRF Token**
```
GET /api/auth/csrf → { csrfToken: "abc123..." }
```

**Step 2: Submit Credentials**
```
POST /api/auth/callback/credentials
Content-Type: application/x-www-form-urlencoded

email=admin@bivmor.ma&password=Bivmor@Admin2024!&csrfToken=abc123...
```

**Step 3: Verify Session**
```
GET /api/admin/session → { authenticated: true, user: { id, email, name, role } }
```

### Admin Auth Code (`src/lib/auth/config.ts`)

The NextAuth configuration:

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Login',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Validate input
        if (!credentials?.email || !credentials?.password) {
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
        }

        // 2. Find user in User table
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('بيانات الدخول غير صحيحة');
        }

        // 3. Check if active
        if (!user.isActive) {
          throw new Error('هذا الحساب معطل');
        }

        // 4. Verify password
        const isValidPassword = await compare(credentials.password, user.password);
        if (!isValidPassword) {
          throw new Error('بيانات الدخول غير صحيحة');
        }

        // 5. Check role
        if (user.role !== 'ADMIN' && user.role !== 'EDITOR') {
          throw new Error('ليس لديك صلاحية الوصول');
        }

        // 6. Return user for JWT token
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/?admin=true',
    error: '/?admin=true',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

### Admin Session Management

**Server-side session check** (`src/lib/auth/session.ts`):
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  
  const user = session.user as { id: string; email: string; name: string | null; role: string };
  if (user.role !== 'ADMIN' && user.role !== 'EDITOR') return null;
  
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error('غير مصرح بالوصول');
  return session;
}
```

**Client-side session check** (`src/admin-system/auth/admin-store.ts`):
```typescript
// Zustand store for admin auth state on the client
import { adminAuthApi } from '@/lib/api';

// Checks: GET /api/admin/session
const isAuthenticated = await adminAuthApi.checkSession();
```

### Admin Standalone Auth (`src/admin-system/auth/`)

The admin system has **standalone copies** of auth files that can be deployed independently:

| Main Auth File | Standalone Copy | Difference |
|---|---|---|
| `src/lib/auth/config.ts` | `src/admin-system/auth/admin-config.ts` | Same logic, importable separately |
| `src/lib/auth/session.ts` | `src/admin-system/auth/admin-session.ts` | Imports from admin-config |
| `src/lib/auth/api-guard.ts` | `src/admin-system/auth/admin-guard.ts` | Imports from admin-config |

**Why standalone copies?** When the admin system is deployed to a separate subdomain, it needs its own auth configuration that can point to a different database or auth provider.

---

## User Authentication | مصادقة المستخدم

### Flow Diagram

```
┌─────────────┐     POST /api/user/auth/signup             ┌────────────────┐
│ UserAuthModal│ ─────────────────────────────────────────→ │  Signup Route  │
│ Component    │     { email, password, name }              │  (route.ts)    │
└─────────────┘                                           └───────┬────────┘
                                                                  │
┌─────────────┐     POST /api/user/auth/login              ┌───────▼────────┐
│ UserAuthModal│ ─────────────────────────────────────────→ │  Login Route   │
│ Component    │     { email, password }                    │  (route.ts)    │
└─────────────┘                                           └───────┬────────┘
                                                                  │
                                                          ┌───────▼────────┐
                                                          │  Validate      │
                                                          │  Input         │
                                                          └───────┬────────┘
                                                                  │
                                                          ┌───────▼────────┐
                                                          │  Find          │
                                                          │  PlatformUser  │
                                                          └───────┬────────┘
                                                                  │
                                                          ┌───────▼────────┐
                                                          │  Verify pwd    │
                                                          │  bcryptjs      │
                                                          └───────┬────────┘
                                                                  │
                                                          ┌───────▼────────┐
                                                          │  Create JWT    │
                                                          │  jose SignJWT  │
                                                          │  HS256         │
                                                          └───────┬────────┘
                                                                  │
                                                          ┌───────▼────────┐
                                                          │  Set cookie:   │
                                                          │  bivmor_user_  │
                                                          │  session       │
                                                          └────────────────┘
```

### User Signup Process

**Endpoint:** `POST /api/user/auth/signup`

**Request:**
```json
{
  "email": "student@example.com",
  "password": "mypassword123",
  "name": "أحمد محمد"
}
```

**Validation:**
- Email: required, valid format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Password: required, minimum 6 characters
- Name: optional

**Process:**
1. Validate input
2. Check if email exists in `PlatformUser` table
3. Hash password with bcryptjs (12 rounds)
4. Create `PlatformUser` record
5. Generate JWT token with jose
6. Set `bivmor_user_session` httpOnly cookie
7. Return user data

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "student@example.com",
    "name": "أحمد محمد",
    "avatar": null
  }
}
```

### User Login Process

**Endpoint:** `POST /api/user/auth/login`

**Request:**
```json
{
  "email": "student@example.com",
  "password": "mypassword123"
}
```

**Process:**
1. Validate input
2. Find `PlatformUser` by email
3. Verify password with bcryptjs
4. Check `isActive` flag
5. Update `lastLoginAt` timestamp
6. Generate JWT token
7. Set cookie
8. Return user data

### User Auth Code (`src/lib/auth/user-auth.ts`)

```typescript
import { hash, compare } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'bivmor-user-dev-secret-change-in-production'
);

const COOKIE_NAME = 'bivmor_user_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return compare(password, hashedPassword);
}

// JWT utilities
export async function createUserToken(user: UserSession): Promise<string> {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyUserToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

// Cookie utilities
export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyUserToken(token);
}

export async function setUserCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearUserCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
```

### User Session Object

```typescript
interface UserSession {
  id: string;
  email: string;
  name: string | null;
}
```

---

## Session Management Differences | اختلافات إدارة الجلسات

### Admin Session (NextAuth)

| Property | Value |
|---|---|
| **Cookie Name** | `next-auth.session-token` |
| **Cookie Type** | httpOnly, secure (production), sameSite=lax |
| **Max Age** | 24 hours (configurable via `ADMIN_SESSION_MAX_AGE`) |
| **Token Content** | NextAuth JWT with id, email, name, role |
| **Session Check** | `getServerSession(authOptions)` |
| **Client Check** | `adminAuthApi.checkSession()` → `GET /api/admin/session` |

### User Session (Custom JWT)

| Property | Value |
|---|---|
| **Cookie Name** | `bivmor_user_session` |
| **Cookie Type** | httpOnly, secure (production), sameSite=lax |
| **Max Age** | 7 days (configurable via `USER_SESSION_MAX_AGE`) |
| **Token Content** | jose JWT with id, email, name (HS256) |
| **Session Check** | `getUserSession()` (from `src/lib/auth/user-auth.ts`) |
| **Client Check** | `fetch('/api/user/auth/session')` |

---

## Protected Routes Pattern | نمط حماية المسارات

### Admin API Routes

Use `withAdminAuth` wrapper or `requireAdminAuth`:

```typescript
// Option 1: Wrapper (simple)
export const POST = withAdminAuth(async (request) => {
  // ... handler code
});

// Option 2: Direct (more control)
export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (!authResult.authorized) return authResult.response;
  
  const { id, email, role } = authResult.user;
  // ... handler code
}
```

### User API Routes

Use `requireUserAuth`:

```typescript
export async function GET(request: NextRequest) {
  const authResult = await requireUserAuth(request);
  if (!authResult.authorized) return authResult.response;
  
  const { id, email, name } = authResult.user;
  // ... handler code
}
```

### User Auth Guard (`src/lib/auth/user-guard.ts`)

```typescript
export async function requireUserAuth(request: NextRequest): Promise<
  | { authorized: true; user: { id: string; email: string; name: string | null } }
  | { authorized: false; response: NextResponse }
> {
  const session = await getUserSession();
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'يجب تسجيل الدخول أولاً' },
        { status: 401 }
      ),
    };
  }
  return { authorized: true, user: session };
}
```

---

## How to Add OAuth in the Future | كيفية إضافة OAuth مستقبلاً

### For Admin Auth (NextAuth)

NextAuth.js natively supports OAuth providers. To add Google OAuth for admin:

1. Install the Google provider:
   ```bash
   bun add @next-auth/google-provider
   ```

2. Add to `src/lib/auth/config.ts`:
   ```typescript
   import GoogleProvider from 'next-auth/providers/google';
   
   providers: [
     CredentialsProvider({ ... }), // Keep existing
     GoogleProvider({
       clientId: process.env.GOOGLE_CLIENT_ID!,
       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
     }),
   ],
   ```

3. Add a `accounts` table to link OAuth accounts with admin users.

4. Update the `authorize` flow to handle OAuth-based logins.

### For User Auth (Custom JWT)

To add OAuth for regular users:

1. Create a new OAuth callback endpoint: `/api/user/auth/oauth/callback`
2. Add OAuth flow (authorization URL → callback → token exchange)
3. Create or link `PlatformUser` records from OAuth profile data
4. Set the `bivmor_user_session` cookie (same as password login)
5. Make `password` nullable (already done — `password String?`)

**Current readiness:** The `PlatformUser.password` field is already nullable (`String?`), and the schema includes `emailVerified DateTime?` for future email verification flows.

---

## Security Considerations | اعتبارات الأمان

### Password Security

| Aspect | Admin | User |
|---|---|---|
| **Hashing** | bcryptjs | bcryptjs |
| **Rounds** | 12 | 12 |
| **Min Length** | (not enforced at signup) | 6 characters |
| **Email Validation** | (not enforced) | Regex validation |

### Cookie Security

| Property | Admin Cookie | User Cookie |
|---|---|---|
| **httpOnly** | ✅ (NextAuth default) | ✅ (explicit) |
| **Secure** | ✅ (production) | ✅ (production) |
| **sameSite** | lax | lax |
| **Path** | / | / |

### JWT Security

| Property | Admin JWT | User JWT |
|---|---|---|
| **Algorithm** | HS256 (NextAuth) | HS256 (jose) |
| **Secret** | `NEXTAUTH_SECRET` | `USER_JWT_SECRET` |
| **Expiry** | 24 hours | 7 days |
| **Verification** | NextAuth internal | jose jwtVerify |

### Best Practices

1. **Never expose JWT secrets** — `NEXTAUTH_SECRET` and `USER_JWT_SECRET` must be strong random strings in production
2. **Always use HTTPS** — Cookies with `secure: true` only work over HTTPS
3. **Rotate secrets periodically** — Changing JWT secrets invalidates all sessions
4. **Rate limit login attempts** — Prevent brute force attacks
5. **Log authentication events** — Track failed login attempts in `AdminAuditLog`
6. **Validate input server-side** — Never trust client-side validation alone
7. **Use CSRF protection** — NextAuth provides CSRF tokens; custom endpoints should implement their own

### Password Requirements

**Current minimum requirements:**
- Minimum 6 characters (enforced for user signup)
- Valid email format (enforced for user signup)
- No maximum length limit
- No complexity requirements (numbers, special chars, etc.)

**Recommended additions for production:**
- Minimum 8 characters
- Require at least one uppercase letter
- Require at least one number
- Require at least one special character
- Check against common password lists
- Implement account lockout after failed attempts
