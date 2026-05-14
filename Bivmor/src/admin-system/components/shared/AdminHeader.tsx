// Admin Header Component
// مكون رأس لوحة التحكم

'use client';

import { Button } from '@/components/ui/button';
import { LayoutDashboard, ArrowRight, LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from '../../hooks/use-admin-auth';

export interface AdminHeaderProps {
  onBackToSite: () => void;
}

export function AdminHeader({ onBackToSite }: AdminHeaderProps) {
  const { displayName, roleLabel, logout } = useAdminAuth();

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-sm text-muted-foreground">
            مرحباً، {displayName} •{' '}
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 inline-flex">
              <Shield className="h-3 w-3" />
              {roleLabel}
            </span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToSite}
          className="gap-1.5"
        >
          <ArrowRight className="h-4 w-4" />
          العودة للموقع
        </Button>
      </div>
    </div>
  );
}
