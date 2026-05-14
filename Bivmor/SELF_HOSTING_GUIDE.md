# BIVMOR Self-Hosting Guide | دليل الاستضافة الذاتية

> Complete guide for self-hosting the BIVMOR Moroccan Educational Platform on your own server.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Installation](#2-installation)
3. [Database Setup](#3-database-setup)
4. [Building for Production](#4-building-for-production)
5. [Running in Production](#5-running-in-production)
6. [Process Management](#6-process-management)
7. [Nginx Reverse Proxy](#7-nginx-reverse-proxy)
8. [SSL/TLS Setup](#8-ssltls-setup)
9. [Backup Automation](#9-backup-automation)
10. [Monitoring Setup](#10-monitoring-setup)
11. [Updating the Application](#11-updating-the-application)
12. [Troubleshooting](#12-troubleshooting)
13. [Security Hardening](#13-security-hardening)

---

## 1. Prerequisites

### Server Requirements

| Resource | Minimum | Recommended | Production |
|----------|---------|-------------|------------|
| **CPU** | 1 core | 2 cores | 2+ cores |
| **RAM** | 512 MB | 1 GB | 2 GB |
| **Disk** | 1 GB | 5 GB | 20 GB (for uploads) |
| **Network** | 1 Mbps | 10 Mbps | 100 Mbps |

### Supported Operating Systems

- **Ubuntu** 22.04 / 24.04 LTS (Recommended)
- **Debian** 12+
- **CentOS** 9 Stream / Rocky Linux 9
- **AlmaLinux** 9+

### Software Requirements

| Software | Version | Install Command (Ubuntu) |
|----------|---------|-------------------------|
| **Bun** | 1.0+ | `curl -fsSL https://bun.sh/install \| bash` |
| **Node.js** | 18+ (fallback) | `curl -fsSL https://deb.nodesource.com/setup_20.x \| sudo -E bash - && sudo apt install -y nodejs` |
| **Git** | 2.x+ | `sudo apt install -y git` |
| **Nginx** | 1.18+ | `sudo apt install -y nginx` |
| **Certbot** | latest | `sudo apt install -y certbot python3-certbot-nginx` |
| **SQLite3** | 3.x+ | `sudo apt install -y sqlite3` |
| **PM2** | latest | `bun add -g pm2` |

### Initial Server Setup

```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Create application user (security best practice)
sudo useradd -m -s /bin/bash bivmor
sudo su - bivmor

# 3. Install Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# 4. Verify installation
bun --version
git --version
```

---

## 2. Installation

### Step 1: Clone the Repository

```bash
# As the bivmor user
cd ~
git clone <your-repository-url> bivmor
cd bivmor
```

### Step 2: Install Dependencies

```bash
bun install
```

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env  # Or create from scratch:

cat > .env << 'EOF'
# ==========================================
# BIVMOR Production Configuration
# ==========================================

# Database (SQLite for simple setup)
DATABASE_URL="file:./db/custom.db"

# Admin Auth (MUST CHANGE IN PRODUCTION!)
NEXTAUTH_SECRET="$(openssl rand -base64 48)"
NEXTAUTH_URL="https://your-domain.com"
ADMIN_SESSION_MAX_AGE="43200"

# User Auth (MUST CHANGE IN PRODUCTION!)
USER_JWT_SECRET="$(openssl rand -base64 48)"
USER_SESSION_MAX_AGE="604800"
BCRYPT_ROUNDS="12"

# Application
NEXT_PUBLIC_APP_NAME="BIVMOR"
NEXT_PUBLIC_APP_DESCRIPTION="منصة المباريات والفرص التعليمية في المغرب"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
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
CORS_ORIGINS="https://your-domain.com"

# Node Environment
NODE_ENV="production"
EOF

# Generate real secrets:
sed -i "s/\$(openssl rand -base64 48)/$(openssl rand -base64 48)/g" .env
```

### Step 4: Initialize Database

```bash
# Create db directory
mkdir -p db

# Push schema to database
bun run db:push

# Generate Prisma client
bun run db:generate
```

### Step 5: Create Upload Directory

```bash
mkdir -p upload
chmod 755 upload
```

---

## 3. Database Setup

### Option A: SQLite (Simple, Recommended for Small Deployments)

SQLite is the current default. No additional setup needed beyond what's in the installation steps.

**Advantages:**
- Zero configuration
- No separate database server
- Fast for read-heavy workloads (< 100 concurrent users)
- Easy backup (just copy the file)

**Limitations:**
- One writer at a time
- No built-in replication
- Limited Arabic full-text search

**Performance tuning for SQLite:**

```bash
# Optimize SQLite for production
sqlite3 db/custom.db << 'EOF'
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA temp_store = MEMORY;
PRAGMA mmap_size = 268435456;
EOF
```

### Option B: PostgreSQL (Production, Recommended for Scale)

For deployments expecting 100+ concurrent users or needing advanced features:

```bash
# 1. Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 2. Create database and user
sudo -u postgres psql << 'EOF'
CREATE USER bivmor WITH PASSWORD 'strong-random-password-here';
CREATE DATABASE bivmor OWNER bivmor;
GRANT ALL PRIVILEGES ON DATABASE bivmor TO bivmor;
\q
EOF

# 3. Update prisma/schema.prisma
# Change: provider = "sqlite" → provider = "postgresql"

# 4. Update .env
DATABASE_URL="postgresql://bivmor:strong-random-password-here@localhost:5432/bivmor"

# 5. Push schema
bun run db:push
bun run db:generate

# 6. Configure PostgreSQL for performance
sudo vim /etc/postgresql/16/main/postgresql.conf
# Recommended settings:
# shared_buffers = 256MB
# effective_cache_size = 768MB
# work_mem = 4MB
# maintenance_work_mem = 64MB
```

---

## 4. Building for Production

### Standard Build

```bash
# Build the Next.js application
bun run build
```

This creates the optimized standalone output in `.next/standalone/` (configured in `next.config.ts` with `output: "standalone"`).

### Build Process Details

The build script in `package.json` is:

```json
{
  "build": "next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/"
}
```

This does three things:
1. `next build` — Compiles the application
2. Copies static assets to the standalone directory
3. Copies public directory to the standalone directory

### Verify Build

```bash
# Check that build succeeded
ls -la .next/standalone/
# Should show: server.js, .next/, public/, etc.

# Check for build errors
echo $? # 0 = success
```

---

## 5. Running in Production

### Using Bun (Direct)

```bash
# Using the standalone build
cd /home/bivmor/bivmor
NODE_ENV=production bun .next/standalone/server.js
```

### Using the Start Script

```bash
# From package.json start script
bun run start
# This runs: NODE_ENV=production bun .next/standalone/server.js 2>&1 | tee server.log
```

### Environment Variables for Production

The standalone server needs the same `.env` file in the project root. Make sure all variables are set correctly:

```bash
# Verify critical ENV variables
echo $NEXTAUTH_SECRET | wc -c   # Should be 48+ characters
echo $USER_JWT_SECRET | wc -c   # Should be 48+ characters
echo $NEXTAUTH_URL               # Should be https://your-domain.com
echo $NODE_ENV                   # Should be "production"
```

### Port Configuration

By default, Next.js runs on port 3000. To change:

```bash
PORT=8080 bun .next/standalone/server.js
```

Or set in `.env`:
```env
PORT=8080
```

---

## 6. Process Management

### Option A: PM2 (Recommended)

```bash
# Install PM2 globally
bun add -g pm2

# Start the application
cd /home/bivmor/bivmor
pm2 start .next/standalone/server.js --name bivmor --node-args="--env-file=.env"

# Or use ecosystem file:
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bivmor',
    script: '.next/standalone/server.js',
    env: {
      NODE_ENV: 'production',
    },
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '512M',
    error_file: '/home/bivmor/logs/pm2-error.log',
    out_file: '/home/bivmor/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
};
EOF

# Start with ecosystem file
mkdir -p /home/bivmor/logs
pm2 start ecosystem.config.js

# Save PM2 process list (auto-restart on reboot)
pm2 save
pm2 startup
# Follow the command PM2 outputs to set up auto-start

# Useful PM2 commands
pm2 status           # Check status
pm2 logs bivmor      # View logs
pm2 restart bivmor   # Restart
pm2 stop bivmor      # Stop
pm2 delete bivmor    # Remove from PM2
pm2 monit            # Real-time monitoring
```

### Option B: systemd (System-level)

```bash
# Create systemd service file
sudo cat > /etc/systemd/system/bivmor.service << 'EOF'
[Unit]
Description=BIVMOR Moroccan Educational Platform
After=network.target

[Service]
Type=simple
User=bivmor
Group=bivmor
WorkingDirectory=/home/bivmor/bivmor
EnvironmentFile=/home/bivmor/bivmor/.env
ExecStart=/home/bivmor/.bun/bin/bun .next/standalone/server.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=bivmor

# Security hardening
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=read-only
ReadWritePaths=/home/bivmor/bivmor/db /home/bivmor/bivmor/upload /home/bivmor/bivmor/.next
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable bivmor
sudo systemctl start bivmor

# Check status
sudo systemctl status bivmor

# View logs
sudo journalctl -u bivmor -f
```

### Option C: Docker

```bash
# Build and run with Docker Compose
docker compose up -d

# View logs
docker compose logs -f app

# Restart
docker compose restart app

# Stop
docker compose down
```

See `INFRASTRUCTURE_GUIDE.md` for the full Dockerfile and docker-compose.yml.

---

## 7. Nginx Reverse Proxy

### Basic Configuration

```bash
# Create Nginx configuration
sudo cat > /etc/nginx/sites-available/bivmor << 'EOF'
server {
    listen 80;
    server_name bivmor.ma www.bivmor.ma;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Max upload size
    client_max_body_size 10M;

    # Proxy to Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files caching
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Upload files (if using local storage)
    location /upload/ {
        alias /home/bivmor/bivmor/upload/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    location ~ \.env {
        deny all;
    }
    location ~ \.db$ {
        deny all;
    }
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/bivmor /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Admin Subdomain (Future)

If you plan to separate admin to `admin.bivmor.ma`:

```nginx
server {
    listen 80;
    server_name admin.bivmor.ma;

    location / {
        proxy_pass http://127.0.0.1:3001;  # Admin on separate port
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 8. SSL/TLS Setup

### Using Let's Encrypt (Free, Automated)

```bash
# 1. Obtain SSL certificate
sudo certbot --nginx -d bivmor.ma -d www.bivmor.ma

# 2. Follow the prompts:
#    - Enter email for renewal notifications
#    - Agree to terms of service
#    - Choose redirect HTTP → HTTPS (recommended: Yes)

# 3. Verify auto-renewal
sudo certbot renew --dry-run

# 4. Certificates auto-renew via systemd timer
# Check: sudo systemctl list-timers | grep certbot
```

### Manual SSL Configuration

If you have a custom SSL certificate:

```nginx
server {
    listen 443 ssl http2;
    server_name bivmor.ma www.bivmor.ma;

    ssl_certificate /etc/ssl/certs/bivmor.crt;
    ssl_certificate_key /etc/ssl/private/bivmor.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # ... rest of the server block
}

server {
    listen 80;
    server_name bivmor.ma www.bivmor.ma;
    return 301 https://$host$request_uri;
}
```

### Update Environment Variables for HTTPS

```bash
# After enabling SSL, update these in .env:
NEXTAUTH_URL="https://bivmor.ma"
NEXT_PUBLIC_APP_URL="https://bivmor.ma"
CORS_ORIGINS="https://bivmor.ma"

# Restart the application
pm2 restart bivmor
```

---

## 9. Backup Automation

### SQLite Backup Script

```bash
cat > /home/bivmor/backup.sh << 'SCRIPT'
#!/bin/bash
# BIVMOR Backup Script
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/bivmor/backups"
APP_DIR="/home/bivmor/bivmor"
MAX_BACKUPS=30

# Create backup directory
mkdir -p $BACKUP_DIR

echo "[$(date)] Starting BIVMOR backup..."

# 1. Backup SQLite database
sqlite3 $APP_DIR/db/custom.db ".backup $BACKUP_DIR/db_$DATE.bak"
echo "✅ Database backed up: db_$DATE.bak"

# 2. Backup uploads
tar czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR upload/
echo "✅ Uploads backed up: uploads_$DATE.tar.gz"

# 3. Backup .env file (contains secrets)
cp $APP_DIR/.env $BACKUP_DIR/env_$DATE.bak
echo "✅ Environment file backed up: env_$DATE.bak"

# 4. Compress database backup
gzip $BACKUP_DIR/db_$DATE.bak
echo "✅ Database backup compressed"

# 5. Remove old backups (keep last 30 days)
find $BACKUP_DIR -name "*.gz" -mtime +$MAX_BACKUPS -delete
find $BACKUP_DIR -name "*.bak" -mtime +$MAX_BACKUPS -delete

# 6. Calculate total size
TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
echo "[$(date)] Backup complete. Total backup size: $TOTAL_SIZE"
SCRIPT

chmod +x /home/bivmor/backup.sh
```

### Set Up Cron Job

```bash
# Edit crontab for bivmor user
crontab -e -u bivmor

# Add these lines:
# Run backup daily at 2 AM
0 2 * * * /home/bivmor/backup.sh >> /home/bivmor/logs/backup.log 2>&1

# Run backup weekly (full) at 3 AM on Sundays
0 3 * * 0 /home/bivmor/backup.sh >> /home/bivmor/logs/backup.log 2>&1
```

### PostgreSQL Backup Script (If Using PostgreSQL)

```bash
cat > /home/bivmor/backup-pg.sh << 'SCRIPT'
#!/bin/bash
set -euo pipefail

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/bivmor/backups"
MAX_BACKUPS=30

mkdir -p $BACKUP_DIR

# PostgreSQL dump
pg_dump -U bivmor -d bivmor -F c -f $BACKUP_DIR/pg_$DATE.dump
echo "✅ PostgreSQL backup: pg_$DATE.dump"

# Compress
gzip $BACKUP_DIR/pg_$DATE.dump

# Clean old backups
find $BACKUP_DIR -name "pg_*.dump.gz" -mtime +$MAX_BACKUPS -delete
SCRIPT

chmod +x /home/bivmor/backup-pg.sh
```

### Restore from Backup

```bash
# SQLite restore
bun run db:push  # Ensure schema exists
cp /home/bivmor/backups/db_YYYYMMDD_HHMMSS.bak.gz .
gunzip db_YYYYMMDD_HHMMSS.bak.gz
cp db/custom.db db/custom.db.corrupted  # Keep corrupted file
cp db_YYYYMMDD_HHMMSS.bak db/custom.db
bun run db:generate  # Regenerate Prisma client

# PostgreSQL restore
pg_restore -U bivmor -d bivmor -c pg_YYYYMMDD_HHMMSS.dump

# Uploads restore
tar xzf uploads_YYYYMMDD_HHMMSS.tar.gz -C /home/bivmor/bivmor/
```

---

## 10. Monitoring Setup

### Application Health Monitoring

```bash
# Create health check script
cat > /home/bivmor/healthcheck.sh << 'SCRIPT'
#!/bin/bash
# BIVMOR Health Check

URL="http://localhost:3000/api"
ALERT_EMAIL="admin@bivmor.ma"

RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $URL 2>/dev/null)

if [ "$RESPONSE" != "200" ]; then
    echo "[$(date)] ❌ BIVMOR is DOWN! HTTP Status: $RESPONSE"
    # Restart the application
    pm2 restart bivmor 2>/dev/null || systemctl restart bivmor 2>/dev/null
    # Send alert (if mail is configured)
    # echo "BIVMOR is DOWN! HTTP Status: $RESPONSE at $(date)" | mail -s "BIVMOR Alert" $ALERT_EMAIL
else
    echo "[$(date)] ✅ BIVMOR is UP. HTTP Status: $RESPONSE"
fi
SCRIPT

chmod +x /home/bivmor/healthcheck.sh

# Add to cron (check every 5 minutes)
crontab -e -u bivmor
# */5 * * * * /home/bivmor/healthcheck.sh >> /home/bivmor/logs/healthcheck.log 2>&1
```

### UptimeRobot (External Monitoring)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Create a free account
3. Add a new monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://bivmor.ma/api`
   - **Interval**: 5 minutes
   - **Alert**: Email

### Sentry (Error Tracking)

```bash
# Install Sentry
bun add @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Add to .env:
SENTRY_DSN="https://xxx@sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### Log Management

```bash
# Create log directory
mkdir -p /home/bivmor/logs

# Rotate logs with logrotate
sudo cat > /etc/logrotate.d/bivmor << 'EOF'
/home/bivmor/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

### Resource Monitoring

```bash
# Quick resource check
free -h          # Memory usage
df -h            # Disk usage
top -bn1 | head  # CPU usage
pm2 monit        # PM2 monitoring (if using PM2)
```

---

## 11. Updating the Application

### Standard Update Process

```bash
# 1. Navigate to the application directory
cd /home/bivmor/bivmor

# 2. Create a backup before updating
/home/bivmor/backup.sh

# 3. Pull the latest code
git pull origin main

# 4. Install any new dependencies
bun install

# 5. Generate Prisma client (if schema changed)
bun run db:generate

# 6. Push schema changes (if any)
bun run db:push

# 7. Build the application
bun run build

# 8. Restart the application
pm2 restart bivmor

# 9. Verify the update
curl -s http://localhost:3000/api
# Check the version in the response

# 10. Check logs for errors
pm2 logs bivmor --lines 50
```

### Zero-Downtime Update (Blue-Green)

For production deployments that can't afford downtime:

```bash
# 1. Build the new version in a separate directory
cp -r /home/bivmor/bivmor /home/bivmor/bivmor-new
cd /home/bivmor/bivmor-new
git pull origin main
bun install
bun run build

# 2. Test the new version on a different port
PORT=3001 bun .next/standalone/server.js &
sleep 5
curl -s http://localhost:3001/api

# 3. If working, switch traffic
# Update Nginx upstream to port 3001
sudo nginx -s reload

# 4. Stop old version and clean up
pm2 stop bivmor
rm -rf /home/bivmor/bivmor-old
mv /home/bivmor/bivmor /home/bivmor/bivmor-old
mv /home/bivmor/bivmor-new /home/bivmor/bivmor
cd /home/bivmor/bivmor
pm2 restart bivmor

# 5. Switch Nginx back to port 3000
sudo nginx -s reload
```

### Rollback

```bash
# If the update breaks something:
cd /home/bivmor/bivmor
git log --oneline -5  # Find the last working commit
git checkout <commit-hash>
bun install
bun run build
pm2 restart bivmor

# Or restore from backup:
/home/bivmor/backup.sh  # Create backup of broken state
cp /home/bivmor/backups/db_YYYYMMDD.bak db/custom.db
bun run db:generate
pm2 restart bivmor
```

---

## 12. Troubleshooting

### Application Won't Start

```bash
# Check if port 3000 is in use
lsof -ti:3000
# Kill if needed: kill -9 $(lsof -ti:3000)

# Check for missing dependencies
bun install

# Check Prisma client
bun run db:generate

# Check .env file
cat .env | head -5

# Check build exists
ls .next/standalone/server.js

# Run directly to see errors
NODE_ENV=production bun .next/standalone/server.js
```

### Database Errors

```bash
# Check database file exists
ls -la db/custom.db

# Check database integrity
sqlite3 db/custom.db "PRAGMA integrity_check;"

# If corrupted, restore from backup
cp /home/bivmor/backups/db_latest.bak db/custom.db

# Recreate database from scratch (DESTRUCTIVE)
rm db/custom.db
bun run db:push
bun run db:generate
curl -X POST http://localhost:3000/api/admin/seed -H "x-admin-init: your-secret"
curl -X POST http://localhost:3000/api/seed
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -50 /var/log/nginx/error.log

# Check access logs
sudo tail -50 /var/log/nginx/access.log

# Common issue: permission denied
sudo chown -R www-data:www-data /home/bivmor/bivmor/upload
sudo chmod -R 755 /home/bivmor/bivmor/upload
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Check if certbot timer is running
sudo systemctl list-timers | grep certbot
```

### Memory Issues

```bash
# Check memory usage
free -h

# Check Node.js/Bun memory usage
ps aux --sort=-%mem | head -10

# If using PM2, check memory
pm2 describe bivmor | grep memory

# Increase swap if needed
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Performance Issues

```bash
# Check response time
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:3000/api

# Check database size
ls -lh db/custom.db

# Optimize SQLite
sqlite3 db/custom.db "VACUUM;"
sqlite3 db/custom.db "ANALYZE;"

# Check if there are too many connections
# (SQLite doesn't have connections, but PostgreSQL does)
# For PostgreSQL:
# SELECT count(*) FROM pg_stat_activity;
```

---

## 13. Security Hardening

### Checklist

- [ ] **Changed default secrets** — `NEXTAUTH_SECRET`, `USER_JWT_SECRET` (not dev defaults)
- [ ] **Changed admin password** — Not `Bivmor@Admin2024!`
- [ ] **Changed admin seed secret** — Not `bivmor-init-2024`
- [ ] **Enabled HTTPS** — SSL/TLS with Let's Encrypt
- [ ] **Restricted CORS** — `CORS_ORIGINS=https://bivmor.ma` (not `*`)
- [ ] **Set NODE_ENV=production** — Enables security features
- [ ] **Firewall configured** — Only ports 80, 443, and 22 open
- [ ] **SSH key-based auth** — Disabled password login
- [ ] **Automatic updates** — `sudo apt install unattended-upgrades`
- [ ] **Fail2ban** — Protection against brute force
- [ ] **File permissions correct** — `.env` not world-readable
- [ ] **Database not publicly accessible** — Not in `public/` directory
- [ ] **Upload directory not executable** — No script execution in `upload/`
- [ ] **Rate limiting configured** — `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW`
- [ ] **Admin access hidden** — Via `?admin=true` parameter, not public URL
- [ ] **Audit logging enabled** — `AdminAuditLog` table active
- [ ] **Session timeouts reasonable** — Admin: 12h, Users: 7d

### Firewall Setup

```bash
# Install UFW
sudo apt install -y ufw

# Configure rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify
sudo ufw status
```

### SSH Hardening

```bash
# Edit SSH configuration
sudo vim /etc/ssh/sshd_config

# Recommended changes:
# Port 2222                    # Change default port
# PermitRootLogin no           # Disable root login
# PasswordAuthentication no    # Key-based auth only
# MaxAuthTries 3               # Limit attempts
# AllowUsers bivmor            # Only allow specific users

# Restart SSH
sudo systemctl restart sshd
```

### Fail2ban Setup

```bash
# Install fail2ban
sudo apt install -y fail2ban

# Create local configuration
sudo cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
EOF

# Start fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Check status
sudo fail2ban-client status
```

### Secure File Permissions

```bash
# Set correct ownership
chown -R bivmor:bivmor /home/bivmor/bivmor/

# Protect .env file
chmod 600 /home/bivmor/bivmor/.env

# Protect database
chmod 600 /home/bivmor/bivmor/db/custom.db

# Upload directory (readable by Nginx)
chmod 755 /home/bivmor/bivmor/upload

# Prevent execution in upload directory
cat > /home/bivmor/bivmor/upload/.htaccess << 'EOF'
# Prevent script execution
php_flag engine off
# For Nginx, add this to server block:
# location /upload/ { location ~ \.(php|pl|py|jsp|asp|sh|cgi)$ { deny all; } }
EOF
```

### Nginx Security Headers

Already included in the Nginx configuration above. Additional headers:

```nginx
# Add to server block:
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com;" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

---

## Quick Reference: Production Startup

```bash
# Fresh installation (complete sequence)
git clone <repo-url> ~/bivmor && cd ~/bivmor
bun install
cp .env.example .env && vim .env  # Set production values
mkdir -p db upload logs backups
bun run db:push && bun run db:generate
bun run build
pm2 start ecosystem.config.js
pm2 save && pm2 startup
sudo ln -s /etc/nginx/sites-available/bivmor /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d bivmor.ma -d www.bivmor.ma
curl -X POST https://bivmor.ma/api/admin/seed -H "x-admin-init: your-secret"
curl -X POST https://bivmor.ma/api/seed
# Add cron jobs for backup and health check
```

---

*This guide is specific to the BIVMOR platform at `/home/z/my-project/`. All file paths, ENV variables, and configuration values reference the actual project.*
