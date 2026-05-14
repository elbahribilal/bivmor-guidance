'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  HelpCircle,
  FileText,
  BookOpen,
  UserCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  ChevronLeft,
  X,
} from 'lucide-react';

// ============================================
// FAQ DATA
// ============================================

const faqCategories = [
  {
    id: 'general',
    title: 'أسئلة عامة',
    icon: HelpCircle,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    textColor: 'text-emerald-700 dark:text-emerald-400',
    items: [
      {
        q: 'ما هي منصة مباريات المغرب؟',
        a: 'منصة مباريات المغرب هي منصة إلكترونية شاملة تجمع جميع المباريات والconcurs والفرص التعليمية في المملكة المغربية في مكان واحد. نساعدك في العثور على المعلومات الصحيحة والمحدثة حول مواعيد التسجيل والشروط والوثائق المطلوبة.',
      },
      {
        q: 'هل المعلومات المعروضة رسمية؟',
        a: 'المعلومات المعروضة على المنصة هي لأغراض توجيهية فقط. نوصي دائماً بالتحقق من المصادر الرسمية للمؤسسات المعنية قبل اتخاذ أي إجراء. نوفر روابط رسمية لكل مباراة لتسهيل الوصول للمعلومات الأصلية.',
      },
      {
        q: 'هل استخدام المنصة مجاني؟',
        a: 'نعم، استخدام منصة مباريات المغرب مجاني تماماً. يمكنك البحث والتصفح والاشتراك في النشرة البريدية دون أي رسوم.',
      },
    ],
  },
  {
    id: 'registration',
    title: 'التسجيل في المباريات',
    icon: FileText,
    color: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-50 dark:bg-teal-950/30',
    textColor: 'text-teal-700 dark:text-teal-400',
    items: [
      {
        q: 'كيف أسجل في مباراة؟',
        a: 'لا يمكنك التسجيل مباشرة عبر منصتنا. نوفر لك رابط التسجيل الرسمي لكل مباراة. اضغط على زر "الرابط الرسمي" في صفحة المباراة للانتقال إلى موقع التسجيل الرسمي.',
      },
      {
        q: 'ما هي الوثائق المطلوبة عادة؟',
        a: 'تختلف الوثائق المطلوبة حسب المباراة، لكن بشكل عام تحتاج: شهادة البكالوريا أو ما يعادلها، كشف النقاط، صور شخصية، بطاقة التعريف الوطنية، ورسالة التحفيز. تحقق دائماً من شروط كل مباراة على حدة.',
      },
      {
        q: 'متى يبدأ التسجيل في المباريات؟',
        a: 'تختلف مواعيد التسجيل حسب المباراة والمؤسسة. عادة ما تبدأ مباريات المدارس الكبرى (EMI, ENSA, ENCG) في مايو-يوليو، ومباريات الوظيفة العمومية على مدار السنة. اشترك في النشرة البريدية لتلقي التنبيهات.',
      },
    ],
  },
  {
    id: 'preparation',
    title: 'التحضير للمباريات',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    textColor: 'text-amber-700 dark:text-amber-400',
    items: [
      {
        q: 'كيف أتحضر للمباراة؟',
        a: 'نصائح للتحضير: 1) ابدأ مبكراً - قبل 3 أشهر على الأقل 2) احصل على المناهج الرسمية والامتحانات السابقة 3) ضع جدول دراسي منتظم 4) تدرب على حل الامتحانات السابقة في ظروف حقيقية 5) ركز على المواد ذات المعامل الأعلى',
      },
      {
        q: 'هل توفرون دورات تحضيرية؟',
        a: 'حالياً لا نوفر دورات تحضيرية مباشرة، لكننا نعمل على إضافة هذه الخدمة مستقبلاً. في غضون ذلك، نوفر معلومات شاملة عن كل مباراة تساعدك في التحضير.',
      },
    ],
  },
  {
    id: 'account',
    title: 'حسابي في المنصة',
    icon: UserCircle,
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-50 dark:bg-violet-950/30',
    textColor: 'text-violet-700 dark:text-violet-400',
    items: [
      {
        q: 'كيف أنشئ حساباً؟',
        a: 'يمكنك تصفح المنصة دون حساب. للاستفادة من ميزات إضافية مثل حفظ المفضلة وتلقي التنبيهات، يمكنك إنشاء حساب مجاني. ميزة إنشاء الحساب ستكون متاحة قريباً.',
      },
      {
        q: 'كيف أشترك في النشرة البريدية؟',
        a: 'يمكنك الاشتراك من خلال حقل البريد الإلكتروني في الصفحة الرئيسية أو في تذييل الموقع. ستصلك تنبيهات بالمباريات الجديدة ومواعيد التسجيل.',
      },
    ],
  },
];

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// ============================================
// FAQ VIEW COMPONENT
// ============================================

export function FaqView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter FAQ items based on search and category
  const filteredCategories = useMemo(() => {
    let categories = faqCategories;

    // Filter by category
    if (activeCategory) {
      categories = categories.filter((c) => c.id === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      categories = categories
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.q.toLowerCase().includes(query) ||
              item.a.toLowerCase().includes(query)
          ),
        }))
        .filter((category) => category.items.length > 0);
    }

    return categories;
  }, [searchQuery, activeCategory]);

  // Total FAQ count
  const totalItems = faqCategories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );

  // Search result count
  const resultCount = filteredCategories.reduce(
    (acc, cat) => acc + cat.items.length,
    0
  );

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen" dir="rtl">
      {/* Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50/50 to-transparent dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-transparent">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-200/20 dark:bg-emerald-800/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-teal-200/20 dark:bg-teal-800/10 blur-3xl" />
        </div>

        <div className="glass-card-premium container mx-auto px-4 py-12 md:py-16 relative rounded-2xl m-2 md:m-4 lg:m-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto relative z-10"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-6 shadow-lg shadow-emerald-500/25 moroccan-corner"
            >
              <HelpCircle className="h-8 w-8" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              الأسئلة الشائعة
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mb-8">
              دليلك الشامل للاستفادة القصوى من المنصة
            </p>

            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث في الأسئلة الشائعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pr-12 pl-10 text-base rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 focus:ring-emerald-400/20 bg-white dark:bg-background shadow-sm"
                dir="rtl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Results indicator */}
            {isSearching && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-sm text-muted-foreground"
              >
                تم العثور على{' '}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {resultCount}
                </span>{' '}
                نتيجة من أصل {totalItems} سؤال
              </motion.p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Category Pills */}
      <section className="container mx-auto px-4 -mt-2 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={activeCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full gap-1.5 filter-pill-glow ${
              activeCategory === null
                ? 'pill-gradient-active text-white'
                : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            الكل
            <Badge
              variant="secondary"
              className="mr-1 h-5 px-1.5 text-[10px] bg-white/20 text-inherit"
            >
              {totalItems}
            </Badge>
          </Button>
          {faqCategories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() =>
                setActiveCategory(
                  activeCategory === category.id ? null : category.id
                )
              }
              className={`shrink-0 rounded-full gap-1.5 filter-pill-glow ${
                activeCategory === category.id
                  ? 'pill-gradient-active text-white'
                  : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              <category.icon className="h-3.5 w-3.5" />
              {category.title}
              <Badge
                variant="secondary"
                className="mr-1 h-5 px-1.5 text-[10px] bg-white/20 text-inherit"
              >
                {category.items.length}
              </Badge>
            </Button>
          ))}
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="container mx-auto px-4 pb-8">
        <AnimatePresence mode="wait">
          {filteredCategories.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                لم نعثر على أسئلة تطابق بحثك. جرّب كلمات مختلفة أو تصفح
                جميع الفئات.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory(null);
                }}
                className="gap-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
              >
                <X className="h-4 w-4" />
                مسح البحث
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory || 'all'}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8 max-w-3xl mx-auto"
            >
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  variants={categoryVariants}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} text-white shadow-md`}
                    >
                      <category.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{category.title}</h2>
                      <p className="text-xs text-muted-foreground">
                        {category.items.length} أسئلة
                      </p>
                    </div>
                  </div>

                  {/* Accordion FAQ Items */}
                  <Card className={`overflow-hidden shadow-sm hover:shadow-md transition-shadow faq-border-${category.id}`}>
                    <CardContent className="p-0">
                      <Accordion
                        type="multiple"
                        className="w-full"
                        dir="rtl"
                      >
                        {category.items.map((item, itemIndex) => (
                          <motion.div
                            key={`${category.id}-${itemIndex}`}
                            variants={itemVariants}
                          >
                            <AccordionItem
                              value={`${category.id}-${itemIndex}`}
                              className="border-b last:border-b-0 border-emerald-50 dark:border-emerald-900/30"
                            >
                              <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors text-right">
                                <div className="flex items-start gap-3 text-right">
                                  <span
                                    className={`shrink-0 flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-gradient-to-br ${category.color} text-white mt-0.5`}
                                  >
                                    {itemIndex + 1}
                                  </span>
                                  <span className="font-semibold text-sm md:text-base leading-relaxed">
                                    {item.q}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-5 pb-4">
                                <div className="mr-10 pr-4 border-r-2 border-emerald-200 dark:border-emerald-800 faq-quote">
                                  <p className="text-muted-foreground text-sm leading-7">
                                    {item.a}
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </motion.div>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Contact CTA Section */}
      <section className="container mx-auto px-4 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Card className="moroccan-pattern max-w-3xl mx-auto overflow-hidden border-emerald-200 dark:border-emerald-800 bg-gradient-to-b from-emerald-50/80 via-teal-50/50 to-transparent dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-transparent">
            <CardContent className="p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4 shadow-lg shadow-emerald-500/20">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  لم تجد إجابتك؟
                </h3>
                <p className="text-muted-foreground text-sm">
                  فريقنا جاهز لمساعدتك في أي استفسار. تواصل معنا وسنرد عليك في أقرب وقت.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Email */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/60 dark:bg-background/60 border border-emerald-100 dark:border-emerald-900/50"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      البريد الإلكتروني
                    </p>
                    <p className="text-sm font-semibold">
                      contact@moubarayat.ma
                    </p>
                  </div>
                </motion.div>

                {/* Phone */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/60 dark:bg-background/60 border border-emerald-100 dark:border-emerald-900/50"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      الهاتف
                    </p>
                    <p className="text-sm font-semibold" dir="ltr">
                      +212 5XX-XXXXXX
                    </p>
                  </div>
                </motion.div>

                {/* Response time */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/60 dark:bg-background/60 border border-emerald-100 dark:border-emerald-900/50"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                    <ChevronLeft className="h-5 w-5 rotate-180" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      وقت الاستجابة
                    </p>
                    <p className="text-sm font-semibold">خلال 24 ساعة</p>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>
    </div>
  );
}
