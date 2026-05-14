'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  BarChart3,
  Rocket,
  ChevronLeft,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/store/onboarding';

const steps = [
  {
    id: 0,
    icon: Sparkles,
    title: 'مرحباً بك',
    subtitle: 'في منصة المباريات المغربية',
    description:
      'اكتشف عالماً من الفرص التعليمية والمهنية. منصتك الشاملة لمتابعة المباريات والمدارس والفرص الدراسية في المغرب.',
    gradient: 'from-emerald-500 to-teal-500',
    bgPattern: 'emerald',
    decorations: ['🕌', '🇲🇦', '✨'],
  },
  {
    id: 1,
    icon: Search,
    title: 'ابحث عن المباريات',
    subtitle: 'بحث ذكي ومتقدم',
    description:
      'ابحث عن المباريات والمدارس بسهولة باستخدام فلاتر متعددة: حسب المدينة، التصنيف، المستوى الدراسي، والمزيد. وجّه بحثك بدقة نحو ما يناسبك.',
    gradient: 'from-teal-500 to-emerald-500',
    bgPattern: 'teal',
    decorations: ['🔍', '🎯', '📍'],
  },
  {
    id: 2,
    icon: BarChart3,
    title: 'تتبع تقدمك',
    subtitle: 'نظرة شاملة على مسارك',
    description:
      'أضف المباريات إلى المفضلة، عيّن تذكيرات بالمواعيد، وتابع حالة طلباتك. كل ما تحتاجه في مكان واحد لتنظيم رحلتك التعليمية.',
    gradient: 'from-emerald-600 to-teal-400',
    bgPattern: 'emerald',
    decorations: ['⭐', '🔔', '📋'],
  },
  {
    id: 3,
    icon: Rocket,
    title: 'ابدأ الآن',
    subtitle: 'انطلق في رحلتك',
    description:
      'أنت جاهز! استكشف المباريات المفتوحة، اكتشف المدارس، ولا تفوّت أي فرصة. منصتك تبدأ من هنا.',
    gradient: 'from-teal-600 to-emerald-400',
    bgPattern: 'teal',
    decorations: ['🚀', '🌟', '💪'],
  },
];

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 15,
      delay: 0.15,
    },
  },
  exit: {
    scale: 0,
    rotate: 180,
    transition: { duration: 0.2 },
  },
};

const decorVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3 + i * 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

export function WelcomeGuide() {
  const { hasSeenWelcome, setHasSeenWelcome } = useOnboardingStore();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  // Use useSyncExternalStore to detect client-side hydration without setState in effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setHasSeenWelcome(true);
    setOpen(false);
  };

  const handleSkip = () => {
    setHasSeenWelcome(true);
    setOpen(false);
  };

  if (!mounted) return null;

  const step = steps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        handleSkip();
      }
    }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg p-0 overflow-hidden border-0 gap-0 rtl"
        dir="rtl"
      >
        <DialogTitle className="sr-only">دليل الترحيب</DialogTitle>
        <DialogDescription className="sr-only">
          دليل الترحيب بمنصة المباريات المغربية - تعرف على ميزات المنصة
        </DialogDescription>

        {/* Moroccan Geometric Border - Top */}
        <div className="h-1.5 animated-gradient-border" />

        {/* Content Area */}
        <div className="relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 moroccan-pattern opacity-50" />

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-3 left-3 z-20 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
            aria-label="تخطي"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Decorative Floating Emojis */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {step.decorations.map((emoji, i) => (
              <motion.span
                key={`${currentStep}-${i}`}
                custom={i}
                variants={decorVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute text-2xl"
                style={{
                  top: `${20 + i * 25}%`,
                  right: `${8 + i * 15}%`,
                  opacity: 0.3,
                }}
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          {/* Step Content */}
          <div className="relative z-10 px-6 pt-8 pb-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                {/* Icon Circle */}
                <motion.div
                  variants={iconVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className={`relative mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} shadow-lg`}
                >
                  <Icon className="h-10 w-10 text-white" />
                  {/* Glow Effect */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} blur-xl opacity-30 -z-10 scale-125`}
                  />
                </motion.div>

                {/* Title */}
                <h2 className="text-2xl font-bold mb-1">{step.title}</h2>
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-3">
                  {step.subtitle}
                </p>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 py-3">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentStep ? 1 : -1);
                setCurrentStep(index);
              }}
              className="relative focus:outline-none"
              aria-label={`الانتقال إلى الخطوة ${index + 1}`}
            >
              <motion.div
                className="rounded-full"
                animate={{
                  width: index === currentStep ? 24 : 8,
                  height: 8,
                  backgroundColor:
                    index === currentStep
                      ? 'oklch(0.627 0.194 149.214)'
                      : index < currentStep
                        ? 'oklch(0.627 0.194 149.214 / 40%)'
                        : 'oklch(0.7 0 0 / 30%)',
                }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            </button>
          ))}
        </div>

        {/* Moroccan Geometric Border - Middle Divider */}
        <div className="h-px mx-6 bg-gradient-to-l from-transparent via-emerald-500/30 to-transparent" />

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between px-6 py-4">
          {/* Previous Button */}
          <div className="w-20">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                className="text-muted-foreground hover:text-foreground gap-1"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
                السابق
              </Button>
            )}
          </div>

          {/* Step Counter */}
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentStep + 1} / {steps.length}
          </span>

          {/* Next / Complete Button */}
          <div className="w-28 flex justify-end">
            {isLastStep ? (
              <Button
                onClick={handleComplete}
                size="sm"
                className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 gap-1.5"
              >
                <Rocket className="h-4 w-4" />
                ابدأ الاستكشاف
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                size="sm"
                className="bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 gap-1.5"
              >
                التالي
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Moroccan Geometric Border - Bottom */}
        <div className="h-1.5 animated-gradient-border" />
      </DialogContent>
    </Dialog>
  );
}
