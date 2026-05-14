'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, Twitter, Facebook, Instagram, Youtube, Send, Users, CheckCircle2 } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <section className="newsletter-gradient newsletter-pattern text-white py-16 md:py-20">
      {/* Floating icons */}
      <div className="newsletter-float-icon" aria-hidden="true">🎓</div>
      <div className="newsletter-float-icon" aria-hidden="true">🏆</div>
      <div className="newsletter-float-icon" aria-hidden="true">📚</div>
      <div className="newsletter-float-icon" aria-hidden="true">⭐</div>
      <div className="newsletter-float-icon" aria-hidden="true">🎯</div>
      <div className="newsletter-float-icon" aria-hidden="true">📖</div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-2xl text-center space-y-6">
          {/* Title */}
          <div className="space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold">لا تفوّت أي مباراة</h2>
            <p className="text-white/80 text-sm md:text-base">تابعنا ليصلك كل جديد عن المباريات والفرص التعليمية في المغرب</p>
          </div>

          {/* Subscriber counter */}
          <div className="flex items-center justify-center gap-2">
            <Users className="h-4 w-4 text-white/60" />
            <span className="text-sm text-white/70">انضم لـ </span>
            <span className="text-sm font-bold text-white">+1,000</span>
            <span className="text-sm text-white/70">مشترك</span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                required
                className="newsletter-input w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg pr-10 pl-4 py-3 text-white placeholder:text-white/40 outline-none text-sm transition-all duration-300"
              />
            </div>
            <Button
              type="submit"
              className="bg-white text-emerald-700 hover:bg-white/90 rounded-lg px-6 gap-2 font-semibold shrink-0 transition-all duration-200 active:scale-95"
            >
              <Send className="h-4 w-4" />
              اشتراك
            </Button>
          </form>

          {/* Success message with framer-motion */}
          <AnimatePresence>
            {subscribed && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex items-center justify-center gap-2"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-200" />
                </motion.div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm font-medium text-emerald-200"
                >
                  تم الاشتراك بنجاح! شكراً لك.
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Media Icons */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className="text-xs text-white/50">تابعنا على</span>
            <div className="flex items-center gap-2">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 transition-all duration-200" aria-label="Twitter">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 transition-all duration-200" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 transition-all duration-200" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/25 hover:scale-110 transition-all duration-200" aria-label="Youtube">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
