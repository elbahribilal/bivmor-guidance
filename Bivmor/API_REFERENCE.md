# API Reference | مرجع واجهة البرمجة

> BIVMOR - Moroccan Educational Competitions & Opportunities Platform

---

## Overview | نظرة عامة

All API routes are located in `src/app/api/` and follow Next.js App Router conventions. The base URL is `/api` (configurable via `NEXT_PUBLIC_API_BASE_URL`).

**Common patterns:**
- All responses are JSON
- Error responses include an `error` field with Arabic message
- Success responses include a `data` field
- Paginated responses include a `pagination` object
- Authentication is via cookies (httpOnly JWT or NextAuth session)

---

## Authentication Types | أنواع المصادقة

| Icon | Auth Type | Description |
|---|---|---|
| 🔓 | None | Public endpoint, no auth required |
| 👤 | User Auth | Requires `bivmor_user_session` cookie |
| 🔑 | Admin Auth | Requires NextAuth session (ADMIN or EDITOR role) |

---

## Public APIs | واجهات عامة

### Competitions — المباريات

#### GET `/api/competitions`
List competitions with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `cityId` | string | Filter by city ID |
| `categoryId` | string | Filter by category ID |
| `levelId` | string | Filter by level ID |
| `status` | string | Filter by status: OPEN, CLOSED, EXPIRED, UPCOMING |
| `type` | string | Filter by type: RECRUITMENT, ACADEMIC, SCHOLARSHIP, etc. |
| `search` | string | Search in title and description |
| `isFeatured` | boolean | Filter featured only |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 12) |
| `sort` | string | Sort order |

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "title": "مباراة الدراسات العليا",
      "slug": "concours-etudes-superieures",
      "shortDescription": "...",
      "status": "OPEN",
      "type": "ACADEMIC",
      "deadline": "2025-06-30T00:00:00.000Z",
      "city": { "id": "...", "name": "Rabat", "nameAr": "الرباط" },
      "school": { "id": "...", "name": "ENIM" },
      "category": { "id": "...", "name": "Engineering" },
      "level": { "id": "...", "name": "Bac+5" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 22,
    "totalPages": 2
  }
}
```

#### GET `/api/competitions/[id]`
Get a single competition by ID.

**Response:** `{ "data": { ...competition with relations } }`

#### POST `/api/competitions` 🔑
Create a new competition. Requires admin auth.

**Request Body:** Partial Competition object (title required)

**Response:** `{ "data": { ...createdCompetition } }`

#### PUT `/api/competitions/[id]` 🔑
Update a competition. Requires admin auth.

**Request Body:** Partial Competition object

**Response:** `{ "data": { ...updatedCompetition } }`

#### DELETE `/api/competitions/[id]` 🔑
Delete a competition. Requires admin auth.

**Response:** `{ "success": true }`

#### POST `/api/competitions/auto-update-status` 🔑
Automatically update competition statuses based on deadlines. Requires admin auth.

**Response:**
```json
{
  "success": true,
  "updatedCount": 5,
  "details": {
    "expiredFromOpen": 2,
    "closedByRegistration": 1,
    "upcomingToOpen": 1,
    "upcomingExpired": 0,
    "closingSoon": 1
  }
}
```

---

### Schools — المدارس

#### GET `/api/schools`
List schools with optional filters.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `cityId` | string | Filter by city ID |
| `categoryId` | string | Filter by category ID |
| `levelId` | string | Filter by level ID |
| `type` | string | Filter by type: PUBLIC, PRIVATE, SEMI_PRIVATE |
| `search` | string | Search in name and description |
| `isFeatured` | boolean | Filter featured only |
| `page` | number | Page number |
| `limit` | number | Items per page |

**Response:** `{ "data": [...schools], "pagination": {...} }`

#### GET `/api/schools/[id]`
Get a single school by ID with related competitions.

**Response:** `{ "data": { ...school with competitions[] } }`

#### POST `/api/schools` 🔑
Create a new school. Requires admin auth.

#### PUT `/api/schools/[id]` 🔑
Update a school. Requires admin auth.

#### DELETE `/api/schools/[id]` 🔑
Delete a school. Requires admin auth.

---

### Categories — التصنيفات

#### GET `/api/categories`
List all categories with competition/school counts.

**Response:** `{ "data": [...categories with _count] }`

#### POST `/api/categories` 🔑
Create a new category. Requires admin auth.

---

### Cities — المدن

#### GET `/api/cities`
List all cities with school/competition counts and region info.

**Response:** `{ "data": [...cities with _count, region] }`

---

### Regions — الأقاليم

#### GET `/api/regions`
List all regions with their cities.

**Response:** `{ "data": [...regions with cities[]] }`

---

### Levels — المستويات

#### GET `/api/levels`
List all education levels with competition/school counts.

**Response:** `{ "data": [...levels with _count] }`

---

### Search — البحث

#### GET `/api/search`
Search across competitions and schools.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `q` | string | Search query (required) |
| `cityId` | string | Filter by city |
| `categoryId` | string | Filter by category |
| `levelId` | string | Filter by level |
| `type` | string | 'competition' or 'school' |

**Response:**
```json
{
  "data": {
    "competitions": [...],
    "schools": [...]
  }
}
```

#### GET `/api/search/suggestions`
Get search autocomplete suggestions.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `q` | string | Partial search query |

**Response:** `{ "data": [...suggestion strings] }`

---

### News — الأخبار

#### GET `/api/news`
List news articles.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category (إعلان, آجل, نتائج, نصيحة) |
| `search` | string | Search in title/content |
| `page` | number | Page number |
| `limit` | number | Items per page |
| `publishedOnly` | boolean | Show only published (default: true) |

**Response:** `{ "data": [...news], "pagination": {...} }`

#### GET `/api/news/[id]`
Get a single news article.

#### POST `/api/news` 🔑
Create a news article. Requires admin auth.

#### PUT `/api/news/[id]` 🔑
Update a news article. Requires admin auth.

#### DELETE `/api/news/[id]` 🔑
Delete a news article. Requires admin auth.

---

### Notifications — الإشعارات (System)

#### GET `/api/notifications`
List system notifications.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | number | Max items |
| `unreadOnly` | boolean | Show only unread |

**Response:** `{ "data": [...notifications], "unreadCount": 3 }`

#### PUT `/api/notifications`
Mark notification(s) as read.

**Request Body:**
```json
{ "markReadId": "notification-id" }
// or
{ "markAllRead": true }
```

#### POST `/api/notifications` 🔑
Create a system notification. Requires admin auth.

**Request Body:** `{ "title": "...", "message": "...", "type": "INFO" }`

#### DELETE `/api/notifications`
Delete a notification.

**Query Parameters:** `id` (notification ID)

---

### Settings — الإعدادات

#### GET `/api/settings`
Get all site settings as key-value map.

**Response:** `{ "data": { "site_name": "BIVMOR", "hero_title": "...", ... } }`

#### PUT `/api/settings` 🔑
Update site settings. Requires admin auth.

**Request Body:** `{ "settings": { "key": "value", ... } }`

---

### Dashboard Stats — إحصائيات لوحة التحكم

#### GET `/api/dashboard/stats`
Get dashboard statistics.

**Response:**
```json
{
  "data": {
    "totalCompetitions": 22,
    "openCompetitions": 12,
    "closedCompetitions": 5,
    "expiredCompetitions": 3,
    "totalSchools": 21,
    "totalCategories": 8,
    "recentCompetitions": [...]
  }
}
```

---

### Seed — بذر البيانات

#### POST `/api/seed`
Seed the database with initial data (competitions, schools, cities, regions, categories, levels).

> ⚠️ This endpoint seeds reference data, not the admin user.

---

## Admin APIs | واجهات الأدمين

All admin APIs require NextAuth session with ADMIN or EDITOR role.

### Admin Session

#### GET `/api/admin/session` 🔑
Check if the current session is an authenticated admin.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "clx...",
    "email": "admin@bivmor.ma",
    "name": "مدير المنصة",
    "role": "ADMIN"
  }
}
```

**Error Response (401):** `{ "authenticated": false }`

---

### Admin Activity Log

#### GET `/api/admin/activity` 🔑
Get admin activity logs.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | number | Max items (max: 100) |
| `entity` | string | Filter by entity type |
| `action` | string | Filter by action type |

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "userId": "...",
      "action": "CREATE",
      "entity": "Competition",
      "entityId": "...",
      "details": "Created new competition: مباراة الدراسات",
      "createdAt": "2025-01-15T10:30:00.000Z"
    }
  ],
  "pagination": { "total": 50, "limit": 50 }
}
```

#### POST `/api/admin/activity` 🔑
Create an activity log entry.

**Request Body:** `{ "action": "UPDATE", "entity": "Competition", "entityId": "...", "details": "..." }`

---

### Admin Seed — إنشاء حساب الأدمين

#### POST `/api/admin/seed`
Create the default admin user. One-time operation.

**Required Header:** `x-admin-init: bivmor-init-2024`

**Response:**
```json
{
  "message": "تم إنشاء حساب الأدمين بنجاح",
  "admin": {
    "id": "clx...",
    "email": "admin@bivmor.ma",
    "name": "مدير المنصة",
    "role": "ADMIN"
  }
}
```

**If admin already exists:** `{ "message": "حساب الأدمين موجود بالفعل", "existing": true }`

---

## User APIs | واجهات المستخدم

### User Authentication — مصادقة المستخدم

#### POST `/api/user/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "mypassword",
  "name": "أحمد"
}
```

**Validation:**
- Email: valid format required
- Password: minimum 6 characters
- Email must be unique in PlatformUser table

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "أحمد",
    "avatar": null
  }
}
```

**Sets cookie:** `bivmor_user_session` (httpOnly, 7-day expiry)

**Error Responses:**
- `400` — Missing email/password, invalid email, password too short
- `409` — Email already registered
- `500` — Server error

---

#### POST `/api/user/auth/login`
Login a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "أحمد",
    "avatar": null
  }
}
```

**Sets cookie:** `bivmor_user_session` (httpOnly, 7-day expiry)

**Error Responses:**
- `400` — Missing email/password
- `401` — Invalid credentials
- `403` — Account disabled

---

#### POST `/api/user/auth/logout`
Logout the current user.

**Response:** `{ "success": true }`

**Clears cookie:** `bivmor_user_session`

---

#### GET `/api/user/auth/session`
Get current user session info.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "أحمد",
    "avatar": null,
    "phone": null,
    "preferredCityId": null,
    "notificationPrefs": null
  }
}
```

**If not authenticated:** `{ "authenticated": false }`

---

#### PUT `/api/user/auth/reset-password` 👤
Change password for the authenticated user.

**Request Body:**
```json
{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

**Validation:**
- Both fields required
- New password: minimum 6 characters
- Current password must match

**Response:** `{ "success": true }`

**Error Responses:**
- `400` — Missing fields or password too short
- `401` — Current password incorrect
- `404` — User not found

---

### User Profile — الملف الشخصي

#### GET `/api/user/profile` 👤
Get full user profile with counts.

**Response:**
```json
{
  "data": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "أحمد",
    "avatar": null,
    "phone": null,
    "preferredCityId": null,
    "notificationPrefs": null,
    "preferredCity": null,
    "_count": {
      "favorites": 5,
      "userReminders": 3,
      "userApplications": 2,
      "userNotifications": 10
    }
  }
}
```

#### PUT `/api/user/profile` 👤
Update user profile.

**Request Body:**
```json
{
  "name": "أحمد الجديد",
  "phone": "+212600000000",
  "preferredCityId": "city-id",
  "notificationPrefs": "{\"email\": true, \"push\": false}"
}
```

**Response:** `{ "success": true, "user": { ...updatedUser } }`

---

### User Favorites — المفضلات

#### GET `/api/user/favorites` 👤
List user's favorites.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `itemType` | string | Filter: 'competition' or 'school' |

**Response:** `{ "data": [...favorites] }`

#### POST `/api/user/favorites` 👤
Add item to favorites.

**Request Body:** `{ "itemId": "competition-id", "itemType": "competition" }`

**Validation:** `itemType` must be 'competition' or 'school'

**Response (201):** `{ "data": { ...favorite } }`

**Error:** `409` if already favorited

#### DELETE `/api/user/favorites` 👤
Remove item from favorites.

**Query Parameters (option A):** `id` (favorite ID)
**Query Parameters (option B):** `itemId` + `itemType`

**Response:** `{ "success": true }`

---

### User Reminders — التذكيرات

#### GET `/api/user/reminders` 👤
List user's reminders with competition details.

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "competitionId": "...",
      "reminderDate": "2025-06-28T00:00:00.000Z",
      "notes": "Don't forget documents!",
      "isNotified": false,
      "competition": {
        "id": "...",
        "title": "مباراة ENIM",
        "deadline": "2025-06-30T00:00:00.000Z",
        "status": "OPEN",
        "school": { "id": "...", "name": "ENIM" }
      }
    }
  ]
}
```

#### POST `/api/user/reminders` 👤
Create a reminder.

**Request Body:** `{ "competitionId": "...", "reminderDate": "2025-06-28", "notes": "..." }`

**Response (201):** `{ "data": { ...reminder with competition } }`

#### PUT `/api/user/reminders` 👤
Update a reminder.

**Request Body:** `{ "id": "...", "reminderDate": "2025-06-27", "notes": "updated", "isNotified": true }`

**Response:** `{ "data": { ...updatedReminder } }`

#### DELETE `/api/user/reminders` 👤
Delete a reminder.

**Query Parameters (option A):** `id` (reminder ID)
**Query Parameters (option B):** `competitionId` (deletes all reminders for that competition)

**Response:** `{ "success": true }`

---

### User Applications — الترشيحات

#### GET `/api/user/applications` 👤
List user's applications with competition details.

**Response:**
```json
{
  "data": [
    {
      "id": "clx...",
      "competitionId": "...",
      "status": "قدّمت",
      "notes": null,
      "appliedDate": "2025-05-15",
      "competition": {
        "id": "...",
        "title": "مباراة ENIM",
        "deadline": "2025-06-30T00:00:00.000Z",
        "status": "OPEN",
        "school": { "id": "...", "name": "ENIM" }
      }
    }
  ]
}
```

#### POST `/api/user/applications` 👤
Create or update an application (upsert).

**Request Body:** `{ "competitionId": "...", "status": "أحضّر", "notes": "...", "appliedDate": "2025-05-15" }`

**Valid statuses:** `لم أبدأ`, `أحضّر`, `قدّمت`, `قيد المراجعة`, `مقبول`, `مرفوض`

**Response:** `{ "data": { ...application } }`

#### DELETE `/api/user/applications` 👤
Delete an application.

**Query Parameters (option A):** `id` (application ID)
**Query Parameters (option B):** `competitionId`

**Response:** `{ "success": true }`

---

### User Notifications — تنبيهات المستخدم

#### GET `/api/user/notifications` 👤
List user's notifications.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | number | Max items (default: 20) |
| `unreadOnly` | boolean | Show only unread |

**Response:** `{ "data": [...notifications], "unreadCount": 3 }`

#### PUT `/api/user/notifications` 👤
Mark notifications as read.

**Request Body:**
```json
{ "markReadId": "notification-id" }
// or
{ "markAllRead": true }
```

**Response:** `{ "success": true }`

---

## Auth Endpoints — واجهات المصادقة (NextAuth)

These endpoints are managed by NextAuth.js (`src/app/api/auth/[...nextauth]/route.ts`):

| Method | Path | Description |
|---|---|---|
| GET | `/api/auth/csrf` | Get CSRF token |
| POST | `/api/auth/callback/credentials` | Admin login (email + password + csrfToken) |
| POST | `/api/auth/signout` | Admin logout |
| GET | `/api/auth/session` | Get NextAuth session |

---

## Error Handling | معالجة الأخطاء

All API errors follow a consistent format:

```json
{
  "error": "وصف الخطأ بالعربية"
}
```

### Common HTTP Status Codes

| Code | Meaning | Arabic |
|---|---|---|
| `200` | Success | نجاح |
| `201` | Created | تم الإنشاء |
| `400` | Bad Request | طلب غير صالح |
| `401` | Unauthorized | غير مصرح |
| `403` | Forbidden | ممنوع الوصول |
| `404` | Not Found | غير موجود |
| `409` | Conflict | تعارض (مثل: البريد مسجل مسبقاً) |
| `500` | Server Error | خطأ في الخادم |

### Error Messages Language

All error messages are in **Arabic** to match the platform's primary language. Examples:
- `"البريد الإلكتروني وكلمة المرور مطلوبان"` — Email and password are required
- `"هذا البريد الإلكتروني مسجل بالفعل"` — This email is already registered
- `"يجب تسجيل الدخول أولاً"` — You must login first
- `"ليس لديك صلاحية تنفيذ هذا الإجراء"` — You don't have permission

---

## Rate Limiting | تحديد المعدل

Rate limiting is configured via environment variables:

| Variable | Default | Description |
|---|---|---|
| `RATE_LIMIT_MAX` | 100 | Max requests per window |
| `RATE_LIMIT_WINDOW` | 60000 | Window duration in ms (1 minute) |

> Note: Rate limiting is configured but not currently enforced at the middleware level. It's defined in `src/config/env.ts` for future implementation.

---

## API Client | عميل واجهة البرمجة

The frontend uses a centralized API client defined in `src/lib/api.ts`:

```typescript
import { competitionsApi, schoolsApi, categoriesApi } from '@/lib/api';

// Example usage in a component
const { data } = await competitionsApi.list({ 
  status: 'OPEN', 
  cityId: 'rabat-id',
  page: 1 
});
```

**Available API clients:**

| Client | Methods |
|---|---|
| `competitionsApi` | list, get, create, update, delete, autoUpdateStatus |
| `schoolsApi` | list, get, create, update, delete |
| `categoriesApi` | list, create |
| `citiesApi` | list |
| `regionsApi` | list |
| `levelsApi` | list |
| `searchApi` | search |
| `dashboardApi` | stats |
| `settingsApi` | get, update |
| `notificationsApi` | list, markRead, markAllRead, create, delete |
| `newsApi` | list, get, create, update, delete |
| `adminAuthApi` | checkSession, login, logout |
| `activityApi` | list, create |
