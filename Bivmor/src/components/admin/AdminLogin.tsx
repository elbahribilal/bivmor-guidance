'use client';

import { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signIn } from 'next-auth/react';

export function AdminLogin() {
  const { isLoading, setShowLogin } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1. تشغيل ملف الـ Seed
    fetch('/api/admin/seed', {
      method: 'POST',
      headers: { 'x-admin-init': 'bivmor-init-2024' },
    }).catch(() => {});

    // 2. التحقق التلقائي من الجلسة
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
      // الحل البرمجي: استخدام signIn الرسمية لتجنب 401
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError('بيانات الدخول غير صحيحة أو ليس لديك صلاحية أدمين');
        setSubmitting(false);
        return;
      }

      // جلب بيانات الجلسة بعد نجاح الدخول
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
      setError('حدث خطأ أثناء تسجيل الدخول');
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
      {/* إعادة الخلفية الزخرفية المغربية */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="moroccan-geometric" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L50 15 L65 10 L60 25 L80 30 L65 40 L75 55 L55 50 L50 65 L40 50 L30 65 L25 50 L5 55 L15 40 L0 30 L20 25 L15 10 L30 15 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-600" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#moroccan-geometric)" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div className="text-center mb-8" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg mb-4">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">الوصول الإداري</h1>
          <p className="text-sm text-muted-foreground text-emerald-700/70">بوابة إدارة منصة بيفمور</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-0 shadow-2xl bg-background/95 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600" />
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                تسجيل الدخول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
                      <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="pr-10 focus:ring-emerald-500" 
                      placeholder="admin@bivmor.ma"
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="pr-10 pl-10 focus:ring-emerald-500" 
                      placeholder="••••••••"
                      required 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-11" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4 ml-2" />}
                  دخول لوحة التحكم
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t text-center">
                <Button variant="ghost" size="sm" onClick={() => setShowLogin(false)} className="gap-2 text-muted-foreground hover:text-emerald-600">
                   العودة للموقع <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
