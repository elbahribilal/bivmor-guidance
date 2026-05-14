'use client';

import { useEffect, useState } from 'react';
import { useNavigationStore } from '@/store/navigation';
import { useAdminAuthStore } from '@/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { dashboardApi, competitionsApi, schoolsApi, categoriesApi, citiesApi, levelsApi, settingsApi, notificationsApi, newsApi, activityApi } from '@/lib/api';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Competition, School, Category, City, Level, DashboardStats, CompetitionStatus, CompetitionType, SchoolType, SiteSettingsMap, Notification, News, ActivityLog } from '@/types';
import {
  Trophy, GraduationCap, LayoutDashboard, Plus, Pencil, Trash2,
  BarChart3, Settings, ArrowRight, X, Save, Loader2, Globe, Pen, Users, Bell, RefreshCw, Newspaper,
  ChevronLeft, ChevronRight, Shield, LogOut, AlertCircle, Activity, Clock, Filter
} from 'lucide-react';

export function AdminDashboard() {
  const { setView } = useNavigationStore();
  const { user, logout, isAuthenticated } = useAdminAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      useAdminAuthStore.setState({ showLogin: true });
      return;
    }

    dashboardApi.stats().then(r => setStats(r.data)).catch((err) => {
      if (err.message?.includes('غير مصرح') || err.message?.includes('401') || err.message?.includes('403')) {
        setAuthError(true);
      }
      console.error(err);
    });
  }, [isAuthenticated]);

  if (authError) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">انتهت جلسة العمل</h2>
        <p className="text-muted-foreground mb-6">يرجى تسجيل الدخول مرة أخرى</p>
        <Button onClick={logout} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <LogOut className="h-4 w-4" />
          تسجيل الدخول مجدداً
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-sm text-muted-foreground">
              مرحباً، {user?.name || 'المسؤول'} • <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 inline-flex"><Shield className="h-3 w-3" />{user?.role === 'ADMIN' ? 'مدير' : 'محرر'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
            <LogOut className="h-4 w-4" />
            خروج
          </Button>
          <Button variant="outline" size="sm" onClick={() => setView('home')} className="gap-1.5">
            <ArrowRight className="h-4 w-4" />
            العودة للموقع
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCompetitions}</p>
                  <p className="text-xs text-muted-foreground">إجمالي المباريات</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-400 to-green-600" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.openCompetitions}</p>
                  <p className="text-xs text-muted-foreground">مفتوحة</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-teal-400 to-teal-600" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                  <GraduationCap className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSchools}</p>
                  <p className="text-xs text-muted-foreground">المدارس</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-600" />
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCategories}</p>
                  <p className="text-xs text-muted-foreground">التصنيفات</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Management Tabs */}
      <Tabs defaultValue="competitions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 max-w-3xl">
          <TabsTrigger value="competitions" className="gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">المباريات</span>
          </TabsTrigger>
          <TabsTrigger value="schools" className="gap-1.5">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">المدارس</span>
          </TabsTrigger>
          <TabsTrigger value="news" className="gap-1.5">
            <Newspaper className="h-4 w-4" />
            <span className="hidden sm:inline">الأخبار</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">الإشعارات</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">النشاط</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">التصنيفات</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">الإعدادات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="competitions">
          <CompetitionsManager />
        </TabsContent>
        <TabsContent value="schools">
          <SchoolsManager />
        </TabsContent>
        <TabsContent value="news">
          <NewsManager />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityManager />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesManager />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsManager />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================
// Pagination Helper
// =============================================

function TablePagination({ page, totalPages, total, onPageChange }: { page: number; totalPages: number; total: number; onPageChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between py-3 border-t mt-2">
      <span className="text-xs text-muted-foreground">إجمالي {total} عنصر</span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="gap-1 h-8">
          <ChevronRight className="h-3.5 w-3.5" />
          السابق
        </Button>
        <span className="text-xs font-medium px-2">{page} / {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="gap-1 h-8">
          التالي
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

// =============================================
// Competitions Manager
// =============================================

function CompetitionsManager() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [compPage, setCompPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    Promise.all([
      competitionsApi.list({ limit: 50 }).then(r => setCompetitions(r.data)),
      citiesApi.list().then(r => setCities(r.data)),
      categoriesApi.list().then(r => setCategories(r.data)),
      levelsApi.list().then(r => setLevels(r.data)),
      schoolsApi.list({ limit: 100 }).then(r => setSchools(r.data)),
    ]).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await competitionsApi.list({ limit: 50 });
    setCompetitions(r.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المباراة؟')) return;
    try {
      await competitionsApi.delete(id);
      toast.success('تم حذف المباراة بنجاح');
      refreshData();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">إدارة المباريات</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              try {
                const result = await competitionsApi.autoUpdateStatus();
                toast.success(`تم تحديث ${result.updatedCount} مباراة`);
                refreshData();
              } catch {
                toast.error('حدث خطأ أثناء تحديث الحالات');
              }
            }}
            className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/20"
          >
            <RefreshCw className="h-4 w-4" />
            تحديث حالات المباريات
          </Button>
          <Button size="sm" onClick={() => setIsCreating(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            إضافة مباراة
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">المدينة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">مميزة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitions.slice((compPage - 1) * PAGE_SIZE, compPage * PAGE_SIZE).map((comp) => (
                  <TableRow key={comp.id}>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{comp.title}</TableCell>
                    <TableCell className="text-sm">{comp.city?.name || '-'}</TableCell>
                    <TableCell><StatusBadge status={comp.status} /></TableCell>
                    <TableCell>
                      <Switch
                        checked={comp.isFeatured}
                        onCheckedChange={async (checked) => {
                          await competitionsApi.update(comp.id, { isFeatured: checked });
                          refreshData();
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(comp.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(comp.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TablePagination page={compPage} totalPages={Math.ceil(competitions.length / PAGE_SIZE)} total={competitions.length} onPageChange={setCompPage} />
      </CardContent>

      {/* Create/Edit Dialog */}
      <CompetitionFormDialog
        open={isCreating || editingId !== null}
        onClose={() => { setIsCreating(false); setEditingId(null); }}
        editId={editingId}
        cities={cities}
        categories={categories}
        levels={levels}
        schools={schools}
        onSaved={refreshData}
      />
    </Card>
  );
}

// =============================================
// Competition Form Dialog
// =============================================

function CompetitionFormDialog({
  open, onClose, editId, cities, categories, levels, schools, onSaved
}: {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  cities: City[];
  categories: Category[];
  levels: Level[];
  schools: School[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    officialLink: '',
    deadline: '',
    requirements: '',
    documents: '',
    stages: '',
    cityId: '',
    schoolId: '',
    categoryId: '',
    levelId: '',
    status: 'OPEN' as CompetitionStatus,
    type: 'ACADEMIC' as CompetitionType,
    isFeatured: false,
    isPinned: false,
    registrationOpen: true,
  });

  useEffect(() => {
    if (editId && open) {
      competitionsApi.get(editId).then(r => {
        const c = r.data;
        setForm({
          title: c.title,
          shortDescription: c.shortDescription || '',
          fullDescription: c.fullDescription || '',
          officialLink: c.officialLink || '',
          deadline: c.deadline ? new Date(c.deadline).toISOString().slice(0, 16) : '',
          requirements: c.requirements || '',
          documents: c.documents || '',
          stages: c.stages || '',
          cityId: c.cityId || '',
          schoolId: c.schoolId || '',
          categoryId: c.categoryId || '',
          levelId: c.levelId || '',
          status: c.status,
          type: c.type || 'ACADEMIC',
          isFeatured: c.isFeatured,
          isPinned: c.isPinned,
          registrationOpen: c.registrationOpen,
        });
      });
    } else if (!editId && open) {
      setForm({
        title: '', shortDescription: '', fullDescription: '', officialLink: '',
        deadline: '', requirements: '', documents: '', stages: '',
        cityId: '', schoolId: '', categoryId: '', levelId: '',
        status: 'OPEN', type: 'ACADEMIC', isFeatured: false, isPinned: false, registrationOpen: true,
      });
    }
  }, [editId, open]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('العنوان مطلوب');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
        cityId: form.cityId || undefined,
        schoolId: form.schoolId || undefined,
        categoryId: form.categoryId || undefined,
        levelId: form.levelId || undefined,
      };

      if (editId) {
        await competitionsApi.update(editId, data);
        toast.success('تم تحديث المباراة');
      } else {
        await competitionsApi.create(data);
        toast.success('تم إنشاء المباراة');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editId ? 'تعديل المباراة' : 'إضافة مباراة جديدة'}</DialogTitle>
          <DialogDescription className="sr-only">نموذج إدارة المباريات</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">العنوان *</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان المباراة" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">وصف مختصر</label>
              <Textarea value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="وصف مختصر للمباراة" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">المدينة</label>
              <Select value={form.cityId || 'none'} onValueChange={(v) => setForm({ ...form, cityId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">المؤسسة</label>
              <Select value={form.schoolId || 'none'} onValueChange={(v) => setForm({ ...form, schoolId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="اختر المؤسسة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">التصنيف</label>
              <Select value={form.categoryId || 'none'} onValueChange={(v) => setForm({ ...form, categoryId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">المستوى</label>
              <Select value={form.levelId || 'none'} onValueChange={(v) => setForm({ ...form, levelId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">نوع المباراة</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as CompetitionType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMISSION">🚪 ولوج</SelectItem>
                  <SelectItem value="ACADEMIC">🎓 دراسية</SelectItem>
                  <SelectItem value="RECRUITMENT">💼 توظيف</SelectItem>
                  <SelectItem value="SCHOLARSHIP">💰 منحة دراسية</SelectItem>
                  <SelectItem value="CONTINUING_EDUCATION">📚 تكوين مستمر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">الحالة</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CompetitionStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">مفتوح</SelectItem>
                  <SelectItem value="CLOSED">مغلق</SelectItem>
                  <SelectItem value="EXPIRED">انتهى</SelectItem>
                  <SelectItem value="UPCOMING">قريباً</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">آخر أجل</label>
              <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">الرابط الرسمي</label>
              <Input value={form.officialLink} onChange={(e) => setForm({ ...form, officialLink: e.target.value })} placeholder="https://..." dir="ltr" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                <span className="text-sm">مميزة</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isPinned} onCheckedChange={(v) => setForm({ ...form, isPinned: v })} />
                <span className="text-sm">مثبتة</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.registrationOpen} onCheckedChange={(v) => setForm({ ...form, registrationOpen: v })} />
                <span className="text-sm">التسجيل مفتوح</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editId ? 'تحديث' : 'إنشاء'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// Schools Manager
// =============================================

function SchoolsManager() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [schoolPage, setSchoolPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    Promise.all([
      schoolsApi.list({ limit: 100 }).then(r => setSchools(r.data)),
      citiesApi.list().then(r => setCities(r.data)),
      categoriesApi.list().then(r => setCategories(r.data)),
      levelsApi.list().then(r => setLevels(r.data)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await schoolsApi.list({ limit: 100 });
    setSchools(r.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المؤسسة؟')) return;
    try {
      await schoolsApi.delete(id);
      toast.success('تم حذف المؤسسة');
      refreshData();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">إدارة المدارس</CardTitle>
        <Button size="sm" onClick={() => setIsCreating(true)} className="gap-1.5 bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4" />
          إضافة مدرسة
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">المدينة</TableHead>
                  <TableHead className="text-right">النوع</TableHead>
                  <TableHead className="text-right">مميزة</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.slice((schoolPage - 1) * PAGE_SIZE, schoolPage * PAGE_SIZE).map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{school.name}</TableCell>
                    <TableCell className="text-sm">{school.city?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {school.type === 'PUBLIC' ? 'عمومي' : school.type === 'PRIVATE' ? 'خاص' : 'شبه خصوصي'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={school.isFeatured}
                        onCheckedChange={async (checked) => {
                          await schoolsApi.update(school.id, { isFeatured: checked });
                          refreshData();
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(school.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(school.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TablePagination page={schoolPage} totalPages={Math.ceil(schools.length / PAGE_SIZE)} total={schools.length} onPageChange={setSchoolPage} />
      </CardContent>

      {/* School Form Dialog */}
      <SchoolFormDialog
        open={isCreating || editingId !== null}
        onClose={() => { setIsCreating(false); setEditingId(null); }}
        editId={editingId}
        cities={cities}
        categories={categories}
        levels={levels}
        onSaved={refreshData}
      />
    </Card>
  );
}

// =============================================
// School Form Dialog
// =============================================

function SchoolFormDialog({
  open, onClose, editId, cities, categories, levels, onSaved
}: {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  cities: City[];
  categories: Category[];
  levels: Level[];
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    shortDescription: '',
    fullDescription: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    cityId: '',
    categoryId: '',
    levelId: '',
    type: 'PUBLIC' as SchoolType,
    isFeatured: false,
    isActive: true,
  });

  useEffect(() => {
    if (editId && open) {
      schoolsApi.get(editId).then(r => {
        const s = r.data;
        setForm({
          name: s.name,
          shortDescription: s.shortDescription || '',
          fullDescription: s.fullDescription || '',
          website: s.website || '',
          email: s.email || '',
          phone: s.phone || '',
          address: s.address || '',
          cityId: s.cityId || '',
          categoryId: s.categoryId || '',
          levelId: s.levelId || '',
          type: s.type,
          isFeatured: s.isFeatured,
          isActive: s.isActive,
        });
      });
    } else if (!editId && open) {
      setForm({
        name: '', shortDescription: '', fullDescription: '', website: '', email: '',
        phone: '', address: '', cityId: '', categoryId: '', levelId: '',
        type: 'PUBLIC', isFeatured: false, isActive: true,
      });
    }
  }, [editId, open]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('اسم المؤسسة مطلوب');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        cityId: form.cityId || undefined,
        categoryId: form.categoryId || undefined,
        levelId: form.levelId || undefined,
      };
      if (editId) {
        await schoolsApi.update(editId, data);
        toast.success('تم تحديث المؤسسة');
      } else {
        await schoolsApi.create(data);
        toast.success('تم إنشاء المؤسسة');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editId ? 'تعديل المؤسسة' : 'إضافة مؤسسة جديدة'}</DialogTitle>
          <DialogDescription className="sr-only">نموذج إدارة المؤسسات</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">اسم المؤسسة *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسم المؤسسة" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">وصف مختصر</label>
              <Textarea value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="وصف مختصر" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">المدينة</label>
              <Select value={form.cityId || 'none'} onValueChange={(v) => setForm({ ...form, cityId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="اختر المدينة" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">التصنيف</label>
              <Select value={form.categoryId || 'none'} onValueChange={(v) => setForm({ ...form, categoryId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="اختر التصنيف" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">المستوى</label>
              <Select value={form.levelId || 'none'} onValueChange={(v) => setForm({ ...form, levelId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون</SelectItem>
                  {levels.map((l) => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">النوع</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as SchoolType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC">عمومي</SelectItem>
                  <SelectItem value="PRIVATE">خاص</SelectItem>
                  <SelectItem value="SEMI_PRIVATE">شبه خصوصي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">الموقع الإلكتروني</label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" dir="ltr" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">الهاتف</label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+212..." dir="ltr" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                <span className="text-sm">مميزة</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                <span className="text-sm">نشطة</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-teal-600 hover:bg-teal-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editId ? 'تحديث' : 'إنشاء'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// Categories Manager
// =============================================

function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [catPage, setCatPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    categoriesApi.list().then(r => setCategories(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await categoriesApi.list();
    setCategories(r.data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">التصنيفات</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">Slug</TableHead>
                  <TableHead className="text-right">المباريات</TableHead>
                  <TableHead className="text-right">المدارس</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.slice((catPage - 1) * PAGE_SIZE, catPage * PAGE_SIZE).map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium text-sm">{cat.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono" dir="ltr">{cat.slug}</TableCell>
                    <TableCell className="text-sm">{cat._count?.competitions || 0}</TableCell>
                    <TableCell className="text-sm">{cat._count?.schools || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TablePagination page={catPage} totalPages={Math.ceil(categories.length / PAGE_SIZE)} total={categories.length} onPageChange={setCatPage} />
      </CardContent>
    </Card>
  );
}

// =============================================
// News Manager
// =============================================

function NewsManager() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newsPage, setNewsPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    newsApi.list({ publishedOnly: false, limit: 100 }).then(r => setNews(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await newsApi.list({ publishedOnly: false, limit: 100 });
    setNews(r.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    try {
      await newsApi.delete(id);
      toast.success('تم حذف الخبر');
      refreshData();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">إدارة الأخبار</CardTitle>
        <Button size="sm" onClick={() => setIsCreating(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" />
          إضافة خبر
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">العنوان</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">منشور</TableHead>
                  <TableHead className="text-right">مثبت</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.slice((newsPage - 1) * PAGE_SIZE, newsPage * PAGE_SIZE).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isPublished}
                        onCheckedChange={async (checked) => {
                          await newsApi.update(item.id, { isPublished: checked });
                          refreshData();
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isPinned}
                        onCheckedChange={async (checked) => {
                          await newsApi.update(item.id, { isPinned: checked });
                          refreshData();
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(item.publishedAt).toLocaleDateString('ar-MA')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(item.id)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <TablePagination page={newsPage} totalPages={Math.ceil(news.length / PAGE_SIZE)} total={news.length} onPageChange={setNewsPage} />
      </CardContent>

      {/* News Form Dialog */}
      <NewsFormDialog
        open={isCreating || editingId !== null}
        onClose={() => { setIsCreating(false); setEditingId(null); }}
        editId={editingId}
        onSaved={refreshData}
      />
    </Card>
  );
}

// =============================================
// News Form Dialog
// =============================================

function NewsFormDialog({
  open, onClose, editId, onSaved
}: {
  open: boolean;
  onClose: () => void;
  editId: string | null;
  onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'إعلان',
    isPublished: true,
    isPinned: false,
  });

  useEffect(() => {
    if (editId && open) {
      newsApi.get(editId).then(r => {
        const n = r.data;
        setForm({
          title: n.title,
          content: n.content,
          excerpt: n.excerpt || '',
          category: n.category || 'إعلان',
          isPublished: n.isPublished,
          isPinned: n.isPinned,
        });
      });
    } else if (!editId && open) {
      setForm({
        title: '', content: '', excerpt: '', category: 'إعلان', isPublished: true, isPinned: false,
      });
    }
  }, [editId, open]);

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('العنوان مطلوب');
      return;
    }
    if (!form.content.trim()) {
      toast.error('المحتوى مطلوب');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await newsApi.update(editId, form);
        toast.success('تم تحديث الخبر');
      } else {
        await newsApi.create(form);
        toast.success('تم إنشاء الخبر');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{editId ? 'تعديل الخبر' : 'إضافة خبر جديد'}</DialogTitle>
          <DialogDescription className="sr-only">نموذج إدارة الأخبار</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">العنوان *</label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان الخبر" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">الملخص</label>
            <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="ملخص مختصر للخبر" rows={2} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">المحتوى *</label>
            <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="محتوى الخبر الكامل" rows={6} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">التصنيف</label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="إعلان">📢 إعلان</SelectItem>
                <SelectItem value="آجل">⏰ آجل</SelectItem>
                <SelectItem value="نتائج">🏆 نتائج</SelectItem>
                <SelectItem value="نصيحة">💡 نصيحة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
              <span className="text-sm">منشور</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPinned} onCheckedChange={(v) => setForm({ ...form, isPinned: v })} />
              <span className="text-sm">مثبت</span>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>إلغاء</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editId ? 'تحديث' : 'إنشاء'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// =============================================
// Settings Manager
// =============================================

function SettingsManager() {
  const [settings, setSettings] = useState<SiteSettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const settingFields = [
    { key: 'site_name', label: 'اسم الموقع', placeholder: 'مباريات المغرب', type: 'text' as const },
    { key: 'hero_title', label: 'عنوان الصفحة الرئيسية', placeholder: 'مباريات المغرب', type: 'text' as const },
    { key: 'hero_subtitle', label: 'العنوان الفرعي', placeholder: 'منصتك الشاملة لجميع المباريات...', type: 'text' as const },
    { key: 'footer_text', label: 'نص الفوتر', placeholder: '© 2025 مباريات المغرب', type: 'text' as const },
    { key: 'contact_email', label: 'البريد الإلكتروني للتواصل', placeholder: 'contact@mbarayat.ma', type: 'text' as const },
    { key: 'newsletter_title', label: 'عنوان الاشتراك', placeholder: 'لا تفوّت أي مباراة', type: 'text' as const },
    { key: 'newsletter_subtitle', label: 'نص الاشتراك الفرعي', placeholder: 'تابعنا ليصلك كل جديد...', type: 'text' as const },
    { key: 'seo_description', label: 'وصف SEO', placeholder: 'وصف الموقع لمحركات البحث', type: 'textarea' as const },
    { key: 'seo_keywords', label: 'كلمات SEO المفتاحية', placeholder: 'مباريات، مدارس، تعليم، مغرب', type: 'text' as const },
  ];

  useEffect(() => {
    settingsApi.get().then(r => {
      setSettings(r.data || {});
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsArray = settingFields.map(f => ({
        key: f.key,
        value: settings[f.key] || '',
        type: 'TEXT' as const,
      }));
      await settingsApi.update(settings as SiteSettingsMap);
      toast.success('تم حفظ الإعدادات بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <CardTitle className="text-lg">إعدادات الموقع</CardTitle>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-1.5 bg-violet-600 hover:bg-violet-700">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ الإعدادات
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="bg-muted/30 rounded-lg p-4 space-y-1">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Pen className="h-4 w-4 text-emerald-600" />
              محتوى الصفحة الرئيسية
            </h3>
            <p className="text-xs text-muted-foreground">تخصيص النصوص والمحتوى المعروض في الموقع</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settingFields.slice(0, 6).map((field) => (
              <div key={field.key} className={field.key === 'hero_subtitle' || field.key === 'newsletter_subtitle' ? 'sm:col-span-2' : ''}>
                <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                <Input
                  value={settings[field.key] || ''}
                  onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          <Separator />

          <div className="bg-muted/30 rounded-lg p-4 space-y-1">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-600" />
              تحسين محركات البحث (SEO)
            </h3>
            <p className="text-xs text-muted-foreground">إعدادات ظهور الموقع في نتائج البحث</p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {settingFields.slice(6).map((field) => (
              <div key={field.key}>
                <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
                {field.type === 'textarea' ? (
                  <Textarea
                    value={settings[field.key] || ''}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    rows={3}
                  />
                ) : (
                  <Input
                    value={settings[field.key] || ''}
                    onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Notifications Manager
// =============================================

function NotificationsManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'INFO' as Notification['type'],
  });

  const typeConfig: Record<string, { label: string; color: string; bg: string }> = {
    INFO: { label: 'معلومات', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    WARNING: { label: 'تحذير', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    SUCCESS: { label: 'نجاح', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    ERROR: { label: 'خطأ', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  };

  const refreshData = async () => {
    try {
      const r = await notificationsApi.list({ limit: 100 });
      setNotifications(r.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('العنوان والرسالة مطلوبان');
      return;
    }
    setSaving(true);
    try {
      await notificationsApi.create({ title: form.title, message: form.message, type: form.type });
      toast.success('تم إنشاء الإشعار');
      setIsCreating(false);
      setForm({ title: '', message: '', type: 'INFO' });
      refreshData();
    } catch (err) {
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    try {
      await notificationsApi.delete(id);
      toast.success('تم حذف الإشعار');
      refreshData();
    } catch (err) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      toast.success('تم تعليم الكل كمقروء');
      refreshData();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-lg">إدارة الإشعارات</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} className="gap-1.5">
            تعليم الكل كمقروء
          </Button>
          <Button size="sm" onClick={() => setIsCreating(!isCreating)} className="gap-1.5 bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            إضافة إشعار
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Create Notification Form */}
        {isCreating && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border space-y-4">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-amber-600" />
              إنشاء إشعار جديد
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">العنوان *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان الإشعار" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium mb-1.5 block">الرسالة *</label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="نص الإشعار" rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">النوع</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Notification['type'] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INFO">معلومات</SelectItem>
                    <SelectItem value="WARNING">تحذير</SelectItem>
                    <SelectItem value="SUCCESS">نجاح</SelectItem>
                    <SelectItem value="ERROR">خطأ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setIsCreating(false); setForm({ title: '', message: '', type: 'INFO' }); }}>إلغاء</Button>
              <Button size="sm" onClick={handleCreate} disabled={saving} className="gap-1.5 bg-amber-600 hover:bg-amber-700">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                إنشاء
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد إشعارات حالياً</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map((notif) => {
              const config = typeConfig[notif.type] || typeConfig.INFO;
              return (
                <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${notif.isRead ? 'bg-background opacity-70' : 'bg-muted/30'}`}>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color} text-xs font-bold mt-0.5`}>
                    {notif.type === 'INFO' ? 'ℹ' : notif.type === 'WARNING' ? '⚠' : notif.type === 'SUCCESS' ? '✓' : '✕'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${notif.isRead ? 'text-muted-foreground' : ''}`}>{notif.title}</span>
                      <Badge variant="outline" className={`text-[10px] px-1.5 ${config.color}`}>{config.label}</Badge>
                      {!notif.isRead && <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1" dir="ltr">
                      {new Date(notif.createdAt).toLocaleDateString('ar-MA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!notif.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-emerald-600"
                        onClick={async () => {
                          await notificationsApi.markRead(notif.id);
                          refreshData();
                        }}
                      >
                        <span className="text-xs">✓</span>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={() => handleDelete(notif.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// Activity Manager
// =============================================

function ActivityManager() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [activityPage, setActivityPage] = useState(1);
  const PAGE_SIZE = 15;

  useEffect(() => {
    activityApi.list({ limit: 50, entity: entityFilter || undefined })
      .then(r => setLogs(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [entityFilter]);

  const refreshData = async () => {
    try {
      const r = await activityApi.list({ limit: 50, entity: entityFilter || undefined });
      setLogs(r.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      CREATE: 'إنشاء',
      UPDATE: 'تحديث',
      DELETE: 'حذف',
      LOGIN: 'تسجيل دخول',
      LOGOUT: 'تسجيل خروج',
      STATUS_UPDATE: 'تحديث حالة',
      FEATURED: 'تمييز',
    };
    return labels[action] || action;
  };

  const getEntityLabel = (entity: string): string => {
    const labels: Record<string, string> = {
      competition: 'مباراة',
      school: 'مدرسة',
      category: 'تصنيف',
      notification: 'إشعار',
      settings: 'إعدادات',
      news: 'خبر',
      user: 'مستخدم',
    };
    return labels[entity] || entity;
  };

  const getActionColor = (action: string): string => {
    const colors: Record<string, string> = {
      CREATE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      UPDATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      LOGIN: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      LOGOUT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
      STATUS_UPDATE: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      FEATURED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    };
    return colors[action] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const uniqueEntities = [...new Set(logs.map(l => l.entity))];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          سجل النشاط
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={entityFilter || 'all'} onValueChange={(v) => { setEntityFilter(v === 'all' ? '' : v); setActivityPage(1); }}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="تصفية حسب الكيان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {uniqueEntities.map(e => (
                <SelectItem key={e} value={e}>{getEntityLabel(e)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={refreshData} className="gap-1.5 h-8">
            <RefreshCw className="h-3.5 w-3.5" />
            تحديث
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-sm text-muted-foreground">لا توجد سجلات نشاط حتى الآن</p>
            <p className="text-xs text-muted-foreground mt-1">ستظهر هنا إجراءات المسؤولين مثل الإنشاء والتحديث والحذف</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            {logs.slice((activityPage - 1) * PAGE_SIZE, activityPage * PAGE_SIZE).map((log) => (
              <div key={log.id} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Badge className={`text-[10px] px-1.5 py-0 ${getActionColor(log.action)}`}>
                      {getActionLabel(log.action)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getEntityLabel(log.entity)}
                    </span>
                    {log.entityId && (
                      <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]" dir="ltr">
                        #{log.entityId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  {log.details && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{log.details}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(log.createdAt).toLocaleDateString('ar-MA', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        {logs.length > PAGE_SIZE && (
          <TablePagination
            page={activityPage}
            totalPages={Math.ceil(logs.length / PAGE_SIZE)}
            total={logs.length}
            onPageChange={setActivityPage}
          />
        )}
      </CardContent>
    </Card>
  );
}
