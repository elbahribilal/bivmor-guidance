'use client';

import { useState } from 'react';
import { useNavigationStore } from '@/store/navigation';
import { useAdminAuthStore } from '@/store/admin-auth'; // تمت إضافة استيراد متجر الأدمين
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Menu, Search, Moon, Sun, GraduationCap, Trophy, Home, Grid3X3, Heart, GitCompare, BarChart3, MapPin, Calendar, HelpCircle, MoreHorizontal, ChevronDown, Bell, ClipboardList, ShieldAlert } from 'lucide-react'; // تمت إضافة ShieldAlert لأيقونة الأدمين
import { useTheme } from 'next-themes';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { UserProfileMenu } from '@/components/user/UserProfileMenu';
import type { ViewType } from '@/types';

// Primary nav items (always visible on desktop)
const primaryNavItems: { label: string; view: ViewType; icon: React.ReactNode }[] = [
  { label: 'الرئيسية', view: 'home', icon: <Home className="h-4 w-4" /> },
  { label: 'المباريات', view: 'competitions', icon: <Trophy className="h-4 w-4" /> },
  { label: 'المدارس', view: 'schools', icon: <GraduationCap className="h-4 w-4" /> },
  { label: 'التقويم', view: 'calendar', icon: <Calendar className="h-4 w-4" /> },
  { label: 'التصنيفات', view: 'categories', icon: <Grid3X3 className="h-4 w-4" /> },
  { label: 'الإحصائيات', view: 'stats', icon: <BarChart3 className="h-4 w-4" /> },
];

// Secondary nav items (shown in "المزيد" dropdown on desktop)
const secondaryNavItems: { label: string; view: ViewType; icon: React.ReactNode; description: string }[] = [
  { label: 'استكشف المدن', view: 'cities', icon: <MapPin className="h-4 w-4" />, description: 'تصفح حسب المدينة المغربية' },
  { label: 'المقارنة', view: 'comparison', icon: <GitCompare className="h-4 w-4" />, description: 'قارن بين المباريات والمدارس' },
  { label: 'المفضلة', view: 'favorites', icon: <Heart className="h-4 w-4" />, description: 'العناصر المحفوظة' },
  { label: 'التذكيرات', view: 'reminders', icon: <Bell className="h-4 w-4" />, description: 'تذكيرات مواعيد المباريات' },
  { label: 'تتبع الترشيحات', view: 'applications', icon: <ClipboardList className="h-4 w-4" />, description: 'تتبع حالة ترشيحاتك' },
  { label: 'الأسئلة الشائعة', view: 'faq', icon: <HelpCircle className="h-4 w-4" />, description: 'دليل الاستخدام والمساعدة' },
];

// All public nav items for mobile menu (NO admin)
const allNavItems = [...primaryNavItems, ...secondaryNavItems];

export function Header() {
  const { currentView, setView, setSearchQuery } = useNavigationStore();
  const { user, isAuthenticated } = useAdminAuthStore(); // سحب بيانات الأدمين
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (view: ViewType) => {
    setView(view);
    setMobileOpen(false);
  };

  const handleSearchClick = () => {
    setSearchQuery('');
    setView('search');
    setMobileOpen(false);
  };

  const isSecondaryActive = secondaryNavItems.some(item => item.view === currentView);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="logo-hover flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md">
            م
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">مباريات</span>
            <span className="text-[10px] text-muted-foreground leading-tight">المغرب</span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {primaryNavItems.map((item) => (
            <div key={item.view} className="relative">
              <Button
                variant={currentView === item.view ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleNavClick(item.view)}
                className={`gap-1.5 text-sm transition-all duration-200 ${
                  currentView === item.view
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                {item.icon}
                {item.label}
              </Button>
              {/* Gradient bottom border on active */}
              {currentView === item.view && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />
              )}
            </div>
          ))}

          {/* More Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={isSecondaryActive ? 'default' : 'ghost'}
                size="sm"
                className={`gap-1 text-sm transition-all duration-200 ${
                  isSecondaryActive
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
                المزيد
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64" dir="rtl">
              <DropdownMenuLabel className="text-xs text-muted-foreground">استكشف المزيد</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {secondaryNavItems.map((item) => (
                <DropdownMenuItem
                  key={item.view}
                  onClick={() => handleNavClick(item.view)}
                  className={`flex items-center gap-3 py-2.5 cursor-pointer transition-colors ${
                    currentView === item.view
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : ''
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    currentView === item.view
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-[11px] text-muted-foreground">{item.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          
          {/* زر الأدمين المخفي: يظهر فقط إذا كان المستخدم مسجلاً ورتبته ADMIN */}
          {isAuthenticated && user?.role === 'ADMIN' && (
             <Button
               variant="outline"
               size="sm"
               onClick={() => window.location.href = '/?admin=true'}
               className="hidden lg:flex border-red-500/30 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 ml-2"
             >
               <ShieldAlert className="h-4 w-4" />
               الإدارة
             </Button>
          )}

          {/* Notification Bell */}
          <NotificationBell />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSearchClick}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Search className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Profile Menu (replaces admin indicator) */}
          <UserProfileMenu />

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72" dir="rtl">
              <SheetTitle className="text-right mb-6">القائمة</SheetTitle>
              <nav className="flex flex-col gap-1.5 mt-4">
                
                {/* زر الأدمين في الموبايل */}
                {isAuthenticated && user?.role === 'ADMIN' && (
                   <Button
                     variant="outline"
                     onClick={() => window.location.href = '/?admin=true'}
                     className="justify-start gap-3 h-11 rounded-lg border-red-500/30 text-red-600 hover:bg-red-50 hover:text-red-700 mb-2"
                   >
                     <ShieldAlert className="h-4 w-4" />
                     لوحة الإدارة
                   </Button>
                )}

                {allNavItems.map((item) => (
                  <Button
                    key={item.view}
                    variant={currentView === item.view ? 'default' : 'ghost'}
                    onClick={() => handleNavClick(item.view)}
                    className={`justify-start gap-3 h-11 rounded-lg transition-all duration-200 ${
                      currentView === item.view
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
                <hr className="my-2" />
                <Button
                  variant="ghost"
                  onClick={handleSearchClick}
                  className="justify-start gap-3 h-11 rounded-lg"
                >
                  <Search className="h-4 w-4" />
                  البحث
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
