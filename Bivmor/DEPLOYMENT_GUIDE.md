# BIVMOR - Deployment Guide

> Complete guide for deploying the Moroccan Educational Platform to production.

---

## Prerequisites

| Requirement | Minimum Version | Recommended |
|------------|-----------------|-------------|
| Node.js | 18.x+ | 20.x LTS |
| Bun | 1.0+ | Latest |
| Git | 2.x+ | Latest |
| npm/yarn | — | Bun (preferred) |

### System Requirements

- **RAM**: 512MB minimum, 1GB+ recommended
- **Disk**: 500MB for application + database
- **CPU**: 1 core minimum

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd my-project
```

### 2. Install Dependencies

```bash
bun install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="file:./db/custom.db"

# Admin Authentication (NextAuth)
NEXTAUTH_SECRET="your-production-secret-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# User Authentication (JWT)
USER_JWT_SECRET="your-user-jwt-secret-min-32-chars"

# Application
NEXT_PUBLIC_APP_NAME="BIVMOR"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_VERSION="1.0.0"

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
```

### 4. Initialize Database

```bash
# Push schema to database
bun run db:push

# Generate Prisma client
bun run db:generate

# Seed the database (via API after starting dev server)
# Or use the seed endpoint:
curl -X POST http://localhost:3000/api/seed
```

### 5. Start Development Server

```bash
bun run dev
```

The app will be available at `http://localhost:3000`.

### 6. Verify Installation

- **Public site**: Visit `http://localhost:3000`
- **Admin dashboard**: Visit `http://localhost:3000/?admin=true`
- **Default admin**: `admin@bivmor.ma` / `admin123`
- **API health**: `curl http://localhost:3000/api`

---

## Production Build Process

### 1. Build the Application

```bash
bun run build
```

This creates an optimized production build in `.next/`.

### 2. Set Production Environment Variables

Ensure all env variables are set for production:

```env
NODE_ENV="production"
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="CHANGE-THIS-TO-A-SECURE-RANDOM-STRING-AT-LEAST-32-CHARS"
NEXTAUTH_URL="https://your-domain.com"
USER_JWT_SECRET="CHANGE-THIS-TO-ANOTHER-SECURE-RANDOM-STRING"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 3. Start Production Server

```bash
bun run start
# or
NODE_ENV=production node .next/standalone/server.js
```

---

## Deploy to Vercel

Vercel is the recommended deployment platform for Next.js applications.

### 1. Push to Git

```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Framework Preset: **Next.js** (auto-detected)

### 3. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `file:./db/custom.db` |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `USER_JWT_SECRET` | Generate with: `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

### 4. Build Settings

- **Build Command**: `bun run build`
- **Output Directory**: `.next`
- **Install Command**: `bun install`

### 5. Database Considerations for Vercel

**Important**: Vercel's serverless functions have an **ephemeral filesystem**. SQLite files will NOT persist between function invocations.

**Solutions:**

1. **Use Turso (libSQL)**: Drop-in SQLite replacement with persistent cloud storage
   - Update `prisma/schema.prisma`: Change provider to `sqlite` with Turso connection string
   - Sign up at [turso.tech](https://turso.tech)

2. **Use PlanetScale/Neon**: PostgreSQL-compatible serverless databases
   - Update `prisma/schema.prisma`: Change provider to `postgresql`
   - Update `DATABASE_URL` to PostgreSQL connection string
   - Run `bun run db:push` to create tables

3. **Use Vercel Postgres**: Built-in PostgreSQL offering
   - Available in Vercel Dashboard → Storage

### 6. Deploy

Click "Deploy" in Vercel dashboard. The site will be live at `https://your-app.vercel.app`.

---

## Deploy to Railway

Railway supports persistent SQLite and is simpler for database setup.

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
railway login
```

### 2. Initialize Project

```bash
railway init
# Select "Empty Project"
```

### 3. Deploy

```bash
railway up
```

### 4. Set Environment Variables

```bash
railway variables set NEXTAUTH_SECRET="your-secret"
railway variables set NEXTAUTH_URL="https://your-app.up.railway.app"
railway variables set USER_JWT_SECRET="your-jwt-secret"
railway variables set NEXT_PUBLIC_APP_URL="https://your-app.up.railway.app"
```

### 5. Run Database Migrations

```bash
railway run bun run db:push
```

Railway supports persistent volumes, so SQLite works well.

---

## Deploy to Netlify

Netlify requires some adjustments for Next.js API routes.

### 1. Install Netlify Adapter

```bash
bun add -d @netlify/plugin-nextjs
```

### 2. Configure `netlify.toml`

```toml
[build]
  command = "bun run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 3. Deploy

```bash
netlify deploy --prod
```

**Note**: Same SQLite persistence issue as Vercel. Use an external database for production.

---

## Deploy with Docker

### 1. Create Dockerfile

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Generate Prisma client
RUN bun run db:generate

# Build
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "run", "start"]
```

### 2. Build and Run

```bash
docker build -t bivmor .
docker run -p 3000:3000 \
  -e NEXTAUTH_SECRET=your-secret \
  -e NEXTAUTH_URL=http://localhost:3000 \
  -e USER_JWT_SECRET=your-jwt-secret \
  -v bivmor-data:/app/db \
  bivmor
```

### 3. Docker Compose

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - USER_JWT_SECRET=${USER_JWT_SECRET}
      - DATABASE_URL=file:./db/custom.db
    volumes:
      - db-data:/app/db
    restart: unless-stopped

volumes:
  db-data:
```

---

## Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `mbarayat.ma`)
3. Configure DNS records as instructed:
   - **A Record**: `76.76.21.21` (Vercel)
   - **CNAME**: `cname.vercel-dns.com` (for subdomains)
4. Update environment variables:
   - `NEXTAUTH_URL=https://mbarayat.ma`
   - `NEXT_PUBLIC_APP_URL=https://mbarayat.ma`

### General DNS Configuration

| Record | Type | Value |
|--------|------|-------|
| `mbarayat.ma` | A | Your server IP |
| `www.mbarayat.ma` | CNAME | `mbarayat.ma` |
| `admin.mbarayat.ma` | CNAME | `mbarayat.ma` (future) |

### SSL/TLS

- **Vercel/Netlify**: Automatic HTTPS with Let's Encrypt
- **Self-hosted**: Use Caddy or Nginx with certbot
- **Cloudflare**: Enable Full (Strict) SSL mode

---

## Database: SQLite vs PostgreSQL

### SQLite (Current Setup)

**Pros:**
- Zero configuration
- No external database server needed
- Fast for read-heavy workloads
- Perfect for small-to-medium deployments

**Cons:**
- No concurrent writes (one writer at a time)
- Not suitable for serverless platforms (ephemeral filesystem)
- Limited full-text search for Arabic text

### Migration to PostgreSQL

For production at scale, migrate to PostgreSQL:

1. **Update schema.prisma:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Update connection string:**
   ```
   DATABASE_URL="postgresql://user:password@host:5432/bivmor"
   ```

3. **Run migration:**
   ```bash
   bun run db:push
   ```

4. **Seed data:**
   ```bash
   curl -X POST https://your-domain.com/api/admin/seed
   ```

**Recommended PostgreSQL Providers:**
- [Neon](https://neon.tech) — Serverless PostgreSQL
- [Supabase](https://supabase.com) — PostgreSQL with auth and storage
- [Railway](https://railway.app) — Simple PostgreSQL hosting
- [PlanetScale](https://planetscale.com) — Serverless MySQL (alternative)

---

## Static Assets and Storage

### Current Setup
- School logos and competition images use placeholder URLs
- No file upload system implemented yet

### Adding Image Upload (Future)

**Option 1: Supabase Storage**
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);
const { data, error } = await supabase.storage
  .from('logos')
  .upload(`schools/${file.name}`, file);
```

**Option 2: Cloudinary**
```typescript
import { v2 as cloudinary } from 'cloudinary';
const result = await cloudinary.uploader.upload(file.path, {
  folder: 'bivmor/schools',
});
```

**Option 3: Vercel Blob**
```typescript
import { put } from '@vercel/blob';
const blob = await put(`logos/${file.name}`, file, { access: 'public' });
```

---

## Monitoring and Logging

### Application Logging

The admin system includes built-in activity logging:
- `AdminAuditLog` table records all admin actions
- `admin-logger.ts` service for structured logging

### Recommended Monitoring Tools

| Tool | Purpose | Cost |
|------|---------|------|
| Vercel Analytics | Performance monitoring | Free tier |
| Sentry | Error tracking | Free tier |
| Logflare | Structured logging | Free tier |
| UptimeRobot | Uptime monitoring | Free tier |

### Adding Sentry

```bash
bun add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Health Check Endpoint

`GET /api` returns basic health information:

```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

---

## Backup Strategy

### SQLite Backup

```bash
# Simple file copy (stop the server first)
cp db/custom.db db/backup/custom-$(date +%Y%m%d).db

# Or use sqlite3 for online backup
sqlite3 db/custom.db ".backup db/backup/custom-$(date +%Y%m%d).db"
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/bivmor"
mkdir -p $BACKUP_DIR

# Backup database
sqlite3 db/custom.db ".backup $BACKUP_DIR/db_$DATE.bak"

# Compress
gzip $BACKUP_DIR/db_$DATE.bak

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.bak.gz"
```

### Cron Job (Linux)

```bash
# Run backup daily at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/bivmor-backup.log 2>&1
```

### PostgreSQL Backup

```bash
pg_dump -U bivmor -d bivmor -F c -f backup_$(date +%Y%m%d).dump
# Restore: pg_restore -U bivmor -d bivmor backup.dump
```

---

## Security Checklist for Production

- [ ] Change `NEXTAUTH_SECRET` to a strong random string
- [ ] Change `USER_JWT_SECRET` to a strong random string
- [ ] Change default admin password (`admin@bivmor.ma` / `admin123`)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Set `CORS_ORIGINS` to specific domains (not `*`)
- [ ] Configure rate limiting (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW`)
- [ ] Remove or protect the `/api/seed` endpoint
- [ ] Set `ADMIN_IS_SEPARATE` if using subdomain deployment
- [ ] Enable `secure` flag on cookies (automatic in production)
- [ ] Review and disable unnecessary feature flags
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Add `robots.txt` and `sitemap.xml` for SEO
- [ ] Add CSP headers if needed

---

## Performance Optimization

### Next.js Optimizations

1. **Image Optimization**: Use `next/image` for school logos and competition images
2. **Font Optimization**: Use `next/font` for Arabic fonts
3. **Code Splitting**: Automatic with Next.js App Router
4. **Static Generation**: Consider ISR for competition listing pages

### Database Optimizations

1. **Indexes**: Prisma creates indexes on `@id`, `@unique` fields automatically
2. **Connection Pooling**: Use PgBouncer for PostgreSQL connections
3. **Query Optimization**: Use `select` and `include` wisely to avoid over-fetching

### Caching

1. **TanStack Query**: Already configured with stale-while-revalidate
2. **Next.js Cache**: Use `revalidate` for API routes
3. **CDN**: Vercel/Cloudflare provides automatic CDN caching

---

## Troubleshooting

### Common Issues

**Database not found:**
```bash
bun run db:push  # Recreate the database
```

**Prisma client not generated:**
```bash
bun run db:generate
```

**Build fails:**
```bash
bun run lint  # Check for code errors
rm -rf .next  # Clean build cache
bun run build  # Rebuild
```

**Admin login not working:**
```bash
curl -X POST http://localhost:3000/api/admin/seed  # Re-seed admin user
```

**Port already in use:**
```bash
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
```
