// Competitions Manager Component
// مكون إدارة المباريات

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/shared/StatusBadge';
import {
  Plus, Pencil, Trash2, Save, Loader2, RefreshCw,
} from 'lucide-react';
import { adminCompetitionsApi, adminCitiesApi, adminCategoriesApi, adminLevelsApi, adminSchoolsApi } from '../../services/admin-api';
import { TablePagination } from '../shared/TablePagination';
import type { Competition, City, Category, Level, School, CompetitionStatus, CompetitionType } from '@/types';
import { DEFAULT_COMPETITION_FORM } from '../../types/admin';
import type { CompetitionFormData } from '../../types/admin';

export function CompetitionsManager() {
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
      adminCompetitionsApi.list({ limit: 50 }).then(r => setCompetitions(r.data)),
      adminCitiesApi.list().then(r => setCities(r.data)),
      adminCategoriesApi.list().then(r => setCategories(r.data)),
      adminLevelsApi.list().then(r => setLevels(r.data)),
      adminSchoolsApi.list({ limit: 100 }).then(r => setSchools(r.data)),
    ]).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await adminCompetitionsApi.list({ limit: 50 });
    setCompetitions(r.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المباراة؟')) return;
    try {
      await adminCompetitionsApi.delete(id);
      toast.success('تم حذف المباراة بنجاح');
      refreshData();
    } catch {
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
                const result = await adminCompetitionsApi.autoUpdateStatus();
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
                          await adminCompetitionsApi.update(comp.id, { isFeatured: checked });
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
  const [form, setForm] = useState<CompetitionFormData>(DEFAULT_COMPETITION_FORM);

  useEffect(() => {
    if (editId && open) {
      adminCompetitionsApi.get(editId).then(r => {
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
      setForm(DEFAULT_COMPETITION_FORM);
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
        await adminCompetitionsApi.update(editId, data);
        toast.success('تم تحديث المباراة');
      } else {
        await adminCompetitionsApi.create(data);
        toast.success('تم إنشاء المباراة');
      }
      onSaved();
      onClose();
    } catch {
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
