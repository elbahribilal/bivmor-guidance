'use client';

import { motion } from 'framer-motion';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, FileCheck, Target, ArrowLeft, BookOpen, AlertTriangle, Users } from 'lucide-react';

const tips = [
  {
    id: 1,
    icon: <Clock className="h-5 w-5" />,
    title: 'ابدأ مبكراً',
    description: 'ابدأ التحضير قبل 3 أشهر على الأقل من موعد المباراة. الوقت الكافي هو مفتاح النجاح.',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    bgLight: 'bg-emerald-50',
    bgDark: 'dark:bg-emerald-900/20',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-800/30',
  },
  {
    id: 2,
    icon: <FileCheck className="h-5 w-5" />,
    title: 'تحقق من الوثائق',
    description: 'جهّز جميع الوثائق المطلوبة مسبقاً. أي وثيقة ناقصة قد تؤدي إلى رفض ملفك.',
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-600',
    bgLight: 'bg-teal-50',
    bgDark: 'dark:bg-teal-900/20',
    textColor: 'text-teal-600 dark:text-teal-400',
    borderColor: 'border-teal-200 dark:border-teal-800/30',
  },
  {
    id: 3,
    icon: <Target className="h-5 w-5" />,
    title: 'تدرب على الامتحانات السابقة',
    description: 'حل امتحانات السنوات الماضية يساعدك على فهم طريقة الأسئلة وإدارة الوقت.',
    color: 'violet',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50',
    bgDark: 'dark:bg-violet-900/20',
    textColor: 'text-violet-600 dark:text-violet-400',
    borderColor: 'border-violet-200 dark:border-violet-800/30',
  },
  {
    id: 4,
    icon: <AlertTriangle className="h-5 w-5" />,
    title: 'راقب الآجال',
    description: 'لا تنتظر آخر لحظة. سجّل مبكراً وتأكد من مواعيد التسجيل والامتحانات.',
    color: 'amber',
    gradient: 'from-amber-500 to-orange-600',
    bgLight: 'bg-amber-50',
    bgDark: 'dark:bg-amber-900/20',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-200 dark:border-amber-800/30',
  },
  {
    id: 5,
    icon: <BookOpen className="h-5 w-5" />,
    title: 'ركز على المواد الأساسية',
    description: 'حدد المواد ذات المعامل الأعلى وخصص لها وقتاً أكبر في التحضير.',
    color: 'rose',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: 'bg-rose-50',
    bgDark: 'dark:bg-rose-900/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    borderColor: 'border-rose-200 dark:border-rose-800/30',
  },
  {
    id: 6,
    icon: <Users className="h-5 w-5" />,
    title: 'تحقق من المصادر الرسمية',
    description: 'استعمل المنصة كدليل، لكن تحقق دائماً من المعلومات من المصادر الرسمية للمؤسسة.',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-600',
    bgLight: 'bg-cyan-50',
    bgDark: 'dark:bg-cyan-900/20',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-200 dark:border-cyan-800/30',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const tipVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function TipsSection() {
  const { setView } = useNavigationStore();

  return (
    <section className="py-16 md:py-20 section-pattern">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 space-y-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-400"
          >
            <Lightbulb className="h-4 w-4" />
            نصائح مهمة
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold"
          >
            نصائح <span className="gradient-text">للنجاح</span> في المباريات
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            اتبع هذه النصائح المجربة لزيادة فرصك في القبول
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {tips.map((tip) => (
            <motion.div key={tip.id} variants={tipVariants}>
              <Card className={`tip-card-glow h-full border ${tip.borderColor} overflow-hidden group`}>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tip.gradient} text-white shadow-sm`}>
                      {tip.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tip.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex justify-center mt-10"
        >
          <Button
            onClick={() => setView('faq')}
            variant="outline"
            size="lg"
            className="gap-2 rounded-xl border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
          >
            المزيد من النصائح والإرشادات
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
