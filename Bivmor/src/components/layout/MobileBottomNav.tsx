'use client';

import { useNavigationStore } from '@/store/navigation';
import { Home, Trophy, GraduationCap, Search, Calendar, Heart, Grid3X3, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ViewType } from '@/types';

const bottomNavItems: { label: string; view: ViewType; icon: React.ReactNode; activeColor: string }[] = [
  { label: 'الرئيسية', view: 'home', icon: <Home className="h-5 w-5" />, activeColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'المباريات', view: 'competitions', icon: <Trophy className="h-5 w-5" />, activeColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'المدارس', view: 'schools', icon: <GraduationCap className="h-5 w-5" />, activeColor: 'text-teal-600 dark:text-teal-400' },
  { label: 'البحث', view: 'search', icon: <Search className="h-5 w-5" />, activeColor: 'text-violet-600 dark:text-violet-400' },
  { label: 'المفضلة', view: 'favorites', icon: <Heart className="h-5 w-5" />, activeColor: 'text-rose-500 dark:text-rose-400' },
];

export function MobileBottomNav() {
  const { currentView, setView, setSearchQuery } = useNavigationStore();

  const handleNavClick = (view: ViewType) => {
    if (view === 'search') {
      setSearchQuery('');
    }
    setView(view);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom">
      <div className="bg-background/80 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-around h-16 px-1">
          {bottomNavItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors duration-200 ${
                  isActive ? item.activeColor : 'text-muted-foreground'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative">
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -inset-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                    />
                  )}
                  <span className="relative z-10">{item.icon}</span>
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
