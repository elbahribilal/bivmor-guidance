'use client';

import { useState } from 'react';
import { useUserAuthStore } from '@/store/user-auth';
import { useNavigationStore } from '@/store/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Mail, Phone, Lock, MapPin, Bell, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { citiesApi } from '@/lib/api';

interface UserNotificationPrefs {
  deadlineReminders: boolean;
  newCompetitions: boolean;
  statusChanges: boolean;
  newsletter: boolean;
}

const DEFAULT_NOTIFICATION_PREFS: UserNotificationPrefs = {
  deadlineReminders: true,
  newCompetitions: true,
  statusChanges: true,
  newsletter: false,
};

export function UserProfileView() {
  const { user, isAuthenticated, updateProfile, resetPassword, setShowAuthModal } = useUserAuthStore();
  const { setView } = useNavigationStore();

  // Parse notification prefs from user data
  const parsedNotifPrefs = user?.notificationPrefs
    ? (() => {
        try {
          return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(user.notificationPrefs) };
        } catch {
          return DEFAULT_NOTIFICATION_PREFS;
        }
      })()
    : DEFAULT_NOTIFICATION_PREFS;

  // Profile form state - initialized from user data
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [preferredCityId, setPreferredCityId] = useState(user?.preferredCityId || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState<UserNotificationPrefs>(parsedNotifPrefs);
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);
  const [notifsSaved, setNotifsSaved] = useState(false);

  // Fetch cities for preferred city dropdown
  const { data: citiesData } = useQuery({
    queryKey: ['cities-for-profile'],
    queryFn: () => citiesApi.list(),
    staleTime: 5 * 60 * 1000,
  });

  const cities = citiesData?.data || [];

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-6">
            <User className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3">الملف الشخصي</h2>
          <p className="text-muted-foreground mb-6">
            سجّل دخولك للوصول إلى ملفك الشخصي وإعداداتك
          </p>
          <Button
            onClick={() => setShowAuthModal(true, 'login')}
            className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileSaved(false);
    const success = await updateProfile({
      name: name || undefined,
      phone: phone || undefined,
      preferredCityId: preferredCityId || undefined,
    });
    setIsSavingProfile(false);
    if (success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    }
  };

  const handleSavePassword = async () => {
    setPasswordError(null);
    setPasswordSaved(false);

    if (!currentPassword || !newPassword) {
      setPasswordError('كلمة المرور الحالية والجديدة مطلوبتان');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsSavingPassword(true);
    const success = await resetPassword(currentPassword, newPassword);
    setIsSavingPassword(false);

    if (success) {
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    }
  };

  const handleSaveNotifs = async () => {
    setIsSavingNotifs(true);
    setNotifsSaved(false);
    const success = await updateProfile({
      notificationPrefs: JSON.stringify(notifPrefs),
    });
    setIsSavingNotifs(false);
    if (success) {
      setNotifsSaved(true);
      setTimeout(() => setNotifsSaved(false), 3000);
    }
  };

  const toggleNotifPref = (key: keyof UserNotificationPrefs) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setView('home')}
          className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold shadow-lg shadow-emerald-500/20">
            {user?.name?.charAt(0) || user?.email.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">الملف الشخصي</h1>
            <p className="text-muted-foreground" dir="ltr">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <Card className="mb-6 border-emerald-100 dark:border-emerald-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            المعلومات الشخصية
          </CardTitle>
          <CardDescription>حدّث معلوماتك الشخصية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">الاسم الكامل</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pr-10"
                  placeholder="أدخل اسمك"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="profile-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pr-10"
                  placeholder="+212 6XX XXX XXX"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={user?.email || ''}
                className="pr-10 bg-muted/50"
                disabled
                dir="ltr"
              />
            </div>
            <p className="text-xs text-muted-foreground">لا يمكن تغيير البريد الإلكتروني</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-city">المدينة المفضلة</Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <select
                id="profile-city"
                value={preferredCityId}
                onChange={(e) => setPreferredCityId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                dir="rtl"
              >
                <option value="">اختر مدينة</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.nameAr || city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSaveProfile}
              className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm"
              disabled={isSavingProfile}
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جارٍ الحفظ...
                </>
              ) : profileSaved ? (
                <>
                  <Check className="h-4 w-4 ml-2" />
                  تم الحفظ
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="mb-6 border-emerald-100 dark:border-emerald-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            تغيير كلمة المرور
          </CardTitle>
          <CardDescription>حدّث كلمة مرورك للحفاظ على أمان حسابك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">كلمة المرور الحالية</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
                dir="ltr"
                placeholder="••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">كلمة المرور الجديدة</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                  placeholder="6 أحرف على الأقل"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">تأكيد كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pr-10"
                  dir="ltr"
                  placeholder="أعد إدخال كلمة المرور"
                />
              </div>
            </div>
          </div>

          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {passwordError}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSavePassword}
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              disabled={isSavingPassword}
            >
              {isSavingPassword ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جارٍ التغيير...
                </>
              ) : passwordSaved ? (
                <>
                  <Check className="h-4 w-4 ml-2 text-emerald-600" />
                  تم التغيير
                </>
              ) : (
                'تغيير كلمة المرور'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences Card */}
      <Card className="mb-6 border-emerald-100 dark:border-emerald-900/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            إعدادات التنبيهات
          </CardTitle>
          <CardDescription>حدّد التنبيهات التي تريد استلامها</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            {
              key: 'deadlineReminders' as const,
              label: 'تذكيرات الآجال',
              desc: 'تنبيهات قبل انتهاء مواعيد التسجيل',
            },
            {
              key: 'newCompetitions' as const,
              label: 'مباريات جديدة',
              desc: 'تنبيهات عند إضافة مباريات جديدة',
            },
            {
              key: 'statusChanges' as const,
              label: 'تغييرات الحالة',
              desc: 'تنبيهات عند تغيير حالة المباريات',
            },
            {
              key: 'newsletter' as const,
              label: 'النشرة البريدية',
              desc: 'ملخص أسبوعي للمباريات والفرص',
            },
          ].map((item, index) => (
            <div key={item.key}>
              <div
                className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-3 -m-3 transition-colors"
                onClick={() => toggleNotifPref(item.key)}
              >
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Badge
                  variant={notifPrefs[item.key] ? 'default' : 'secondary'}
                  className={
                    notifPrefs[item.key]
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                      : ''
                  }
                >
                  {notifPrefs[item.key] ? 'مفعّل' : 'معطّل'}
                </Badge>
              </div>
              {index < 3 && <Separator className="mt-3" />}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleSaveNotifs}
              variant="outline"
              className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              disabled={isSavingNotifs}
            >
              {isSavingNotifs ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جارٍ الحفظ...
                </>
              ) : notifsSaved ? (
                <>
                  <Check className="h-4 w-4 ml-2 text-emerald-600" />
                  تم الحفظ
                </>
              ) : (
                'حفظ الإعدادات'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
