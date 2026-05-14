# BIVMOR Ownership Transfer Guide | دليل نقل ملكية المشروع

> Complete checklist and procedures for transferring full ownership of the BIVMOR Moroccan Educational Platform.

---

## Table of Contents

1. [Pre-Transfer Assessment](#1-pre-transfer-assessment)
2. [Services & Accounts to Transfer](#2-services--accounts-to-transfer)
3. [Database Ownership Transfer](#3-database-ownership-transfer)
4. [Secrets Rotation](#4-secrets-rotation)
5. [Dependency Audit](#5-dependency-audit)
6. [Code Review for Backdoors](#6-code-review-for-backdoors)
7. [Git Repository Ownership](#7-git-repository-ownership)
8. [Domain & Hosting Ownership](#8-domain--hosting-ownership)
9. [Verification Checklist](#9-verification-checklist)
10. [Timeline & Priority](#10-timeline--priority)

---

## 1. Pre-Transfer Assessment

### What You're Receiving

The BIVMOR platform is a monolithic Next.js 16 application with:

| Component | Technology | Location |
|-----------|-----------|----------|
| Frontend SPA | Next.js 16 App Router | `src/app/page.tsx` + `src/components/` |
| Admin Dashboard | Isolated module in same app | `src/admin-system/` + `src/components/admin/` |
| API Routes | Next.js API Routes | `src/app/api/` |
| Database | SQLite via Prisma ORM | `db/custom.db` |
| File Uploads | Local filesystem | `upload/` |
| Auth (Admin) | NextAuth.js v4 (JWT) | `src/lib/auth/config.ts` |
| Auth (Users) | Custom JWT via jose | `src/lib/auth/user-auth.ts` |
| Gateway | Caddy reverse proxy | `Caddyfile` |
| Runtime | Bun | `package.json` |

### Current Architecture

```
User → Caddy (:81) → Next.js (:3000)
                      ├── /api/*          → API Routes
                      ├── /?admin=true    → Admin Dashboard
                      └── /*              → Public SPA
```

---

## 2. Services & Accounts to Transfer

### Critical Services (MUST Transfer)

| Service | Purpose | How to Verify Ownership | Priority |
|---------|---------|------------------------|----------|
| **Git Repository** | Source code hosting | You have admin access to the repo | P0 |
| **Domain Name** | bivmor.com (or planned domain) | Registrar account access | P0 |
| **Hosting/VPS** | Server where app runs | SSH access + provider console | P0 |
| **Database File** | `db/custom.db` | File exists and contains data | P0 |

### External Services (If Configured)

| Service | ENV Variable | How to Check | Default |
|---------|-------------|-------------|---------|
| NextAuth Provider | `NEXTAUTH_URL` | Check `.env` | `http://localhost:3000` |
| Database Host | `DATABASE_URL` | Check `.env` | `file:./db/custom.db` |
| Admin API Base | `ADMIN_API_BASE_URL` | Check `.env` | (empty = same server) |
| CORS Origins | `CORS_ORIGINS` | Check `.env` | `*` |

> **Note**: As of the current deployment, there are NO external SaaS services (no Supabase, no S3, no email provider, no payment processor). All data is stored locally in SQLite and the `upload/` directory.

### Future Services That May Be Added

These are NOT currently in use but are referenced in code/docs:
- **Supabase Storage** — Referenced in `DEPLOYMENT_GUIDE.md` for future image uploads
- **Sentry** — Referenced in monitoring section
- **Turso/Neon** — Referenced for database scaling
- **Vercel Blob** — Referenced as upload option
- **Cloudinary** — Referenced as upload option

---

## 3. Database Ownership Transfer

### Current Database

- **File**: `/home/z/my-project/db/custom.db`
- **Type**: SQLite
- **Prisma Config**: `file:./db/custom.db` (relative to `prisma/` directory)
- **Schema**: 17 models, 6 enums (see `prisma/schema.prisma`)
- **ORM**: Prisma Client, imported via `import { db } from '@/lib/db'`

### Database Models Summary

| Model | Records (approx.) | Sensitive Data |
|-------|-------------------|----------------|
| `User` | 1 (admin) | Email, hashed password, role |
| `PlatformUser` | 0+ | Email, phone, hashed password |
| `Competition` | 22 | Public data |
| `School` | 21 | Contact info |
| `Category` | 8+ | Public data |
| `City` | 30+ | Public data |
| `Region` | 12+ | Public data |
| `Level` | 5+ | Public data |
| `Notification` | 5+ | Public data |
| `News` | 6+ | Public data |
| `AdminAuditLog` | Variable | User emails, actions |
| `UserFavorite` | Variable | User preferences |
| `UserReminder` | Variable | User data |
| `UserApplication` | Variable | User application data |
| `UserNotification` | Variable | User notifications |
| `Media` | Variable | URLs |
| `SiteSetting` | Variable | Config values |

### Transfer Steps

```bash
# 1. Verify database integrity
sqlite3 db/custom.db "PRAGMA integrity_check;"
# Expected: ok

# 2. Check database size
ls -lh db/custom.db

# 3. Count records in each table
sqlite3 db/custom.db "
SELECT 'User', COUNT(*) FROM User
UNION ALL SELECT 'PlatformUser', COUNT(*) FROM PlatformUser
UNION ALL SELECT 'Competition', COUNT(*) FROM Competition
UNION ALL SELECT 'School', COUNT(*) FROM School
UNION ALL SELECT 'AdminAuditLog', COUNT(*) FROM AdminAuditLog;
"

# 4. Export full database backup
sqlite3 db/custom.db ".backup db/transfer-backup.db"

# 5. Verify backup
sqlite3 db/transfer-backup.db "PRAGMA integrity_check;"

# 6. Copy to new owner's location
cp db/custom.db db/custom-$(date +%Y%m%d).db
```

### What the New Owner Must Do

```bash
# After receiving the database file:
# 1. Place it in the correct location
cp received-custom.db db/custom.db

# 2. Verify Prisma can connect
bun run db:generate
bun run db:push  # WARNING: This may alter schema

# 3. Check the admin user exists
sqlite3 db/custom.db "SELECT email, role, isActive FROM User;"

# 4. CHANGE THE ADMIN PASSWORD IMMEDIATELY
# Use the admin panel after logging in
```

---

## 4. Secrets Rotation

### Secrets That MUST Be Rotated

All secrets are defined in `src/config/env.ts` and stored in `.env`.

| Secret | ENV Variable | Current Default | Risk Level |
|--------|-------------|----------------|------------|
| Admin Auth Secret | `NEXTAUTH_SECRET` | `bivmor-dev-secret-change-in-production` | **CRITICAL** |
| User JWT Secret | `USER_JWT_SECRET` | `bivmor-user-dev-secret-change-in-production` | **CRITICAL** |
| Admin Seed Secret | Hardcoded in `src/app/api/admin/seed/route.ts` | `bivmor-init-2024` | **HIGH** |
| Admin Default Password | Seeded via admin/seed endpoint | `Bivmor@Admin2024!` | **CRITICAL** |

### Step-by-Step Secret Rotation

#### 4.1 Generate New NEXTAUTH_SECRET

```bash
# Generate a strong secret
NEW_NEXTAUTH_SECRET=$(openssl rand -base64 48)
echo "NEXTAUTH_SECRET=$NEW_NEXTAUTH_SECRET"

# Update .env file
sed -i "s|^NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$NEW_NEXTAUTH_SECRET\"|" .env
```

> **Impact**: All existing admin sessions will be invalidated. Admins must re-login.

#### 4.2 Generate New USER_JWT_SECRET

```bash
# Generate a strong secret (MUST be different from NEXTAUTH_SECRET)
NEW_USER_JWT_SECRET=$(openssl rand -base64 48)
echo "USER_JWT_SECRET=$NEW_USER_JWT_SECRET"

# Update .env file
sed -i "s|^USER_JWT_SECRET=.*|USER_JWT_SECRET=\"$NEW_USER_JWT_SECRET\"|" .env
```

> **Impact**: All existing user JWT tokens will be invalid. Users must re-login.

#### 4.3 Change Admin Seed Secret

The seed endpoint in `src/app/api/admin/seed/route.ts` has a hardcoded secret:

```typescript
// CURRENT (INSECURE):
if (authHeader !== 'bivmor-init-2024') {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
}
```

**Change to use environment variable:**

```typescript
// SECURE:
const initSecret = process.env.ADMIN_INIT_SECRET || 'change-me-in-production';
if (authHeader !== initSecret) {
  return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
}
```

Then add to `.env`:

```bash
ADMIN_INIT_SECRET=$(openssl rand -base64 32)
echo "ADMIN_INIT_SECRET=\"$ADMIN_INIT_SECRET\"" >> .env
```

#### 4.4 Change Admin Password

```bash
# After starting the server with new secrets:
# 1. Re-seed the admin user (deletes and recreates)
curl -X POST http://localhost:3000/api/admin/seed \
  -H "x-admin-init: YOUR-NEW-INIT-SECRET" \
  -H "Content-Type: application/json"

# 2. Login at /?admin=true with new credentials
# 3. Immediately change the password via the admin panel
```

#### 4.5 Update Production URLs

```bash
# Update these if the domain changes:
NEXTAUTH_URL="https://your-new-domain.com"
NEXT_PUBLIC_APP_URL="https://your-new-domain.com"
CORS_ORIGINS="https://your-new-domain.com"
```

#### 4.6 Verify All Secrets Changed

```bash
# Check that NO default secrets remain
rg "bivmor-dev-secret" .env          # Should return nothing
rg "bivmor-user-dev-secret" .env     # Should return nothing
rg "bivmor-init-2024" src/           # Should return nothing
rg "Bivmor@Admin2024" src/           # Should return nothing

# Check .env has all required secrets
rg "NEXTAUTH_SECRET=" .env           # Should show new value
rg "USER_JWT_SECRET=" .env           # Should show new value
```

---

## 5. Dependency Audit

### Checking package.json for External Services

The project's dependencies in `package.json` include these potentially external-service-related packages:

| Package | Version | Purpose | External Service? |
|---------|---------|---------|-------------------|
| `next-auth` | ^4.24.11 | Admin authentication | No (self-hosted) |
| `bcryptjs` | ^3.0.3 | Password hashing | No (local) |
| `@prisma/client` | ^6.11.1 | Database ORM | No (local SQLite) |
| `sharp` | ^0.34.3 | Image processing | No (local) |
| `z-ai-web-dev-sdk` | ^0.0.18 | AI SDK | **Check config** |
| `recharts` | ^2.15.4 | Charts | No (local) |
| `framer-motion` | ^12.23.2 | Animations | No (local) |
| `sonner` | ^2.0.6 | Toast notifications | No (local) |
| `zustand` | ^5.0.6 | State management | No (local) |

### Audit Commands

```bash
# 1. Check for any external API calls in the codebase
rg "https://" src/ --type ts -l
rg "http://" src/ --type ts -l

# 2. Check for hardcoded external URLs
rg "api\.bivmor" src/ -l
rg "supabase" src/ -l
rg "sentry" src/ -l
rg "cloudinary" src/ -l
rg "vercel" src/ -l

# 3. Check for API keys or tokens in source code
rg "api_key\|apikey\|api-key\|token\|secret" src/ --type ts -i | rg -v "node_modules\|\.d\.ts\|NEXTAUTH_SECRET\|USER_JWT_SECRET"

# 4. Check for environment variables that point to external services
rg "SUPABASE\|S3\|AWS\|CLOUDINARY\|SENTRY\|REDIS\|SMTP\|MAIL" .env src/ -i

# 5. Verify no external connections at runtime
# Start the app and monitor network connections:
ss -tnp | grep node
```

### Key Finding: z-ai-web-dev-sdk

The `z-ai-web-dev-sdk` package is installed. Check if it's actively used:

```bash
rg "z-ai-web-dev-sdk" src/ -l
rg "from.*z-ai" src/ -l
```

> If unused, it can be safely removed: `bun remove z-ai-web-dev-sdk`

---

## 6. Code Review for Backdoors

### Critical Files to Review

These files handle authentication, authorization, or data access:

| File | Purpose | Review Focus |
|------|---------|-------------|
| `src/app/api/admin/seed/route.ts` | Admin user creation | Hardcoded secret `bivmor-init-2024` |
| `src/lib/auth/config.ts` | NextAuth configuration | Credential validation logic |
| `src/lib/auth/session.ts` | Admin session checks | Role verification |
| `src/lib/auth/api-guard.ts` | API route protection | Auth bypass paths |
| `src/lib/auth/user-auth.ts` | User JWT handling | Token validation |
| `src/lib/auth/user-guard.ts` | User route protection | Auth bypass paths |
| `src/lib/db.ts` | Database connection | Connection string exposure |
| `src/config/env.ts` | Environment config | Secret defaults |
| `src/admin-system/auth/admin-guard.ts` | Admin guard | Auth bypass |
| `src/admin-system/auth/admin-config.ts` | Admin auth config | Secret handling |
| `src/admin-system/auth/admin-store.ts` | Client-side auth | Token storage |

### Backdoor Review Checklist

```bash
# 1. Search for bypass logic
rg "bypass\|backdoor\|debug.*auth\|skip.*auth\|disable.*auth" src/ -i

# 2. Search for hardcoded credentials
rg "password\s*[:=]" src/ --type ts -i | rg -v "node_modules\|\.d\.ts\|hashedPassword\|password.*hash"
rg "admin@bivmor" src/ -l

# 3. Search for TODO/FIXME that might indicate security issues
rg "TODO.*auth\|FIXME.*auth\|HACK\|XXX" src/ -i

# 4. Check for eval() or dynamic code execution
rg "\beval\s*\(" src/ --type ts
rg "Function\s*\(" src/ --type ts
rg "exec\s*\(" src/ --type ts

# 5. Check for exposed debug endpoints
rg "debug\|test\|dev-only" src/app/api/ -i -l

# 6. Check for SQL injection risks (raw queries)
rg "\$queryRaw\|\$executeRaw" src/ --type ts

# 7. Check for insecure cookie settings
rg "secure\s*:\s*false" src/ --type ts
rg "httpOnly\s*:\s*false" src/ --type ts

# 8. Check for CORS misconfigurations
rg "cors\|Access-Control" src/ -i -l

# 9. Check the seed endpoint for unauthorized access
cat src/app/api/admin/seed/route.ts

# 10. Verify all admin API routes use withAdminAuth
rg "export const (GET|POST|PUT|DELETE)" src/app/api/admin/ -l | while read f; do
  echo "=== $f ==="
  rg "withAdminAuth\|requireAdminAuth" "$f" || echo "⚠️  NO AUTH CHECK FOUND"
done
```

### Known Security Issues

1. **Admin seed endpoint**: Uses hardcoded secret `bivmor-init-2024` (see section 4.3)
2. **Default admin password**: `Bivmor@Admin2024!` is seeded by default
3. **CORS wildcard**: `CORS_ORIGINS=*` allows any origin
4. **No rate limiting on auth endpoints**: Login attempts not rate-limited
5. **Admin access via query parameter**: `/?admin=true` is discoverable

---

## 7. Git Repository Ownership

### Transfer Steps

```bash
# 1. Verify current git remote
git remote -v

# 2. If using GitHub:
#    - Go to Settings → Danger Zone → Transfer ownership
#    - Or: Create a new repo and push

# 3. Create a clean copy without git history (optional, for security)
mkdir bivmor-clean
cp -r src/ bivmor-clean/
cp -r prisma/ bivmor-clean/
cp -r public/ bivmor-clean/
cp package.json bun.lockb .env.example bivmor-clean/
cp next.config.ts tsconfig.json bivmor-clean/
cd bivmor-clean
git init
git add .
git commit -m "Initial commit - BIVMOR platform"

# 4. Push to new remote
git remote add origin <new-repo-url>
git push -u origin main
```

### Files to Exclude from Transfer

Ensure `.gitignore` includes:

```gitignore
# Already should be in .gitignore:
node_modules/
.next/
db/*.db
db/*.db-journal
.env
upload/
*.log
```

### Verify No Secrets in Git History

```bash
# Search git history for secrets
git log --all -p | rg "bivmor-dev-secret\|bivmor-user-dev-secret\|Bivmor@Admin\|bivmor-init-2024"

# If found, consider using git-filter-branch or BFG to scrub:
# git filter-branch --force --index-filter \
#   'git rm --cached --ignore-unmatch .env' --prune-empty -- --all
```

---

## 8. Domain & Hosting Ownership

### Current Setup

- **Development server**: `bun run dev` on port 3000
- **Gateway**: Caddy on port 81, proxying to port 3000
- **No production domain** currently configured

### Domain Transfer Checklist

| Item | Action | Status |
|------|--------|--------|
| Domain registrar account | Transfer or update ownership | ⬜ |
| DNS records | Update to point to new hosting | ⬜ |
| SSL certificates | Re-issue for new hosting | ⬜ |
| Email (if any) | Update MX records | ⬜ |

### If Using Vercel

```bash
# 1. Transfer Vercel project ownership
#    Go to Settings → General → Transfer Project

# 2. Update domain DNS:
#    A Record: 76.76.21.21
#    CNAME: cname.vercel-dns.com (for www)

# 3. Update environment variables in Vercel dashboard
```

### If Using Railway

```bash
# 1. Transfer Railway project
#    Go to Settings → Transfer Project

# 2. Update environment variables
railway variables set NEXTAUTH_SECRET="new-secret"
railway variables set USER_JWT_SECRET="new-jwt-secret"
railway variables set NEXTAUTH_URL="https://new-domain.com"
```

### If Self-Hosted (VPS)

```bash
# 1. Ensure SSH access to the server
ssh user@server-ip

# 2. Update the application
cd /home/z/my-project
git pull origin main
bun install
bun run db:generate
bun run build
pm2 restart bivmor  # or systemctl restart bivmor

# 3. Update Nginx/Caddy configuration
# 4. Re-issue SSL certificate
certbot renew
```

---

## 9. Verification Checklist

After completing the transfer, verify everything works:

### Application Verification

```bash
# 1. Application starts without errors
bun run dev
# Check dev.log for errors

# 2. Public pages load
curl -s http://localhost:3000 | head -5

# 3. API health check
curl http://localhost:3000/api
# Expected: {"status":"ok","version":"1.0.0"}

# 4. Competitions API works
curl http://localhost:3000/api/competitions | head -20

# 5. Schools API works
curl http://localhost:3000/api/schools | head -20

# 6. Search API works
curl "http://localhost:3000/api/search?q=مباراة"

# 7. Admin login works (with new credentials)
# Navigate to /?admin=true in browser
```

### Security Verification

```bash
# 1. No default secrets in .env
rg "bivmor-dev-secret\|bivmor-user-dev-secret\|bivmor-init-2024" .env

# 2. No hardcoded credentials in source
rg "Bivmor@Admin2024" src/

# 3. Admin seed endpoint is protected
curl -X POST http://localhost:3000/api/admin/seed
# Expected: 403 Forbidden

# 4. Admin API requires authentication
curl http://localhost:3000/api/admin/session
# Expected: 401 Unauthorized

# 5. User API requires authentication
curl http://localhost:3000/api/user/profile
# Expected: 401 Unauthorized

# 6. CORS is restricted
curl -H "Origin: https://evil.com" http://localhost:3000/api/competitions -I
# Check Access-Control-Allow-Origin header
```

### Data Verification

```bash
# 1. Database is intact
sqlite3 db/custom.db "SELECT COUNT(*) FROM Competition;"
sqlite3 db/custom.db "SELECT COUNT(*) FROM School;"
sqlite3 db/custom.db "SELECT COUNT(*) FROM Category;"

# 2. Upload directory exists
ls -la upload/

# 3. Admin audit log is accessible
sqlite3 db/custom.db "SELECT COUNT(*) FROM AdminAuditLog;"
```

---

## 10. Timeline & Priority

### Phase 1: Immediate (Day 1) — Critical Security

| Priority | Task | Time | Risk |
|----------|------|------|------|
| P0 | Rotate `NEXTAUTH_SECRET` | 5 min | All admin sessions invalidated |
| P0 | Rotate `USER_JWT_SECRET` | 5 min | All user sessions invalidated |
| P0 | Change admin password | 5 min | Unauthorized admin access |
| P0 | Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` | 2 min | Broken auth callbacks |
| P0 | Restrict `CORS_ORIGINS` | 2 min | Cross-origin attacks |

### Phase 2: Short-term (Day 1-3) — Ownership

| Priority | Task | Time | Risk |
|----------|------|------|------|
| P1 | Transfer git repository ownership | 30 min | Loss of code access |
| P1 | Change admin seed secret | 15 min | Unauthorized admin creation |
| P1 | Database backup verification | 10 min | Data loss |
| P1 | Code review for backdoors | 2-4 hours | Security vulnerabilities |
| P1 | Dependency audit | 1 hour | Unknown external services |

### Phase 3: Medium-term (Week 1) — Hardening

| Priority | Task | Time | Risk |
|----------|------|------|------|
| P2 | Remove unused dependencies | 1 hour | Supply chain attacks |
| P2 | Add rate limiting to auth endpoints | 2 hours | Brute force attacks |
| P2 | Set up monitoring/logging | 2 hours | Undetected breaches |
| P2 | Configure automated backups | 1 hour | Data loss |
| P2 | Update DNS and SSL | 1 hour | Service interruption |

### Phase 4: Long-term (Month 1) — Production Readiness

| Priority | Task | Time | Risk |
|----------|------|------|------|
| P3 | Migrate to PostgreSQL | 4-8 hours | SQLite limitations |
| P3 | Add image upload (Supabase Storage) | 4 hours | No file persistence |
| P3 | Set up CI/CD pipeline | 4 hours | Manual deployment errors |
| P3 | Add automated testing | 8+ hours | Regression bugs |
| P3 | Consider admin subdomain separation | See ADMIN_SEPARATION_GUIDE.md | Security isolation |

---

## Quick Reference: All ENV Secrets

```env
# 🔴 MUST ROTATE IMMEDIATELY
NEXTAUTH_SECRET="<generate: openssl rand -base64 48>"
USER_JWT_SECRET="<generate: openssl rand -base64 48>"

# 🔴 MUST UPDATE FOR PRODUCTION
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
CORS_ORIGINS="https://your-domain.com"
NODE_ENV="production"

# 🟡 SHOULD CHANGE
ADMIN_SESSION_MAX_AGE="43200"    # 12 hours (shorter than default 24h)
BCRYPT_ROUNDS="12"               # Or 14 for high-security
RATE_LIMIT_MAX="50"              # Stricter than default 100

# 🟢 CONFIGURE FOR EXTERNAL SERVICES (future)
# ADMIN_INIT_SECRET="<generate: openssl rand -base64 32>"
# DATABASE_URL="postgresql://..."
# ADMIN_API_BASE_URL="https://api.bivmor.com"
```

---

*This guide is specific to the BIVMOR platform at `/home/z/my-project/`. All file paths, ENV variables, and configuration values reference the actual project.*
