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
    // Seed admin user on first login page load
    fetch('/api/admin/seed', {
      method: 'POST',
      headers: { 'x-admin-init': 'bivmor-init-2024' },
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Use NextAuth credentials sign-in
      // First get CSRF token
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
        {/* Main geometric SVG pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] dark:opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="moroccan-geometric" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              {/* 8-pointed star pattern */}
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

        {/* Floating decorative elements */}
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
        <motion.div
          className="absolute top-[60%] right-[70%] w-16 h-16 rounded-full bg-emerald-400/5 dark:bg-emerald-400/8 blur-lg"
          animate={{ y: [-8, 12, -8], rotate: [0, 180, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[30%] left-[20%] w-12 h-12"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full text-emerald-500/8 dark:text-emerald-500/12">
            <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="currentColor" />
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-[35%] right-[25%] w-8 h-8"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 24 24" className="w-full h-full text-teal-500/8 dark:text-teal-500/12">
            <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 12 12)" />
          </svg>
        </motion.div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Branding */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 mb-4 relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Shield className="h-8 w-8" />
            {/* Shimmer/glow effect on shield icon */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold mb-2">الوصول الإداري</h1>
          <p className="text-sm text-muted-foreground">هذه المنطقة مخصصة للمسؤولين فقط</p>
        </motion.div>

        {/* Login Card with animated gradient border */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          {/* Animated gradient border wrapper */}
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
                      autoComplete="email"
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
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 gap-2 h-11 shadow-md shadow-emerald-600/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98]"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        دخول لوحة التحكم
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>

              <div className="mt-4 pt-4 border-t text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  onClick={() => setShowLogin(false)}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                  العودة للموقع
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-xs text-muted-foreground/60">
            🔒 جميع محاولات الوصول مسجلة ومراقبة
          </p>
        </motion.div>
      </div>
    </div>
  );
}
