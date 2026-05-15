'use client';

import { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// استيراد الدالة الرسمية - هذا هو السر!
import { signIn } from 'next-auth/react';

export function AdminLogin() {
  const { isLoading, setShowLogin } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // التأكد من وجود حساب الأدمين في قاعدة البيانات
    fetch('/api/admin/seed', {
      method: 'POST',
      headers: { 'x-admin-init': 'bivmor-init-2024' },
    }).catch(() => {});

    // التحقق من الجلسة الحالية
    const verifySession = async () => {
      try {
        const sessionRes = await fetch('/api/admin/session');
        const sessionData = await sessionRes.json();
        if (sessionData.authenticated) {
          useAdminAuthStore.setState({
            isAuthenticated: true,
            user: sessionData.user,
            isLoading: false,
            showLogin: false,
          });
          return;
        }
      } catch (err) {}
      useAdminAuthStore.setState({ isLoading: false });
    };
    verifySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // استخدام signIn الرسمية بدلاً من fetch اليدوي
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false, // نمنع إعادة التوجيه لنتحكم في الحالة برمجياً
      });

      if (result?.error) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setSubmitting(false);
        return;
      }

      // إذا نجح الدخول، نحدث حالة المتجر (Store)
      const sessionRes = await fetch('/api/admin/session');
      const sessionData = await sessionRes.json();

      if (sessionData.authenticated) {
        useAdminAuthStore.setState({
          isAuthenticated: true,
          user: sessionData.user,
          isLoading: false,
          showLogin: false,
        });
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative overflow-hidden admin-login-bg">
      {/* الخلفية الزخرفية */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-600 text-white mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">الوصول الإداري</h1>
        </div>

        <Card className="border-0 shadow-xl bg-background/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg">تسجيل الدخول</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@bivmor.ma"
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-3">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                دخول لوحة التحكم
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
