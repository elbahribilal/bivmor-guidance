'use client';

import { useState, useEffect } from 'react';
import { useAdminAuthStore } from '@/store/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminLogin() {
  const { login, isLoading, setShowLogin } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // 1. Seed admin user on first login page load
    fetch('/api/admin/seed', {
      method: 'POST',
      headers: { 'x-admin-init': 'bivmor-init-2024' },
    }).catch(() => {});

    // 2. التحقق التلقائي من الجلسة وإيقاف التحميل اللانهائي
    const verifySession = async () => {
      try {
        const sessionRes = await fetch('/api/admin/session');
        const sessionData = await sessionRes.json();

        if (sessionData.authenticated) {
          // إذا كان المستخدم مسجلاً كأدمن، أدخله مباشرة
          useAdminAuthStore.setState({
            isAuthenticated: true,
            user: sessionData.user,
            isLoading: false,
            showLogin: false,
          });
          return;
        }
      } catch (err) {
        console.error("خطأ في التحقق من جلسة الأدمن:", err);
      }
      
      // إذا لم يكن مسجلاً أو حدث خطأ، أوقف التحميل ليظهر نموذج تسجيل الدخول
      useAdminAuthStore.setState({ isLoading: false });
    };

    verifySession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Use NextAuth credentials sign-in
      const csrfRes = await fetch('/api/auth/csrf');
      const csrfData = await csrfRes.json();

      const res = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          password,
          csrfToken: csrfData.csrfToken,
        }),
        redirect: 'manual',
      });

      // Check session after login attempt
      const sessionRes = await fetch('/api/admin/session');
      const sessionData = await sessionRes.json();

      if (sessionData.authenticated) {
        useAdminAuthStore.setState({
          isAuthenticated: true,
          user: sessionData.user,
          isLoading: false,
          showLogin: false,
        });
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
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
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري التحقق...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 relative overflow-hidden admin-login-bg">
      {/* Moroccan geometric pattern background */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="moroccan-geometric" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M40 0 L50 15 L65 10 L60 25 L80 30 L65 40 L75 55 L55 50 L50 65 L40 50 L30 65 L25 50 L5 55 L15 40 L0 30 L20 25 L15 10 L30 15 Z" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-600" />
              <circle cx="40" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-teal-500" />
              <circle cx="0" cy="0" r="3" fill="currentColor" className="text-emerald-500/30" />
              <circle cx="80" cy="0" r="3" fill="currentColor" className="text-emerald-500/30" />
              <circle cx="0" cy="80" r="3" fill="currentColor" className="text-emerald-500/30" />
              <circle cx="80" cy="80" r="3" fill="currentColor" className="text-emerald-500/30" />
              <path d="M0 0 L10 10 M80 0 L70 10 M0 80 L10 70 M80 80 L70 70" stroke="currentColor" strokeWidth="0.3" className="text-emerald-400/40" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#moroccan-geometric)" />
        </svg>

        <motion.div
          className="absolute top-[15%] right-[10%] w-20 h-20 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-xl"
          animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[8%] w-28 h-28 rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-xl"
          animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 mb-4 relative"
            whileHover={{ scale: 1.05 }}
          >
            <Shield className="h-8 w-8" />
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">الوصول الإداري</h1>
          <p className="text-sm text-muted-foreground">هذه المنطقة مخصصة للمسؤولين فقط</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute -inset-[2px] rounded-xl overflow-hidden">
            <div className="admin-login-gradient-border absolute inset-0" />
          </div>

          <Card className="relative border-0 shadow-xl shadow-emerald-500/5 bg-background/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-emerald-600" />
                تسجيل الدخول
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-3 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium">
                    البريد الإلكتروني
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@bivmor.ma"
                      className="pr-10 focus-glow"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-sm font-medium">
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10 pl-10 focus-glow"
                      required
                      dir="ltr"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 gap-2 h-11"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  دخول لوحة التحكم
                </Button>
              </form>

              <div className="mt-4 pt-4 border-t text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                  onClick={() => setShowLogin(false)}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  العودة للموقع
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
