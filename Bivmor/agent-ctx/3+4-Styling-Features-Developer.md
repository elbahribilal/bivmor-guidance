---
Task ID: 3+4
Agent: Styling & Features Developer
Task: Improve styling and add new features

Work Log:
- Enhanced HeroSection: Added floating Morocco badge (🇲🇦 المغرب) with float animation, CSS particle/dot animation in background (12 particles with staggered delays), search bar glow-pulse effect, quick link "المباريات المفتوحة الآن" with pulsing dot indicator, stat cards with gradient borders using CSS mask technique
- Enhanced CompetitionCards: Added left-side colored accent bar (4px) based on status (emerald=OPEN, amber=UPCOMING, gray=EXPIRED, red=CLOSED) via CSS ::before pseudo-element, shadow-glow on hover, "المزيد من التفاصيل" with arrow animation on hover, school name with Building2 icon, expired cards show strikethrough and dimmed opacity
- Enhanced SchoolCards: Added colored ring/border based on school type (emerald for PUBLIC, amber for PRIVATE, teal for SEMI_PRIVATE), competition count with trophy icon in emerald badge, "عرض المباريات" text with eye icon on hover
- Enhanced Footer: Added gradient top border (emerald to teal) via CSS ::before, added "صُنع بـ ❤️ في المغرب 🇲🇦" line, improved spacing with larger gaps, added hover color effects on quick links
- Enhanced CategoriesGrid: Added hover rotation effect on icons (rotate-6), added "شاهد الكل →" link at bottom, improved color gradients (replaced blue variants with teal/cyan)
- Enhanced Header: Added gradient bottom border on active nav item, logo with subtle pulse animation on hover, added notification bell icon with emerald dot indicator (decorative)
- Created NewsletterSection component: CTA section with gradient background (emerald to teal), email input with "اشتراك" button (UI only), social media icons (Twitter, Facebook, Instagram, Youtube), success message on subscribe
- Created Breadcrumb component: Shows current view path with chevrons for RTL, clickable to navigate back, uses navigation store, hidden on home view, home icon on first item
- Created BackToTop component: Floating button appears after scrolling 400px, smooth scroll to top, animated with framer-motion (scale+opacity), emerald gradient themed
- Updated CountdownTimer: When countdown reaches zero shows celebration animation (scale bounce), then fades to expired state with strikethrough, added refresh button (تحديث) with RefreshCw icon, expired text has line-through and dimmed opacity
- Created QuickStatsBar component: Horizontal scrolling bar below hero, shows open competitions, cities count, schools count, expired competitions, each stat in a small card with colored icon, mobile: horizontal scroll, desktop: flex row
- Updated page.tsx: Integrated NewsletterSection, QuickStatsBar, BackToTop, and Breadcrumb components into the layout
- Added extensive CSS animations to globals.css: particle-drift, float-badge, pulse-dot, glow-pulse, stat-card-gradient borders, competition-card-accent bars, competition-glow hover, expired/celebrate animations, newsletter-gradient, logo-pulse, footer-gradient-border
- All lint checks pass cleanly

Stage Summary:
- 6 existing components enhanced with new visual polish (HeroSection, CompetitionsSection, SchoolsSection, Footer, CategoriesGrid, Header)
- 5 new components created (NewsletterSection, Breadcrumb, BackToTop, QuickStatsBar)
- CountdownTimer enhanced with expiry animations and refresh button
- Extensive custom CSS animations added for particles, glow effects, gradient borders, floating badges
- Emerald/teal color scheme maintained throughout, no blue/indigo
- RTL Arabic layout preserved in all new components
- All lint checks pass, server running successfully
