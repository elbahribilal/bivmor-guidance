// Notifications Manager Component
// مكون إدارة الإشعارات

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Loader2, Bell } from 'lucide-react';
import { adminNotificationsApi } from '../../services/admin-api';
import type { Notification, NotificationType } from '@/types';
import type { NotificationFormData } from '../../types/admin';
import { DEFAULT_NOTIFICATION_FORM, NOTIFICATION_TYPE_CONFIG } from '../../types/admin';

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<NotificationFormData>(DEFAULT_NOTIFICATION_FORM);

  const refreshData = async () => {
    try {
      const r = await adminNotificationsApi.list({ limit: 100 });
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
      await adminNotificationsApi.create({ title: form.title, message: form.message, type: form.type as NotificationType });
      toast.success('تم إنشاء الإشعار');
      setIsCreating(false);
      setForm(DEFAULT_NOTIFICATION_FORM);
      refreshData();
    } catch {
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإشعار؟')) return;
    try {
      await adminNotificationsApi.delete(id);
      toast.success('تم حذف الإشعار');
      refreshData();
    } catch {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await adminNotificationsApi.markAllRead();
      toast.success('تم تعليم الكل كمقروء');
      refreshData();
    } catch {
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
              <Button variant="outline" size="sm" onClick={() => { setIsCreating(false); setForm(DEFAULT_NOTIFICATION_FORM); }}>إلغاء</Button>
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
              const config = NOTIFICATION_TYPE_CONFIG[notif.type] || NOTIFICATION_TYPE_CONFIG.INFO;
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
                          await adminNotificationsApi.markRead(notif.id);
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
