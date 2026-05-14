'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useNavigationStore } from '@/store/navigation';
import { useAdminAuthStore } from '@/store/admin-auth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { QuickStatsBar } from '@/components/home/QuickStatsBar';
import { FeaturedCompetitions, OpenCompetitionsSection } from '@/components/home/CompetitionsSection';
import { DeadlineTimeline } from '@/components/home/DeadlineTimeline';
import { FeaturedSchools } from '@/components/home/SchoolsSection';
import { CategoriesGrid } from '@/components/home/CategoriesGrid';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { TipsSection } from '@/components/home/TipsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { CompetitionsView } from '@/components/competitions/CompetitionsView';
import { CompetitionDetailDialog } from '@/components/competitions/CompetitionDetailDialog';
import { SchoolsView } from '@/components/schools/SchoolsView';
import { SchoolDetailDialog } from '@/components/schools/SchoolDetailDialog';
import { SearchView } from '@/components/search/SearchView';
import { CategoriesView } from '@/components/categories/CategoriesView';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { FavoritesView } from '@/components/favorites/FavoritesView';
import { StatsView } from '@/components/stats/StatsView';
import { ComparisonView } from '@/components/comparison/ComparisonView';
import { CitiesExplorerView } from '@/components/cities/CitiesExplorerView';
import { FaqView } from '@/components/faq/FaqView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { RemindersView } from '@/components/reminders/RemindersView';
import { ApplicationsView } from '@/components/applications/ApplicationsView';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { BackToTop } from '@/components/shared/BackToTop';
import { PageTransition } from '@/components/shared/PageTransition';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { NewsSection } from '@/components/home/NewsSection';
import { WelcomeGuide } from '@/components/shared/WelcomeGuide';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { KeyboardShortcuts } from '@/components/shared/KeyboardShortcuts';
import { UserProfileView } from '@/components/user/UserProfileView';
import { UserAuthModal } from '@/components/user/UserAuthModal';

function HomeView() {
  return (
    <>
      <HeroSection />
      <div className="section-divider" />
      <QuickStatsBar />
      <div className="section-divider" />
      <FeaturedCompetitions />
      <OpenCompetitionsSection />
      <div className="section-divider" />
      <DeadlineTimeline />
      <CategoriesGrid />
      <div className="section-divider" />
      <FeaturedSchools />
      <RecentlyViewedSection />
      <div className="section-divider" />
      <TestimonialsSection />
      <TipsSection />
      <div className="section-divider" />
      <NewsSection />
      <NewsletterSection />
    </>
  );
}

function PageContent() {
  const { currentView } = useNavigationStore();
  const { isAuthenticated } = useAdminAuthStore();
  const searchParams = useSearchParams();
  
  // التحقق المباشر من مسار الأدمين لتسهيل التطوير
  const isAdminRoute = searchParams.get('admin') === 'true';

  // إذا كنا في مسار الأدمين، نعرض لوحة الدخول أو لوحة التحكم مباشرة
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col">
        <ErrorBoundary>
          {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
        </ErrorBoundary>
      </div>
    );
  }

  // Public interface
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'competitions':
        return <CompetitionsView />;
      case 'schools':
        return <SchoolsView />;
      case 'categories':
        return <CategoriesView />;
      case 'search':
        return <SearchView />;
      case 'favorites':
        return <FavoritesView />;
      case 'stats':
        return <StatsView />;
      case 'comparison':
        return <ComparisonView />;
      case 'cities':
        return <CitiesExplorerView />;
      case 'faq':
        return <FaqView />;
      case 'calendar':
        return <CalendarView />;
      case 'reminders':
        return <RemindersView />;
      case 'applications':
        return <ApplicationsView />;
      case 'profile':
        return <UserProfileView />;
      case 'competition-detail':
      case 'school-detail':
        return <HomeView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Breadcrumb />
      <main className="flex-1 pb-16 lg:pb-0">
        <ErrorBoundary>
          <PageTransition>
            {renderView()}
          </PageTransition>
        </ErrorBoundary>
      </main>
      <Footer />

      <CompetitionDetailDialog />
      <SchoolDetailDialog />
      <WelcomeGuide />
      <BackToTop />
      <MobileBottomNav />
      <UserAuthModal />
      <KeyboardShortcuts />
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
