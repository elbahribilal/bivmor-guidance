# BIVMOR - منصة المباريات والفرص التعليمية في المغرب

> Moroccan Educational Competitions & Opportunities Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-SQLite-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-Private-red)]()

---

## 🇲🇦 About | حول المشروع

**BIVMOR** is a comprehensive educational platform designed for Moroccan students to discover, track, and apply for academic competitions (مباريات), scholarships, and educational opportunities across Morocco. The platform provides real-time deadline tracking, application management, school comparisons, and personalized reminders.

**BIVMOR** هي منصة تعليمية شاملة مصممة للطلاب المغاربة لاكتشاف وتتبع والتقديم على المباريات والمنح والفرص التعليمية في المغرب. توفر المنصة تتبع الآجال في الوقت الحقيقي وإدارة الترشيحات ومقارنة المؤسسات والتذكيرات الشخصية.

---

## 🛠 Tech Stack | التقنيات المستخدمة

| Technology | Purpose | الغرض |
|---|---|---|
| **Next.js 16** (App Router) | Framework | إطار العمل |
| **TypeScript 5** | Language | لغة البرمجة |
| **Tailwind CSS 4** | Styling | التنسيق |
| **shadcn/ui** (New York) | Component Library | مكتبة المكونات |
| **Prisma ORM** | Database ORM | إدارة قاعدة البيانات |
| **SQLite** | Database | قاعدة البيانات |
| **Zustand** | Client State | حالة العميل |
| **TanStack Query** | Server State | حالة الخادم |
| **NextAuth.js v4** | Admin Auth | مصادقة الأدمين |
| **jose (JWT)** | User Auth | مصادقة المستخدم |
| **bcryptjs** | Password Hashing | تشفير كلمات المرور |
| **Framer Motion** | Animations | الرسوم المتحركة |
| **Recharts** | Data Visualization | عرض البيانات |
| **Lucide React** | Icons | الأيقونات |

---

## 🚀 Quick Start | التشغيل السريع

### Prerequisites | المتطلبات

- **Node.js** ≥ 18
- **Bun** runtime
- **Git**

### Installation | التثبيت

```bash
# Clone the repository
git clone <repository-url>
cd my-project

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize the database
bun run db:push
bun run db:generate

# Start the development server
bun run dev

# Seed the admin user (one-time)
curl -X POST http://localhost:3000/api/admin/seed \
  -H "x-admin-init: bivmor-init-2024"
```

### First Admin Login | أول تسجيل دخول للأدمين

After seeding, access the admin panel at `http://localhost:3000/?admin=true`:

- **Email**: `admin@bivmor.ma`
- **Password**: `Bivmor@Admin2024!`

> ⚠️ Change the default password immediately after first login.

---

## 📁 Project Structure | هيكل المشروع

```
my-project/
├── prisma/                    # Database schema & migrations
│   └── schema.prisma          # Prisma schema (20 models, 8 enums)
├── db/                        # SQLite database files
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API routes (30+ endpoints)
│   │   │   ├── admin/         # Admin-specific APIs
│   │   │   ├── user/          # User auth & data APIs
│   │   │   ├── auth/          # NextAuth.js handler
│   │   │   ├── competitions/  # Competitions CRUD
│   │   │   ├── schools/       # Schools CRUD
│   │   │   ├── search/        # Search & suggestions
│   │   │   ├── categories/    # Reference data
│   │   │   ├── cities/        # Geographic data
│   │   │   ├── regions/       # Region data
│   │   │   ├── levels/        # Education levels
│   │   │   ├── news/          # News & announcements
│   │   │   ├── notifications/ # System notifications
│   │   │   ├── settings/      # Site settings
│   │   │   ├── dashboard/     # Dashboard stats
│   │   │   └── seed/          # Data seeding
│   │   ├── globals.css        # Global styles & utilities
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main SPA page (single route)
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui base components (40+)
│   │   ├── home/              # Home page sections (14)
│   │   ├── competitions/      # Competition views & dialogs
│   │   ├── schools/           # School views & dialogs
│   │   ├── search/            # Search components
│   │   ├── categories/        # Categories view
│   │   ├── cities/            # City explorer
│   │   ├── calendar/          # Competition calendar
│   │   ├── faq/               # FAQ section
│   │   ├── stats/             # Analytics dashboard
│   │   ├── comparison/        # Comparison tool
│   │   ├── favorites/         # Favorites view
│   │   ├── reminders/         # Reminder system
│   │   ├── applications/      # Application tracker
│   │   ├── notifications/     # Notification bell
│   │   ├── user/              # User profile & auth
│   │   ├── admin/             # Admin dashboard & login
│   │   ├── layout/            # Header, Footer, Mobile nav
│   │   └── shared/            # Reusable components (14)
│   ├── admin-system/          # Isolated admin system
│   │   ├── auth/              # Admin auth (NextAuth config)
│   │   ├── components/        # Admin-specific managers
│   │   ├── hooks/             # Admin hooks
│   │   ├── services/          # Admin API & logging
│   │   ├── types/             # Admin types
│   │   └── utils/             # Admin helpers
│   ├── config/                # Configuration modules
│   │   ├── env.ts             # Environment variables
│   │   ├── api.ts             # API endpoint configuration
│   │   ├── auth.ts            # Auth configuration
│   │   ├── admin.ts           # Admin configuration
│   │   └── features.ts        # Feature flags
│   ├── lib/                   # Core utilities
│   │   ├── auth/              # Auth utilities (session, JWT, guards)
│   │   ├── api.ts             # Frontend API client
│   │   ├── db.ts              # Prisma client singleton
│   │   └── utils.ts           # General utilities
│   ├── store/                 # Zustand state stores (9)
│   ├── hooks/                 # Custom hooks
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── .env                       # Environment variables (not committed)
└── package.json               # Dependencies & scripts
```

---

## 📜 Available Scripts | الأوامر المتاحة

| Command | Description | الوصف |
|---|---|---|
| `bun run dev` | Start development server (port 3000) | تشغيل خادم التطوير |
| `bun run build` | Build for production | بناء للإنتاج |
| `bun run lint` | Run ESLint checks | فحص الكود |
| `bun run db:push` | Push schema changes to DB | تحديث قاعدة البيانات |
| `bun run db:generate` | Generate Prisma client | توليد عميل Prisma |
| `bun run db:migrate` | Run database migrations | تشغيل الترحيلات |
| `bun run db:reset` | Reset database (destructive) | إعادة تعيين قاعدة البيانات |

---

## 📚 Documentation | الوثائق

| Document | Description |
|---|---|
| [PROJECT_ARCHITECTURE.md](./PROJECT_ARCHITECTURE.md) | System architecture, design decisions, data flow |
| [DATABASE_GUIDE.md](./DATABASE_GUIDE.md) | Database schema, tables, relationships, Prisma guide |
| [API_REFERENCE.md](./API_REFERENCE.md) | Complete API endpoint documentation |
| [ADMIN_SYSTEM.md](./ADMIN_SYSTEM.md) | Admin system architecture, RBAC, session management |
| [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) | Dual authentication system (Admin + User) |
| [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) | Environment variables, deployment guide |

---

## 🌐 Views | العروض

The platform uses **SPA-style view switching** (not page routing). All views render within the single `page.tsx` route:

| View | Arabic Name | Key Component |
|---|---|---|
| Home | الرئيسية | `HeroSection`, `FeaturedCompetitions`, `NewsSection` |
| Competitions | المباريات | `CompetitionsView` |
| Schools | المدارس | `SchoolsView` |
| Categories | التصنيفات | `CategoriesView` |
| Search | البحث | `SearchView` |
| Favorites | المفضلة | `FavoritesView` |
| Comparison | المقارنة | `ComparisonView` |
| Stats | الإحصائيات | `StatsView` |
| Cities | المدن | `CitiesExplorerView` |
| Calendar | التقويم | `CalendarView` |
| FAQ | الأسئلة الشائعة | `FaqView` |
| Reminders | التذكيرات | `RemindersView` |
| Applications | الترشيحات | `ApplicationsView` |
| Profile | الملف الشخصي | `UserProfileView` |
| Admin | لوحة التحكم | `AdminDashboard` |

---

## 🔑 Key Features | الميزات الرئيسية

- **Competition Discovery** — Browse and filter competitions by city, category, level, and status
- **School Directory** — Explore schools with type, city, and category filters
- **Real-time Countdown** — Live countdown timers for competition deadlines
- **Favorites System** — Bookmark competitions and schools (client + server sync)
- **Comparison Tool** — Compare 2-4 competitions or schools side-by-side
- **Application Tracker** — Track application status through 6 stages
- **Reminder System** — Set reminders for competition deadlines
- **City Explorer** — Discover competitions and schools by city and region
- **Competition Calendar** — Monthly grid view with deadline markers
- **Analytics Dashboard** — Interactive charts with Recharts
- **News & Announcements** — Latest educational news and deadlines
- **Mobile Navigation** — Bottom navigation bar for mobile devices
- **RTL Arabic Layout** — Full right-to-left support throughout
- **Dark/Light Theme** — Toggle between themes with next-themes
- **Admin Dashboard** — Full CRUD for competitions, schools, categories, news, and settings

---

## 🏗 Architecture Highlights

- **Single-Page Application** — All views render within one route (`/`) using Zustand navigation state
- **Dual Authentication** — Admin auth via NextAuth.js (JWT), User auth via custom JWT (jose + bcryptjs)
- **Isolated Admin System** — Admin code in separate `/admin-system/` folder, accessible via `?admin=true`
- **ENV-Driven Configuration** — All settings configurable via environment variables in `/src/config/`
- **Feature Flags** — Toggle features on/off via ENV variables (user accounts, reminders, applications, etc.)

---

## 📄 License

Private — All rights reserved.
