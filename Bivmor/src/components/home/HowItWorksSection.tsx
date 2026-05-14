'use client';

import { motion } from 'framer-motion';
import { useNavigationStore } from '@/store/navigation';
import { Search, Filter, Bell, ArrowLeft, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '١',
    icon: <Search className="h-7 w-7" />,
    title: 'ابحث عن المباراة',
    description: 'ابحث من بين عشرات المباريات المتاحة في مختلف التخصصات والمدن المغربية',
    subtext: 'بحث ذكي وسريع',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    number: '٢',
    icon: <Filter className="h-7 w-7" />,
    title: 'صفّي واختر',
    description: 'استخدم الفلاتر المتقدمة لاختيار المباراة المناسبة لمستواك ومدينتك وتخصصك',
    subtext: 'فلاتر متعددة ودقيقة',
    color: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30',
    textColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-800',
  },
  {
    number: '٣',
    icon: <Bell className="h-7 w-7" />,
    title: 'تابع وسجّل',
    description: 'تتبع المواعيد النهائية وسجّل في الوقت المناسب عبر الروابط الرسمية',
    subtext: 'تنبيهات فورية بالمواعيد',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export function HowItWorksSection() {
  const { setView } = useNavigationStore();

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold"
          >
            كيف تعمل المنصة؟
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            ثلاث خطوات بسيطة للعثور على المباراة المناسبة والتسجيل فيها
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative"
        >
          {/* Connecting line with dots (desktop only) */}
          <div className="hidden md:flex absolute top-20 left-[20%] right-[20%] items-center z-0">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-300 via-teal-300 to-amber-300 dark:from-emerald-700 dark:via-teal-700 dark:to-amber-700 rounded-full" />
            <div className="step-connector-dot mx-1" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-teal-300 to-amber-300 dark:from-teal-700 dark:to-amber-700 rounded-full" />
            <div className="step-connector-dot mx-1" />
            <div className="flex-1 h-0.5 bg-gradient-to-r from-amber-300 to-orange-300 dark:from-amber-700 dark:to-orange-700 rounded-full" />
          </div>

          {/* Mobile connecting dots (vertical) */}
          <div className="md:hidden absolute top-[7.5rem] bottom-[12rem] right-1/2 w-0.5 bg-gradient-to-b from-emerald-300 via-teal-300 to-amber-300 dark:from-emerald-700 dark:via-teal-700 dark:to-amber-700 rounded-full z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              variants={stepVariants}
              whileHover={{ scale: 1.04, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center text-center space-y-4 relative z-10"
            >
              {/* Step number circle with gradient */}
              <div className="relative">
                <div className={`flex h-18 w-18 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg shadow-black/10`}>
                  {step.icon}
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-md border-2 border-white dark:border-gray-800">
                    <span className={`text-sm font-bold ${step.textColor}`}>{step.number}</span>
                  </span>
                </div>
                {/* Glow ring behind */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-20 blur-xl -z-10 scale-150`} />
              </div>

              <div className="space-y-2 max-w-xs">
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                {/* Subtext badge */}
                <span className={`inline-flex items-center gap-1 text-xs font-medium ${step.textColor} ${step.bgColor} px-2.5 py-1 rounded-full border ${step.borderColor}`}>
                  <ChevronLeft className="h-3 w-3" />
                  {step.subtext}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="flex justify-center mt-12"
        >
          <Button
            onClick={() => setView('competitions')}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 gap-2 rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 active:scale-95"
          >
            ابدأ البحث الآن
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
