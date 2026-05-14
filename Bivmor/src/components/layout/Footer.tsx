'use client';

import { useState } from 'react';
import { useNavigationStore } from '@/store/navigation';
import { GraduationCap, Trophy, BookOpen, Mail, Heart, MapPin, Phone, BarChart3, Star, Shield, HelpCircle, FileText, ArrowUp, Send, CheckCircle2, Globe, Calendar, GitCompare, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Footer() {
  const { setView } = useNavigationStore();
  const [footerEmail, setFooterEmail] = useState('');
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  const handleFooterSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (footerEmail.trim()) {
      setFooterSubscribed(true);
      setFooterEmail('');
      setTimeout(() => setFooterSubscribed(false), 3000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto bg-muted/30">
      {/* Moroccan Zellige pattern strip */}
      <div className="zellige-strip" />

      {/* Gradient top border */}
      <div className="footer-gradient-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* About */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-md">
                  م
                </div>
                <div className="flex flex-col">
                  <span className="font-bold leading-tight">مباريات المغرب</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">منصة تعليمية شاملة</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                منصة مركزية شاملة لجميع المباريات والمدارس والفرص التعليمية في المغرب.
                نجمع لك كل المعلومات في مكان واحد بطريقة منظمة وسهلة البحث.
              </p>

              {/* Social Media Icons with hover ring animation */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-muted-foreground">تابعنا</span>
                <div className="flex items-center gap-2.5">
                  <motion.a href="#" className="social-ring-hover flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 shadow-sm" aria-label="Facebook" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </motion.a>
                  <motion.a href="#" className="social-ring-hover flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 shadow-sm" aria-label="Twitter" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </motion.a>
                  <motion.a href="#" className="social-ring-hover flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 shadow-sm" aria-label="Instagram" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </motion.a>
                  <motion.a href="#" className="social-ring-hover flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 shadow-sm" aria-label="YouTube" whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </motion.a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">تصفح المنصة</h4>
              <nav className="flex flex-col gap-2.5">
                <motion.button
                  onClick={() => setView('competitions')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <Trophy className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  المباريات
                </motion.button>
                <motion.button
                  onClick={() => setView('schools')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <GraduationCap className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  المدارس والمعاهد
                </motion.button>
                <motion.button
                  onClick={() => setView('categories')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  التصنيفات
                </motion.button>
                <motion.button
                  onClick={() => setView('stats')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <BarChart3 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  الإحصائيات
                </motion.button>
                <motion.button
                  onClick={() => setView('favorites')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <Star className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  المفضلة
                </motion.button>
                <motion.button
                  onClick={() => setView('calendar')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <Calendar className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  التقويم
                </motion.button>
                <motion.button
                  onClick={() => setView('comparison')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-pink-600 dark:hover:text-pink-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <GitCompare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  المقارنة
                </motion.button>
              </nav>
            </div>

            {/* Legal & Help */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">المساعدة والقانون</h4>
              <nav className="flex flex-col gap-2.5">
                <motion.button
                  onClick={() => setView('faq')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <HelpCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  الأسئلة الشائعة
                </motion.button>
                <motion.button className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors text-right group" whileHover={{ x: -4 }}>
                  <Shield className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  سياسة الخصوصية
                </motion.button>
                <motion.button className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors text-right group" whileHover={{ x: -4 }}>
                  <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  شروط الاستخدام
                </motion.button>
                <motion.button
                  onClick={() => setView('reminders')}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors text-right group"
                  whileHover={{ x: -4 }}
                >
                  <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  التذكيرات
                </motion.button>
              </nav>

              {/* App download badges */}
              <div className="pt-3 space-y-2">
                <span className="text-xs text-muted-foreground">حمّل التطبيق</span>
                <div className="flex flex-col gap-2">
                  {/* Google Play badge */}
                  <motion.button
                    className="flex items-center gap-2.5 bg-foreground/5 dark:bg-foreground/10 hover:bg-foreground/10 dark:hover:bg-foreground/15 rounded-lg px-3 py-2 transition-colors group border border-border/50"
                    whileHover={{ scale: 1.02, x: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                    </svg>
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] text-muted-foreground leading-tight">GET IT ON</span>
                      <span className="text-xs font-semibold leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Google Play</span>
                    </div>
                  </motion.button>
                  {/* App Store badge */}
                  <motion.button
                    className="flex items-center gap-2.5 bg-foreground/5 dark:bg-foreground/10 hover:bg-foreground/10 dark:hover:bg-foreground/15 rounded-lg px-3 py-2 transition-colors group border border-border/50"
                    whileHover={{ scale: 1.02, x: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 16.56 2.93 11.3 4.7 7.72C5.57 5.94 7.36 4.86 9.28 4.84C10.56 4.82 11.78 5.72 12.58 5.72C13.38 5.72 14.86 4.62 16.42 4.8C17.09 4.83 18.89 5.08 20.04 6.78C19.92 6.86 17.48 8.28 17.51 11.26C17.54 14.82 20.53 15.97 20.56 15.98C20.53 16.05 20.08 17.61 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                    </svg>
                    <div className="flex flex-col items-start">
                      <span className="text-[9px] text-muted-foreground leading-tight">Download on the</span>
                      <span className="text-xs font-semibold leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">App Store</span>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Contact + Newsletter with animated border */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">تواصل معنا</h4>
              <div className="flex flex-col gap-3">
                <motion.a
                  href="mailto:contact@mbarayat.ma"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  whileHover={{ x: -3 }}
                >
                  <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  contact@mbarayat.ma
                </motion.a>
                <motion.div
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  whileHover={{ x: -3 }}
                >
                  <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span dir="ltr">+212 5XX-XXXXXX</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  whileHover={{ x: -3 }}
                >
                  <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>الرباط، المملكة المغربية</span>
                </motion.div>
                <motion.a
                  href="#"
                  className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  whileHover={{ x: -3 }}
                >
                  <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  www.mbarayat.ma
                </motion.a>
              </div>

              {/* Newsletter mini-form with animated border */}
              <div className="pt-2">
                <span className="text-xs text-muted-foreground mb-2 block">اشترك في النشرة البريدية</span>
                <div className="newsletter-animated-border">
                  <form onSubmit={handleFooterSubscribe} className="flex gap-2 bg-background rounded-[0.7rem] p-1.5">
                    <div className="relative flex-1">
                      <Mail className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                      <input
                        type="email"
                        value={footerEmail}
                        onChange={(e) => setFooterEmail(e.target.value)}
                        placeholder="بريدك الإلكتروني"
                        required
                        className="w-full bg-transparent border-0 rounded-md pr-8 pl-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-1 focus:ring-emerald-400/30 transition-all"
                      />
                    </div>
                    <motion.button
                      type="submit"
                      className="flex h-auto items-center justify-center rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 text-white transition-all duration-200 active:scale-95 shrink-0"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Send className="h-3.5 w-3.5" />
                    </motion.button>
                  </form>
                </div>
                <AnimatePresence>
                  {footerSubscribed && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-1.5"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      تم الاشتراك بنجاح!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                جميع المعلومات معروضة لأغراض توجيهية فقط.
                يرجى الرجوع للمصادر الرسمية للتأكد.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} مباريات المغرب — جميع الحقوق محفوظة
              </p>
              <div className="flex items-center gap-4">
                {/* Back to top */}
                <motion.button
                  onClick={scrollToTop}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                  whileHover={{ y: -2 }}
                >
                  <ArrowUp className="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform" />
                  العودة للأعلى
                </motion.button>

                {/* Made in Morocco badge with pride styling */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-l from-emerald-50 to-red-50 dark:from-emerald-900/20 dark:to-red-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                  <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                  <span className="text-xs font-medium text-foreground">صُنع في المغرب</span>
                  <span className="text-sm">🇲🇦</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
