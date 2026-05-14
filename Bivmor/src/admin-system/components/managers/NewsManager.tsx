// News Manager Component
// مكون إدارة الأخبار

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
import { adminNewsApi } from '../../services/admin-api';
import { TablePagination } from '../shared/TablePagination';
import type { News } from '@/types';
import type { NewsFormData } from '../../types/admin';
import { DEFAULT_NEWS_FORM } from '../../types/admin';

export function NewsManager() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newsPage, setNewsPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    adminNewsApi.list({ publishedOnly: false, limit: 100 }).then(r => setNews(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const refreshData = async () => {
    const r = await adminNewsApi.list({ publishedOnly: false, limit: 100 });
    setNews(r.data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    try {
      await adminNewsApi.delete(id);
      toast.success('تم حذف الخبر');
      refreshData();
    } catch {
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
                          await adminNewsApi.update(item.id, { isPublished: checked });
                          refreshData();
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isPinned}
                        onCheckedChange={async (checked) => {
                          await adminNewsApi.update(item.id, { isPinned: checked });
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
  const [form, setForm] = useState<NewsFormData>(DEFAULT_NEWS_FORM);

  useEffect(() => {
    if (editId && open) {
      adminNewsApi.get(editId).then(r => {
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
      setForm(DEFAULT_NEWS_FORM);
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
        await adminNewsApi.update(editId, form);
        toast.success('تم تحديث الخبر');
      } else {
        await adminNewsApi.create(form);
        toast.success('تم إنشاء الخبر');
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
