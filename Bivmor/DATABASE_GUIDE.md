# Database Guide | دليل قاعدة البيانات

> BIVMOR - Moroccan Educational Competitions & Opportunities Platform

---

## Overview | نظرة عامة

BIVMOR uses **Prisma ORM** with **SQLite** as the database engine. The schema is defined in `prisma/schema.prisma` and contains **20 models** and **8 enums**.

**Database file location:** `db/custom.db` (configured via `DATABASE_URL` in `.env`)

**Prisma client import:** `import { db } from '@/lib/db'` (singleton pattern)

---

## All Tables | جميع الجداول

### 1. User — مسؤولو النظام (Admin Users)

**Purpose:** Stores admin panel users (administrators, editors, moderators). This is NOT for regular platform users.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | Admin email address |
| `name` | String? | Display name |
| `password` | String? | Bcrypt hashed password |
| `role` | Role (enum) | ADMIN, EDITOR, or MODERATOR |
| `avatar` | String? | Avatar URL |
| `isActive` | Boolean (default: true) | Account enabled status |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Seeded admin:** `admin@bivmor.ma` / `Bivmor@Admin2024!` (created via `/api/admin/seed`)

---

### 2. PlatformUser — مستخدمو المنصة (Regular Users)

**Purpose:** Stores regular platform users who can save favorites, set reminders, and track applications.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `email` | String (unique) | User email address |
| `name` | String? | Display name |
| `password` | String? | Bcrypt hashed password (nullable for future OAuth) |
| `avatar` | String? | Avatar URL |
| `phone` | String? | Phone number |
| `isActive` | Boolean (default: true) | Account enabled status |
| `emailVerified` | DateTime? | Email verification timestamp |
| `lastLoginAt` | DateTime? | Last login timestamp |
| `preferredCityId` | String? | FK → City (user's preferred city) |
| `notificationPrefs` | String? | JSON string for notification preferences |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:** favorites, userReminders, userApplications, userNotifications

---

### 3. Region — الأقاليم (Regions)

**Purpose:** Moroccan administrative regions (12 regions).

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String (unique) | Region name |
| `nameAr` | String? | Arabic name |
| `nameFr` | String? | French name |
| `slug` | String (unique) | URL-safe slug |
| `order` | Int (default: 0) | Display order |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:** cities[]

---

### 4. City — المدن (Cities)

**Purpose:** Moroccan cities linked to their regions.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | City name |
| `nameAr` | String? | Arabic name |
| `nameFr` | String? | French name |
| `slug` | String | URL-safe slug |
| `regionId` | String | FK → Region |
| `order` | Int (default: 0) | Display order |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Unique constraint:** `@@unique([name, regionId])` — prevents duplicate city names within the same region.

**Relations:** region, schools[], competitions[], platformUsers[]

---

### 5. Level — المستويات التعليمية (Education Levels)

**Purpose:** Education levels (e.g., Bac+2, Bac+3, Bac+5, Doctorat).

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String (unique) | Level name |
| `nameAr` | String? | Arabic name |
| `nameFr` | String? | French name |
| `slug` | String (unique) | URL-safe slug |
| `order` | Int (default: 0) | Display order |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:** competitions[], schools[]

---

### 6. Category — التصنيفات (Categories)

**Purpose:** Competition and school categories with hierarchical support.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | Category name |
| `slug` | String (unique) | URL-safe slug |
| `nameAr` | String? | Arabic name |
| `nameFr` | String? | French name |
| `icon` | String? | Icon identifier |
| `color` | String? | Theme color |
| `description` | String? | Category description |
| `order` | Int (default: 0) | Display order |
| `parentId` | String? | FK → Category (self-relation) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Self-relation:** `parent` → Category, `children` → Category[] (via "CategoryHierarchy")

**Relations:** competitions[], schools[], parent?, children[]

---

### 7. School — المؤسسات (Schools/Institutions)

**Purpose:** Educational institutions in Morocco.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String | School name |
| `slug` | String (unique) | URL-safe slug |
| `shortDescription` | String? | Brief description |
| `fullDescription` | String? | Detailed description |
| `logo` | String? | Logo image URL |
| `coverImage` | String? | Cover/banner image URL |
| `website` | String? | Official website URL |
| `email` | String? | Contact email |
| `phone` | String? | Contact phone |
| `address` | String? | Physical address |
| `cityId` | String | FK → City |
| `categoryId` | String? | FK → Category |
| `levelId` | String? | FK → Level |
| `isFeatured` | Boolean (default: false) | Featured status |
| `isActive` | Boolean (default: true) | Active status |
| `type` | SchoolType (enum) | PUBLIC, PRIVATE, SEMI_PRIVATE |
| `seoTitle` | String? | SEO title tag |
| `seoDescription` | String? | SEO meta description |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:** city, category?, level?, competitions[], media[]

---

### 8. Competition — المباريات (Competitions)

**Purpose:** Academic competitions, concours, scholarships, and admission exams.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `title` | String | Competition title |
| `slug` | String (unique) | URL-safe slug |
| `shortDescription` | String? | Brief description |
| `fullDescription` | String? | Detailed description |
| `officialLink` | String? | Official registration URL |
| `registrationOpen` | Boolean (default: true) | Registration availability |
| `deadline` | DateTime? | Registration deadline |
| `startDate` | DateTime? | Competition start date |
| `endDate` | DateTime? | Competition end date |
| `requirements` | String? | Eligibility requirements |
| `documents` | String? | Required documents |
| `stages` | String? | Competition stages/phases |
| `featuredImage` | String? | Featured image URL |
| `cityId` | String? | FK → City |
| `schoolId` | String? | FK → School |
| `categoryId` | String? | FK → Category |
| `levelId` | String? | FK → Level |
| `isFeatured` | Boolean (default: false) | Featured status |
| `isPinned` | Boolean (default: false) | Pinned status |
| `isArchived` | Boolean (default: false) | Archived status |
| `status` | CompetitionStatus (enum) | OPEN, CLOSED, EXPIRED, UPCOMING |
| `type` | CompetitionType (enum) | RECRUITMENT, ACADEMIC, SCHOLARSHIP, etc. |
| `seoTitle` | String? | SEO title tag |
| `seoDescription` | String? | SEO meta description |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:** city?, school?, category?, level?, media[], tags (CompetitionTag[]), userReminders[], userApplications[]

---

### 9. Tag — الوسوم (Tags)

**Purpose:** Keyword tags for competitions.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `name` | String (unique) | Tag name |
| `slug` | String (unique) | URL-safe slug |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Relations:** competitions (CompetitionTag[])

---

### 10. CompetitionTag — وسيط الوسوم (Competition-Tag Junction)

**Purpose:** Many-to-many relationship between competitions and tags.

| Column | Type | Description |
|---|---|---|
| `competitionId` | String | FK → Competition (cascade delete) |
| `tagId` | String | FK → Tag (cascade delete) |

**Composite primary key:** `@@id([competitionId, tagId])`

---

### 11. Media — الوسائط (Media Files)

**Purpose:** Images, videos, documents, and logos linked to schools or competitions.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `url` | String | File URL |
| `alt` | String? | Alt text for accessibility |
| `type` | MediaType (enum) | IMAGE, VIDEO, DOCUMENT, LOGO |
| `schoolId` | String? | FK → School (cascade delete) |
| `competitionId` | String? | FK → Competition (cascade delete) |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

---

### 12. Notification — الإشعارات (System Notifications)

**Purpose:** System-wide notifications for the admin panel and general announcements.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `title` | String | Notification title |
| `message` | String | Notification message |
| `type` | NotificationType (enum) | INFO, WARNING, SUCCESS, ERROR |
| `isRead` | Boolean (default: false) | Read status |
| `userId` | String? | Target user (null = broadcast) |
| `createdAt` | DateTime | Creation timestamp |

---

### 13. News — الأخبار (News/Announcements)

**Purpose:** News articles and announcements displayed on the home page.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `title` | String | News title |
| `content` | String | Full content |
| `excerpt` | String? | Short excerpt |
| `category` | String (default: "إعلان") | إعلان, آجل, نتائج, نصيحة |
| `isPublished` | Boolean (default: true) | Publication status |
| `isPinned` | Boolean (default: false) | Pinned status |
| `publishedAt` | DateTime | Publication date |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

---

### 14. SiteSetting — إعدادات الموقع (Site Settings)

**Purpose:** Dynamic site configuration stored in the database (editable from admin panel).

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `key` | String (unique) | Setting key (e.g., "site_name") |
| `value` | String | Setting value |
| `type` | SettingType (enum) | TEXT, JSON, NUMBER, BOOLEAN |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

---

### 15. ActivityLog — سجل النشاط (Activity Log)

**Purpose:** Records all admin actions for audit purposes.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String? | FK → User (who performed the action) |
| `action` | String | Action type (CREATE, UPDATE, DELETE) |
| `entity` | String | Entity type (Competition, School, etc.) |
| `entityId` | String? | Entity ID |
| `details` | String? | Additional details |
| `createdAt` | DateTime | Creation timestamp |

---

### 16. UserFavorite — مفضلات المستخدم (User Favorites)

**Purpose:** Bookmarked competitions or schools by users.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → PlatformUser (cascade delete) |
| `itemId` | String | ID of the favorited item |
| `itemType` | String | 'competition' or 'school' |
| `createdAt` | DateTime | Creation timestamp |

**Unique constraint:** `@@unique([userId, itemId, itemType])`

---

### 17. UserReminder — تذكيرات المستخدم (User Reminders)

**Purpose:** Deadline reminders set by users for specific competitions.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → PlatformUser (cascade delete) |
| `competitionId` | String | FK → Competition (cascade delete) |
| `reminderDate` | DateTime | When to trigger the reminder |
| `notes` | String? | User notes |
| `isNotified` | Boolean (default: false) | Whether notification was sent |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Unique constraint:** `@@unique([userId, competitionId, reminderDate])`

---

### 18. UserApplication — ترشيحات المستخدم (User Applications)

**Purpose:** Application tracking per competition per user.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → PlatformUser (cascade delete) |
| `competitionId` | String | FK → Competition (cascade delete) |
| `status` | String (default: "لم أبدأ") | Application status |
| `notes` | String? | User notes |
| `appliedDate` | DateTime? | Date of application |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Valid statuses:** لم أبدأ, أحضّر, قدّمت, قيد المراجعة, مقبول, مرفوض

**Unique constraint:** `@@unique([userId, competitionId])`

---

### 19. UserNotification — تنبيهات المستخدم (User Notifications)

**Purpose:** Personalized notifications for individual users.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → PlatformUser (cascade delete) |
| `title` | String | Notification title |
| `message` | String | Notification message |
| `type` | String (default: "INFO") | INFO, WARNING, SUCCESS, ERROR |
| `isRead` | Boolean (default: false) | Read status |
| `link` | String? | Click-through link |
| `createdAt` | DateTime | Creation timestamp |

---

### 20. AdminAuditLog — سجل تدقيق الأدمين (Admin Audit Log)

**Purpose:** Detailed audit trail of admin actions including IP and user agent.

| Column | Type | Description |
|---|---|---|
| `id` | String (cuid) | Primary key |
| `userId` | String | FK → User who performed action |
| `userEmail` | String | User email (denormalized for speed) |
| `userRole` | String | User role at time of action |
| `action` | String | Action performed |
| `entity` | String | Entity type |
| `entityId` | String? | Entity ID |
| `details` | String? | Additional details |
| `ipAddress` | String? | Request IP address |
| `userAgent` | String? | Request user agent |
| `createdAt` | DateTime | Creation timestamp |

---

## All Enums | جميع التعدادات

### Role
```prisma
enum Role {
  ADMIN       // Full access to all admin features
  EDITOR      // Can create/edit content, limited settings
  MODERATOR   // Can review and moderate content (reserved for future)
}
```

### SchoolType
```prisma
enum SchoolType {
  PUBLIC        // مدرسة عمومية
  PRIVATE       // مدرسة خصوصية
  SEMI_PRIVATE  // مدرسة شبه خصوصية
}
```

### CompetitionStatus
```prisma
enum CompetitionStatus {
  OPEN       // مفتوح للتسجيل
  CLOSED     // مغلق
  EXPIRED    // منتهي الصلاحية
  UPCOMING   // قادم
}
```

### CompetitionType
```prisma
enum CompetitionType {
  RECRUITMENT         // توظيف
  ACADEMIC            // أكاديمي/تعليمي
  SCHOLARSHIP         // منحة دراسية
  CONTINUING_EDUCATION // تكوين مستمر
  ADMISSION           // قبول/التحاق
}
```

### MediaType
```prisma
enum MediaType {
  IMAGE     // صورة
  VIDEO     // فيديو
  DOCUMENT  // وثيقة
  LOGO      // شعار
}
```

### NotificationType
```prisma
enum NotificationType {
  INFO     // معلومات
  WARNING  // تحذير
  SUCCESS  // نجاح
  ERROR    // خطأ
}
```

### SettingType
```prisma
enum SettingType {
  TEXT     // نص عادي
  JSON     // بيانات JSON
  NUMBER   // رقم
  BOOLEAN  // صحيح/خاطئ
}
```

---

## Entity Relationships | العلاقات بين الكيانات

```
Region 1──N City N──1 Region
City    1──N School
City    1──N Competition
City    1──N PlatformUser

Category 1──N School
Category 1──N Competition
Category 1──N Category (self: parent/children)

Level   1──N School
Level   1──N Competition

School  1──N Competition
School  1──N Media

Competition 1──N CompetitionTag N──1 Tag
Competition 1──N Media
Competition 1──N UserReminder
Competition 1──N UserApplication

PlatformUser 1──N UserFavorite
PlatformUser 1──N UserReminder
PlatformUser 1──N UserApplication
PlatformUser 1──N UserNotification
PlatformUser N──1 City (preferred)

User    1──N ActivityLog
User    1──N AdminAuditLog
```

---

## Prisma Commands | أوامر Prisma

### Schema Development

```bash
# Push schema changes directly to the database (no migration files)
bun run db:push

# Generate the Prisma client after schema changes
bun run db:generate

# Create a named migration (for production databases)
bun run db:migrate

# Reset the entire database (DESTRUCTIVE - loses all data)
bun run db:reset
```

### Using Prisma in Code

```typescript
// Import the singleton client
import { db } from '@/lib/db';

// Example queries
const competitions = await db.competition.findMany({
  where: { status: 'OPEN' },
  include: { city: true, school: true, category: true },
  orderBy: { deadline: 'asc' },
  take: 10,
});

const school = await db.school.findUnique({
  where: { slug: 'enim-rabat' },
  include: { competitions: true, city: { include: { region: true } } },
});
```

---

## How to Add New Tables | كيفية إضافة جداول جديدة

1. **Edit the schema** in `prisma/schema.prisma`:
   ```prisma
   model NewEntity {
     id        String   @id @default(cuid())
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

2. **Add TypeScript types** in `src/types/index.ts`:
   ```typescript
   export interface NewEntity {
     id: string;
     name: string;
     createdAt: string;
     updatedAt: string;
   }
   ```

3. **Push to database:**
   ```bash
   bun run db:push
   bun run db:generate
   ```

4. **Create API route** in `src/app/api/new-entity/route.ts`

5. **Add API client methods** in `src/lib/api.ts`

6. **Create React components** in `src/components/new-entity/`

---

## Migration Strategy | استراتيجية الترحيل

### Development
- Use `bun run db:push` for rapid iteration
- This applies schema changes directly without creating migration files
- Safe for development as data can be recreated via seed

### Production
- Use `bun run db:migrate` to create and apply migrations
- Migrations are versioned and trackable
- Always test migrations on a staging database first
- Backup the SQLite file before applying migrations: `cp db/custom.db db/custom.db.bak`

### Seeding Data
- Initial data is seeded via the `/api/seed` endpoint
- Admin user is created via `/api/admin/seed` with `x-admin-init` header
- The seed scripts create authentic Moroccan educational data (competitions, schools, cities, regions, categories, levels)

---

## Database Configuration | إعداد قاعدة البيانات

The database URL is configured in `.env`:

```env
DATABASE_URL="file:./db/custom.db"
```

The Prisma client is instantiated as a **singleton** in `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

This prevents multiple Prisma client instances during hot module reloading in development.
