'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { Star, Quote, Users, GraduationCap, ThumbsUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    id: 1,
    name: 'أمين بوزيدي',
    role: 'طالب في EMI',
    school: 'المدرسة المحمدية للمهندسين',
    quote: 'بفضل المعلومات المحدثة على المنصة، تمكنت من التقديم في الوقت المناسب والقبول في EMI. شكراً لكم!',
    rating: 5,
    avatar: 'أ',
    color: 'emerald',
  },
  {
    id: 2,
    name: 'فاطمة الزهراء العلوي',
    role: 'طبيبة مقيمة',
    school: 'كلية الطب والصيدلة بالرباط',
    quote: 'المنصة ساعدتني في متابعة مواعيد مباريات الإقامة الطبية. التنبيهات كانت مفيدة جداً حتى لا أفوت أي آجل.',
    rating: 5,
    avatar: 'ف',
    color: 'teal',
  },
  {
    id: 3,
    name: 'يوسف المنصوري',
    role: 'طالب في ENA',
    school: 'المدرسة الوطنية للإدارة',
    quote: 'مصدر ممتاز للمعلومات حول المباريات الإدارية. سهّلت عليّ كثيراً البحث عن الشروط والمواعيد.',
    rating: 5,
    avatar: 'ي',
    color: 'violet',
  },
  {
    id: 4,
    name: 'سارة بنعبدالله',
    role: 'طالبة في ISCAE',
    school: 'المعهد العالي للتجارة وإدارة المقاولات',
    quote: 'أنصح كل طالب مغربي باستعمال هذه المنصة. المعلومات واضحة ومنظمة وسهلة البحث.',
    rating: 4,
    avatar: 'س',
    color: 'amber',
  },
  {
    id: 5,
    name: 'محمد الرامي',
    role: 'موظف عمومي',
    school: 'وزارة الاقتصاد والمالية',
    quote: 'حصلت على وظيفتي في الوظيفة العمومية بعد التحضير الجيد بفضل المعلومات المتوفرة على المنصة.',
    rating: 5,
    avatar: 'م',
    color: 'rose',
  },
  {
    id: 6,
    name: 'خديجة العمراني',
    role: 'طالبة في ENSA',
    school: 'المدرسة الوطنية للعلوم التطبيقية',
    quote: 'كنت أبحث عن مباريات الهندسة لشهور. هذه المنصة جمعت لي كل المعلومات في مكان واحد!',
    rating: 5,
    avatar: 'خ',
    color: 'cyan',
  },
];

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500 to-teal-600',
  teal: 'from-teal-500 to-cyan-600',
  violet: 'from-violet-500 to-purple-600',
  amber: 'from-amber-500 to-orange-600',
  rose: 'from-rose-500 to-pink-600',
  cyan: 'from-cyan-500 to-blue-600',
};

const borderColorMap: Record<string, string> = {
  emerald: 'from-emerald-400 via-teal-400 to-emerald-400',
  teal: 'from-teal-400 via-cyan-400 to-teal-400',
  violet: 'from-violet-400 via-purple-400 to-violet-400',
  amber: 'from-amber-400 via-orange-400 to-amber-400',
  rose: 'from-rose-400 via-pink-400 to-rose-400',
  cyan: 'from-cyan-400 via-blue-400 to-cyan-400',
};

const glowColorMap: Record<string, string> = {
  emerald: 'shadow-emerald-500/10',
  teal: 'shadow-teal-500/10',
  violet: 'shadow-violet-500/10',
  amber: 'shadow-amber-500/10',
  rose: 'shadow-rose-500/10',
  cyan: 'shadow-cyan-500/10',
};

const stats = [
  { icon: Users, value: '+500', label: 'طالب ناجح', color: 'text-emerald-600 dark:text-emerald-400' },
  { icon: GraduationCap, value: '+22', label: 'مدرسة', color: 'text-teal-600 dark:text-teal-400' },
  { icon: ThumbsUp, value: '98%', label: 'رضا', color: 'text-violet-600 dark:text-violet-400' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

export function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    direction: 'rtl',
    slidesToScroll: 1,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    emblaApi.on('init', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('init', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-play with pause on hover
  useEffect(() => {
    if (!emblaApi || isHovered) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi, isHovered]);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background via-emerald-50/30 to-background dark:via-emerald-950/10 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-emerald-100/40 dark:bg-emerald-900/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-teal-100/40 dark:bg-teal-900/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-violet-50/20 dark:bg-violet-900/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section heading */}
        <div className="text-center mb-14 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Quote className="h-4 w-4" />
              شهادات
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 dark:from-emerald-400 dark:via-teal-400 dark:to-emerald-500 bg-clip-text text-transparent">
              قصص نجاح
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            طلاب ومهنيون حققوا أهدافهم بفضل المنصة
          </motion.p>
        </div>

        {/* Carousel */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex-[0_0_100%] min-w-0 px-3 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
                >
                  <motion.div variants={cardVariants}>
                    <Card className="group relative overflow-hidden rounded-2xl border-0 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                      {/* Gradient border top */}
                      <div
                        className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${borderColorMap[testimonial.color]}`}
                      />

                      {/* Hover glow effect */}
                      <div
                        className={`absolute -inset-1 rounded-2xl bg-gradient-to-r ${borderColorMap[testimonial.color]} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}
                      />

                      <CardContent className="p-6 space-y-4">
                        {/* Decorative quote icon */}
                        <div className="absolute top-4 left-4 text-5xl font-serif leading-none opacity-[0.07] select-none">
                          &ldquo;
                        </div>

                        {/* Avatar + Name row */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[testimonial.color]} text-white font-bold text-lg shadow-lg ${glowColorMap[testimonial.color]}`}
                          >
                            {testimonial.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm truncate">{testimonial.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{testimonial.role}</p>
                          </div>
                        </div>

                        {/* Star rating */}
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < testimonial.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Quote text */}
                        <p className="text-sm leading-relaxed text-muted-foreground italic relative">
                          {testimonial.quote}
                        </p>

                        {/* School info */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                          <GraduationCap className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{testimonial.school}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Navigation dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`transition-all duration-300 rounded-full ${
                index === selectedIndex
                  ? 'w-8 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm shadow-emerald-500/30'
                  : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-emerald-300 dark:hover:bg-emerald-700'
              }`}
              aria-label={`الانتقال إلى الشهادة ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-14"
        >
          <div className="mx-auto max-w-2xl rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/50 shadow-lg p-6">
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <span className={`text-xl md:text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
