'use client';

import { useNavigationStore } from '@/store/navigation';
import { ChevronLeft, Home } from 'lucide-react';
import type { ViewType } from '@/types';

const viewLabels: Record<ViewType, string> = {
  home: 'الرئيسية',
  competitions: 'المباريات',
  schools: 'المدارس',
  categories: 'التصنيفات',
  search: 'البحث',
  favorites: 'المفضلة',
  stats: 'الإحصائيات',
  comparison: 'المقارنة',
  cities: 'المدن',
  calendar: 'التقويم',
  faq: 'الأسئلة الشائعة',
  reminders: 'التذكيرات',
  applications: 'تتبع الترشيحات',
  profile: 'حسابي',
  'competition-detail': 'تفاصيل المباراة',
  'school-detail': 'تفاصيل المدرسة',
};

export function Breadcrumb() {
  const { currentView, setView } = useNavigationStore();

  // Don't show breadcrumb on home
  if (currentView === 'home') return null;

  // Build the breadcrumb path
  const crumbs: { label: string; view: ViewType | null }[] = [
    { label: 'الرئيسية', view: 'home' },
  ];

  if (currentView === 'competition-detail') {
    crumbs.push({ label: 'المباريات', view: 'competitions' });
    crumbs.push({ label: viewLabels[currentView], view: null });
  } else if (currentView === 'school-detail') {
    crumbs.push({ label: 'المدارس', view: 'schools' });
    crumbs.push({ label: viewLabels[currentView], view: null });
  } else {
    crumbs.push({ label: viewLabels[currentView], view: null });
  }

  return (
    <nav aria-label="مسار التنقل" className="container mx-auto px-4 py-3">
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {crumbs.map((crumb, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground/50" />
            )}
            {index === 0 && <Home className="h-3.5 w-3.5 ml-0.5" />}
            {crumb.view !== null ? (
              <button
                onClick={() => setView(crumb.view!)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-foreground font-medium">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
