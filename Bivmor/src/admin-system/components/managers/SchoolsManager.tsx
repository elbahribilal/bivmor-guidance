// Schools Manager Component
// مكون إدارة المدارس

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import { adminSchoolsApi, adminCitiesApi, adminCategoriesApi, adminLevelsApi } from '../../services/admin-api';
import { TablePagination } from '../shared/TablePagination';
import type { City, Category, Level, SchoolType } from '@/types';
import type { SchoolFormData } from '../../types/admin';
import { DEFAULT_SCHOOL_FORM } from '../../types/admin';

export function SchoolsManager() {
  const [schools, setSchools] = useState<{ data: import('@/types').School[] }['data']>([]);
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
      adminSchoolsApi.list({ limit: 100 }).then(r => setSchools(r.data)),
      adminCitiesApi.list().then(r => setCities(r.data)),
      adminCategoriesApi.list().then(r => setCategories(r.data)),
      adminLevelsApi.list().then(r => setLevels(r.data)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await adminSchoolsApi.list({ limit: 100 });
    setSchools(r.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المؤسسة؟')) return;
    try {
      await adminSchoolsApi.delete(id);
      toast.success('تم حذف المؤسسة');
      refreshData();
    } catch {
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
                          await adminSchoolsApi.update(school.id, { isFeatured: checked });
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
  const [form, setForm] = useState<SchoolFormData>(DEFAULT_SCHOOL_FORM);

  useEffect(() => {
    if (editId && open) {
      adminSchoolsApi.get(editId).then(r => {
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
      setForm(DEFAULT_SCHOOL_FORM);
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
        await adminSchoolsApi.update(editId, data);
        toast.success('تم تحديث المؤسسة');
      } else {
        await adminSchoolsApi.create(data);
        toast.success('تم إنشاء المؤسسة');
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
