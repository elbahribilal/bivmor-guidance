# Environment Setup Guide | دليل إعداد البيئة

> BIVMOR - Moroccan Educational Competitions & Opportunities Platform

---

## Overview | نظرة عامة

All configuration is driven by environment variables, centralized in `src/config/env.ts`. This guide covers every ENV variable, development setup, production setup, and deployment considerations.

---

## All Environment Variables | جميع متغيرات البيئة

### Application Settings | إعدادات التطبيق

#### `DATABASE_URL`
- **Required:** Yes
- **Default:** `file:./db/custom.db`
- **Description:** Prisma database connection string. For SQLite, this is a file path relative to the `prisma/` directory.
- **Production:** Same format for SQLite. For PostgreSQL migration: `postgresql://user:password@host:5432/dbname`
- **Example:** `file:./db/custom.db`

#### `NEXT_PUBLIC_APP_NAME`
- **Required:** No
- **Default:** `BIVMOR`
- **Description:** Public application name displayed in the header, footer, and browser tab.
- **Example:** `BIVMOR`

#### `NEXT_PUBLIC_APP_DESCRIPTION`
- **Required:** No
- **Default:** `منصة المباريات والفرص التعليمية في المغرب`
- **Description:** Short description used in meta tags and SEO.
- **Example:** `منصة المباريات والفرص التعليمية في المغرب`

#### `NEXT_PUBLIC_APP_URL`
- **Required:** No
- **Default:** `http://localhost:3000`
- **Description:** The public URL of the application. Used for SEO canonical URLs and sharing links.
- **Production:** Must be set to the actual domain.
- **Example:** `https://bivmor.com`

#### `NEXT_PUBLIC_APP_VERSION`
- **Required:** No
- **Default:** `1.0.0`
- **Description:** Application version displayed in the footer and about sections.
- **Example:** `1.0.0`

#### `NODE_ENV`
- **Required:** No (automatically set by Next.js)
- **Default:** `development`
- **Description:** Node environment. Controls logging, cookie security, and optimization.
- **Values:** `development` | `production` | `test`
- **Impact:**
  - `production` → Cookie `secure: true`, Prisma query logging off, optimized builds
  - `development` → Cookie `secure: false`, Prisma query logging on, verbose errors

---

### Admin Authentication (NextAuth) | مصادقة الأدمين

#### `NEXTAUTH_SECRET`
- **Required:** Yes (in production)
- **Default:** `bivmor-dev-secret-change-in-production`
- **Description:** Secret key used by NextAuth.js to encrypt JWT tokens and sign cookies.
- **⚠️ CRITICAL:** Must be changed in production! Use a strong random string (32+ characters).
- **Generate:** `openssl rand -base64 32`
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0`

#### `NEXTAUTH_URL`
- **Required:** No
- **Default:** `http://localhost:3000`
- **Description:** The base URL for NextAuth callbacks. Must match your application URL.
- **Production:** `https://bivmor.com`
- **Example:** `https://bivmor.com`

#### `ADMIN_SESSION_MAX_AGE`
- **Required:** No
- **Default:** `86400` (24 hours in seconds)
- **Description:** Maximum duration of admin sessions. After this time, the admin must re-login.
- **Example:** `86400` (24 hours), `43200` (12 hours), `3600` (1 hour)

---

### User Authentication (Custom JWT) | مصادقة المستخدم

#### `USER_JWT_SECRET`
- **Required:** Yes (in production)
- **Default:** `bivmor-user-dev-secret-change-in-production`
- **Description:** Secret key used by jose to sign and verify user JWT tokens.
- **⚠️ CRITICAL:** Must be different from `NEXTAUTH_SECRET`! Must be changed in production!
- **Generate:** `openssl rand -base64 32`
- **Example:** `z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0`

#### `USER_SESSION_MAX_AGE`
- **Required:** No
- **Default:** `604800` (7 days in seconds)
- **Description:** Maximum duration of user sessions. Users stay logged in for this period.
- **Example:** `604800` (7 days), `2592000` (30 days), `86400` (1 day)

#### `BCRYPT_ROUNDS`
- **Required:** No
- **Default:** `12`
- **Description:** Number of bcrypt rounds for password hashing. Higher = more secure but slower.
- **Recommended:** `12` for production, `10` for development (faster)
- **Example:** `12`

---

### API Configuration | إعدادات واجهة البرمجة

#### `NEXT_PUBLIC_API_BASE_URL`
- **Required:** No
- **Default:** `/api`
- **Description:** Base URL for API requests from the frontend. Use relative path for same-origin, or absolute URL for external API.
- **Same server:** `/api`
- **External API:** `https://api.bivmor.com/api`
- **Example:** `/api`

#### `NEXT_PUBLIC_ADMIN_API_PREFIX`
- **Required:** No
- **Default:** `/api/admin`
- **Description:** URL prefix for admin-specific API endpoints. Used by the admin system to build API URLs.
- **Example:** `/api/admin`

#### `NEXT_PUBLIC_PUBLIC_API_PREFIX`
- **Required:** No
- **Default:** `/api`
- **Description:** URL prefix for public API endpoints.
- **Example:** `/api`

#### `NEXT_PUBLIC_API_VERSION`
- **Required:** No
- **Default:** `v1`
- **Description:** API version identifier. Currently informational only (not used in URL paths).
- **Example:** `v1`

---

### Admin System | نظام الإدارة

#### `NEXT_PUBLIC_ADMIN_ROUTE`
- **Required:** No
- **Default:** `/admin-panel`
- **Description:** Route path for the admin panel. Currently not used for routing (admin is accessed via `?admin=true` query parameter). Reserved for future use.
- **Example:** `/admin-panel`, `/admin`

#### `ADMIN_API_BASE_URL`
- **Required:** No
- **Default:** `` (empty string = same server)
- **Description:** If the admin system is deployed separately, set this to the external admin API URL. When empty, admin API calls go to the same server.
- **Same server:** (empty)
- **Separate server:** `https://admin-api.bivmor.com`
- **Example:** `https://admin-api.bivmor.com`

#### `ADMIN_IS_SEPARATE`
- **Required:** No
- **Default:** `false`
- **Description:** Set to `true` when the admin system is deployed as a separate application (subdomain).
- **Values:** `true` | `false`
- **Impact:** Controls admin system isolation behavior in `src/config/admin.ts`

#### `ADMIN_SUBDOMAIN`
- **Required:** No
- **Default:** `admin`
- **Description:** Subdomain prefix for admin when deployed separately. Reserved for future use.
- **Example:** `admin`, `dashboard`, `manage`

---

### Feature Flags | أعلام الميزات

#### `NEXT_PUBLIC_ENABLE_USER_ACCOUNTS`
- **Required:** No
- **Default:** `true`
- **Description:** Enable or disable user account registration and login. When `false`, the UserAuthModal and user-related features are hidden.
- **Values:** `true` | `false`
- **Impact:** Controls `featuresConfig.userAccounts.enabled`

#### `NEXT_PUBLIC_ENABLE_REMINDERS`
- **Required:** No
- **Default:** `true`
- **Description:** Enable or disable the competition reminder system.
- **Values:** `true` | `false`
- **Impact:** Controls `featuresConfig.reminders.enabled`

#### `NEXT_PUBLIC_ENABLE_APPLICATIONS`
- **Required:** No
- **Default:** `true`
- **Description:** Enable or disable the application tracker feature.
- **Values:** `true` | `false`
- **Impact:** Controls `featuresConfig.applications.enabled`

#### `NEXT_PUBLIC_ENABLE_COMPARISON`
- **Required:** No
- **Default:** `true`
- **Description:** Enable or disable the comparison tool for competitions and schools.
- **Values:** `true` | `false`

#### `NEXT_PUBLIC_ENABLE_NEWSLETTER`
- **Required:** No
- **Default:** `true`
- **Description:** Enable or disable the newsletter signup section.
- **Values:** `true` | `false`

#### `NEXT_PUBLIC_ENABLE_NOTIFICATIONS`
- **Required:** No
- **Default:** `true`
- **Description:** Enable or disable the notification system.
- **Values:** `true` | `false`

---

### Security Settings | إعدادات الأمان

#### `RATE_LIMIT_MAX`
- **Required:** No
- **Default:** `100`
- **Description:** Maximum number of API requests per rate limit window.
- **Example:** `100`, `200`, `50`

#### `RATE_LIMIT_WINDOW`
- **Required:** No
- **Default:** `60000` (1 minute in milliseconds)
- **Description:** Time window for rate limiting in milliseconds.
- **Example:** `60000` (1 min), `300000` (5 min), `30000` (30 sec)

#### `CORS_ORIGINS`
- **Required:** No
- **Default:** `*` (allow all)
- **Description:** Comma-separated list of allowed CORS origins. Use `*` to allow all (development only).
- **Production:** `https://bivmor.com,https://admin.bivmor.com`
- **Example:** `https://bivmor.com,https://admin.bivmor.com`

---

## Development Setup | إعداد بيئة التطوير

### Prerequisites

- **Bun** runtime (or Node.js ≥ 18)
- **Git**
- A code editor (VS Code recommended)

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd my-project

# 2. Install dependencies
bun install

# 3. Create .env file
cp .env.example .env
# Or create manually with these defaults:

cat > .env << 'EOF'
# Database
DATABASE_URL="file:./db/custom.db"

# Admin Auth (NextAuth)
NEXTAUTH_SECRET="bivmor-dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_SESSION_MAX_AGE="86400"

# User Auth (Custom JWT)
USER_JWT_SECRET="bivmor-user-dev-secret-change-in-production"
USER_SESSION_MAX_AGE="604800"
BCRYPT_ROUNDS="12"

# Application
NEXT_PUBLIC_APP_NAME="BIVMOR"
NEXT_PUBLIC_APP_DESCRIPTION="منصة المباريات والفرص التعليمية في المغرب"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# API
NEXT_PUBLIC_API_BASE_URL="/api"
NEXT_PUBLIC_ADMIN_API_PREFIX="/api/admin"
NEXT_PUBLIC_API_VERSION="v1"

# Admin System
NEXT_PUBLIC_ADMIN_ROUTE="/admin-panel"
ADMIN_API_BASE_URL=""
ADMIN_IS_SEPARATE="false"

# Feature Flags
NEXT_PUBLIC_ENABLE_USER_ACCOUNTS="true"
NEXT_PUBLIC_ENABLE_REMINDERS="true"
NEXT_PUBLIC_ENABLE_APPLICATIONS="true"
NEXT_PUBLIC_ENABLE_COMPARISON="true"
NEXT_PUBLIC_ENABLE_NEWSLETTER="true"
NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"

# Security
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="60000"
CORS_ORIGINS="*"

# Node Environment
NODE_ENV="development"
EOF

# 4. Initialize the database
bun run db:push
bun run db:generate

# 5. Start the development server
bun run dev

# 6. Seed the admin user (one-time)
curl -X POST http://localhost:3000/api/admin/seed \
  -H "x-admin-init: bivmor-init-2024"

# 7. Seed reference data (competitions, schools, cities, etc.)
curl -X POST http://localhost:3000/api/seed

# 8. Open the application
# Navigate to http://localhost:3000
# Admin panel: http://localhost:3000/?admin=true
```

### Development Server

The development server runs on **port 3000** by default:

```bash
bun run dev    # Starts Next.js dev server on port 3000
```

The server auto-reloads when files change. Check `dev.log` for compilation output.

---

## Production Setup | إعداد بيئة الإنتاج

### Step 1: Set Production Environment Variables

Create a `.env` file with production values:

```env
# Database
DATABASE_URL="file:./db/production.db"

# Admin Auth (MUST CHANGE!)
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"
NEXTAUTH_URL="https://bivmor.com"
ADMIN_SESSION_MAX_AGE="43200"  # 12 hours (shorter for security)

# User Auth (MUST CHANGE!)
USER_JWT_SECRET="<generate-with-openssl-rand-base64-32>"
USER_SESSION_MAX_AGE="604800"  # 7 days
BCRYPT_ROUNDS="12"

# Application
NEXT_PUBLIC_APP_NAME="BIVMOR"
NEXT_PUBLIC_APP_DESCRIPTION="منصة المباريات والفرص التعليمية في المغرب"
NEXT_PUBLIC_APP_URL="https://bivmor.com"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# API
NEXT_PUBLIC_API_BASE_URL="/api"
NEXT_PUBLIC_ADMIN_API_PREFIX="/api/admin"
NEXT_PUBLIC_API_VERSION="v1"

# Admin System
NEXT_PUBLIC_ADMIN_ROUTE="/admin-panel"
ADMIN_API_BASE_URL=""
ADMIN_IS_SEPARATE="false"

# Feature Flags
NEXT_PUBLIC_ENABLE_USER_ACCOUNTS="true"
NEXT_PUBLIC_ENABLE_REMINDERS="true"
NEXT_PUBLIC_ENABLE_APPLICATIONS="true"
NEXT_PUBLIC_ENABLE_COMPARISON="true"
NEXT_PUBLIC_ENABLE_NEWSLETTER="true"
NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"

# Security
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="60000"
CORS_ORIGINS="https://bivmor.com"

# Node Environment
NODE_ENV="production"
```

### Step 2: Build the Application

```bash
bun run build
```

This creates an optimized production build in `.next/`.

### Step 3: Run in Production

```bash
bun run start
# or
NODE_ENV=production node .next/standalone/server.js
```

### Step 4: Seed Admin User

```bash
curl -X POST https://bivmor.com/api/admin/seed \
  -H "x-admin-init: bivmor-init-2024" \
  -H "Content-Type: application/json"
```

> ⚠️ Change the `x-admin-init` secret value in the seed endpoint code before deploying!

---

## What to Change When Deploying | ما يجب تغييره عند النشر

### Critical Changes (Security)

| Variable | Development | Production |
|---|---|---|
| `NEXTAUTH_SECRET` | `bivmor-dev-secret-...` | **MUST CHANGE** — Generate a strong random key |
| `USER_JWT_SECRET` | `bivmor-user-dev-secret-...` | **MUST CHANGE** — Different from NEXTAUTH_SECRET |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://your-domain.com` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://your-domain.com` |
| `CORS_ORIGINS` | `*` | `https://your-domain.com` |
| `NODE_ENV` | `development` | `production` |

### Recommended Changes (Security)

| Variable | Development | Production |
|---|---|---|
| `ADMIN_SESSION_MAX_AGE` | `86400` (24h) | `43200` (12h) or shorter |
| `BCRYPT_ROUNDS` | `12` | `12` (or `14` for high-security) |
| `RATE_LIMIT_MAX` | `100` | `50` or `100` |
| `RATE_LIMIT_WINDOW` | `60000` | `60000` |

### Seed Endpoint Secret

The admin seed endpoint (`src/app/api/admin/seed/route.ts`) uses a hardcoded secret:

```typescript
if (authHeader !== 'bivmor-init-2024') {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
}
```

**Change this to a strong, unique value** before deploying to production:

```typescript
if (authHeader !== process.env.ADMIN_INIT_SECRET) {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
}
```

---

## Configuration Architecture | بنية الإعدادات

All environment variables are read through `src/config/env.ts`:

```
.env file
    │
    ▼
src/config/env.ts          ← Reads all ENV variables, provides defaults
    │
    ├── src/config/api.ts      ← API endpoint URLs
    ├── src/config/auth.ts     ← Admin + User auth configuration
    ├── src/config/admin.ts    ← Admin system configuration
    └── src/config/features.ts ← Feature flags
        │
        ▼
src/config/index.ts        ← Central export hub
```

### Accessing Config in Code

```typescript
// Import from the central hub
import { envConfig, apiConfig, authConfig, adminConfig, featuresConfig } from '@/config';

// Or import specific configs
import { envConfig } from '@/config/env';
import { apiConfig } from '@/config/api';
```

### Adding a New ENV Variable

1. Add the variable to `.env`
2. Add it to `src/config/env.ts`:
   ```typescript
   export const envConfig = {
     // ... existing
     newSection: {
       newVar: process.env.NEW_VAR || 'default-value',
     },
   } as const;
   ```
3. Create or update a config module in `src/config/`
4. Export from `src/config/index.ts`
5. Document it in this file

---

## Common Issues | مشاكل شائعة

### "Prisma Client is not generated"

```bash
bun run db:generate
```

### "Database schema out of sync"

```bash
bun run db:push
```

### "Admin login fails after ENV change"

Restart the development server. NextAuth caches the secret at startup.

### "User sessions invalidated"

Changing `USER_JWT_SECRET` or `NEXTAUTH_SECRET` invalidates all existing sessions. Users must re-login.

### "NEXT_PUBLIC_ prefix required for client-side"

Only variables prefixed with `NEXT_PUBLIC_` are available in the browser. Server-only variables (like `NEXTAUTH_SECRET`, `USER_JWT_SECRET`) must NOT have this prefix.

---

## Deployment Checklist | قائمة فحص النشر

- [ ] Generate strong `NEXTAUTH_SECRET` and `USER_JWT_SECRET`
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Set `CORS_ORIGINS` to production domain(s)
- [ ] Set `NODE_ENV=production`
- [ ] Change admin seed secret in `src/app/api/admin/seed/route.ts`
- [ ] Change default admin password after first login
- [ ] Run `bun run db:push` and `bun run db:generate` on the server
- [ ] Seed the admin user via the protected endpoint
- [ ] Seed reference data via `/api/seed`
- [ ] Verify HTTPS is working (cookies require `secure: true` in production)
- [ ] Test admin login at `/?admin=true`
- [ ] Test user signup and login
- [ ] Monitor `dev.log` or server logs for errors
