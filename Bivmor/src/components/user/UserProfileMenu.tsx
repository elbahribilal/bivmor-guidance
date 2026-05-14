'use client';

import { useEffect, useState } from 'react';
import { useUserAuthStore } from '@/store/user-auth';
import { useNavigationStore } from '@/store/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User,
  Heart,
  Bell,
  ClipboardList,
  LogOut,
  Settings,
  Loader2,
} from 'lucide-react';
import type { ViewType } from '@/types';

export function UserProfileMenu() {
  const { isAuthenticated, isLoading, user, checkSession, logout, setShowAuthModal } = useUserAuthStore();
  const { setView } = useNavigationStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLoginClick = () => {
    setShowAuthModal(true, 'login');
  };

  const handleSignupClick = () => {
    setShowAuthModal(true, 'signup');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
  };

  const handleNavigate = (view: ViewType) => {
    setView(view);
  };

  // Loading state
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  // Not authenticated - show login/signup buttons
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLoginClick}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          تسجيل الدخول
        </Button>
        <Button
          size="sm"
          onClick={handleSignupClick}
          className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm shadow-sm shadow-emerald-500/10"
        >
          حساب جديد
        </Button>
      </div>
    );
  }

  // Authenticated - show profile dropdown
  const userInitial = user.name
    ? user.name.charAt(0)
    : user.email.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
        >
          <Avatar className="h-7 w-7 border-2 border-emerald-200 dark:border-emerald-700">
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline max-w-[100px] truncate text-foreground">
            {user.name || user.email.split('@')[0]}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" dir="rtl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.name || 'مستخدم'}
            </p>
            <p className="text-xs text-muted-foreground leading-none" dir="ltr">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleNavigate('profile')}
          className="gap-2 cursor-pointer"
        >
          <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          الملف الشخصي
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigate('favorites')}
          className="gap-2 cursor-pointer"
        >
          <Heart className="h-4 w-4 text-rose-500" />
          المفضلة
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigate('reminders')}
          className="gap-2 cursor-pointer"
        >
          <Bell className="h-4 w-4 text-amber-500" />
          التذكيرات
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigate('applications')}
          className="gap-2 cursor-pointer"
        >
          <ClipboardList className="h-4 w-4 text-blue-500" />
          الترشيحات
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleNavigate('profile')}
          className="gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
          الإعدادات
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 cursor-pointer text-red-600 dark:text-red-400"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
