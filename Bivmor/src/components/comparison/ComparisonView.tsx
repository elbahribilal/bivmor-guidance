'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { competitionsApi, schoolsApi } from '@/lib/api';
import { useComparisonStore } from '@/store/comparison';
import type { Competition, School, CompetitionStatus, SchoolType } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  GitCompare,
  Trophy,
  GraduationCap,
  X,
  Plus,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  Building,
  Tag,
  BarChart3,
  Globe,
  Mail,
  Phone,
  FileText,
  ListChecks,
  Link2,
  Search,
  ArrowUpDown,
} from 'lucide-react';

// ============================================
// STATUS & TYPE HELPERS
// ============================================

const statusConfig: Record<CompetitionStatus, { label: string; className: string }> = {
  OPEN: { label: 'مفتوحة', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  CLOSED: { label: 'مغلقة', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
  EXPIRED: { label: 'منتهية', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
  UPCOMING: { label: 'قادمة', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
};

const schoolTypeConfig: Record<SchoolType, { label: string; className: string }> = {
  PUBLIC: { label: 'عمومية', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
  PRIVATE: { label: 'خصوصية', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
  SEMI_PRIVATE: { label: 'شبه خصوصية', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 border-teal-200 dark:border-teal-800' },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('ar-MA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ============================================
// COMPARISON ROW TYPE
// ============================================

interface ComparisonRowDef {
  label: string;
  icon: React.ReactNode;
  getValues: (items: Competition[] | School[]) => React.ReactNode[];
}

// ============================================
// COMPARISON TABLE ROW COMPONENT
// ============================================

interface ComparisonRowProps {
  row: ComparisonRowDef;
  items: { id: string }[];
}

function ComparisonRow({ row, items }: ComparisonRowProps) {
  const values = row.getValues(items);
  return (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4 text-sm font-medium text-muted-foreground whitespace-nowrap w-40 min-w-40">
        <div className="flex items-center gap-2">
          {row.icon}
          <span>{row.label}</span>
        </div>
      </td>
      {items.map((item, i) => (
        <td key={item.id} className="py-3 px-4 text-sm">
          {values[i] ?? <span className="text-muted-foreground">—</span>}
        </td>
      ))}
    </tr>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative mb-6">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center justify-center">
          <GitCompare className="h-12 w-12 text-emerald-400 dark:text-emerald-500" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center">
          <Plus className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">قارن بين المباريات أو المدارس</h3>
      <p className="text-muted-foreground text-center max-w-md leading-relaxed">
        اختر ما بين 2 إلى 4 عناصر للمقارنة جنباً إلى جنب. يمكنك مقارنة المباريات أو المدارس لاتخاذ القرار الأنسب.
      </p>
      <div className="flex items-center gap-4 mt-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-emerald-500" />
          <span>مباريات</span>
        </div>
        <span>أو</span>
        <div className="flex items-center gap-1.5">
          <GraduationCap className="h-4 w-4 text-teal-500" />
          <span>مدارس</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// ITEM SELECTOR COMPONENT
// ============================================

interface ItemSelectorProps {
  compareType: 'competition' | 'school';
  selectedIds: string[];
  onSelect: (id: string) => void;
}

function ItemSelector({ compareType, selectedIds, onSelect }: ItemSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: competitionsData } = useQuery({
    queryKey: ['competitions-list-comparison'],
    queryFn: () => competitionsApi.list({ limit: 100 }),
    enabled: compareType === 'competition',
  });

  const { data: schoolsData } = useQuery({
    queryKey: ['schools-list-comparison'],
    queryFn: () => schoolsApi.list({ limit: 100 }),
    enabled: compareType === 'school',
  });

  const items = useMemo(() => {
    if (compareType === 'competition') {
      return (competitionsData?.data ?? []).filter((c) => !selectedIds.includes(c.id));
    }
    return (schoolsData?.data ?? []).filter((s) => !selectedIds.includes(s.id));
  }, [compareType, competitionsData, schoolsData, selectedIds]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items.slice(0, 20);
    const q = search.toLowerCase();
    return items
      .filter((item) => {
        const title = 'title' in item ? item.title : (item as School).name;
        return title.toLowerCase().includes(q);
      })
      .slice(0, 20);
  }, [items, search]);

  const isFull = selectedIds.length >= 4;

  return (
    <Popover open={open && !isFull} onOpenChange={(v) => !isFull && setOpen(v)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-dashed border-emerald-300 dark:border-emerald-700 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-all"
          disabled={isFull}
        >
          <Plus className="h-4 w-4" />
          إضافة عنصر للمقارنة
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="ابحث..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>لم يتم العثور على نتائج</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => {
                const title = 'title' in item ? item.title : (item as School).name;
                const subtitle =
                  compareType === 'competition'
                    ? (item as Competition).school?.name || (item as Competition).city?.name || ''
                    : (item as School).city?.name || '';
                return (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => {
                      onSelect(item.id);
                      setSearch('');
                      setOpen(false);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {compareType === 'competition' ? (
                      <Trophy className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <GraduationCap className="h-4 w-4 text-teal-500 shrink-0" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium">{title}</span>
                      {subtitle && (
                        <span className="text-xs text-muted-foreground truncate">{subtitle}</span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// ITEM CARD (HEADER) FOR EACH COMPARED ITEM
// ============================================

interface ItemHeaderProps {
  item: Competition | School;
  type: 'competition' | 'school';
  onRemove: () => void;
}

function ItemHeader({ item, type, onRemove }: ItemHeaderProps) {
  const title = type === 'competition' ? (item as Competition).title : (item as School).name;
  const status = type === 'competition' ? (item as Competition).status : null;
  const schoolType = type === 'school' ? (item as School).type : null;

  return (
    <div className="flex flex-col items-center gap-2 p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-7 w-7 self-end -mt-1 -mr-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
      >
        <X className="h-4 w-4" />
      </Button>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
        type === 'competition'
          ? 'bg-emerald-100 dark:bg-emerald-900/30'
          : 'bg-teal-100 dark:bg-teal-900/30'
      }`}>
        {type === 'competition' ? (
          <Trophy className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <GraduationCap className="h-6 w-6 text-teal-600 dark:text-teal-400" />
        )}
      </div>
      <h4 className="font-bold text-sm text-center leading-tight line-clamp-2 min-h-[2.5rem]">
        {title}
      </h4>
      {status && (
        <Badge variant="outline" className={`text-xs ${statusConfig[status].className}`}>
          {statusConfig[status].label}
        </Badge>
      )}
      {schoolType && (
        <Badge variant="outline" className={`text-xs ${schoolTypeConfig[schoolType].className}`}>
          {schoolTypeConfig[schoolType].label}
        </Badge>
      )}
    </div>
  );
}

// ============================================
// ROW DEFINITIONS
// ============================================

const competitionRowDefs: ComparisonRowDef[] = [
  {
    label: 'العنوان',
    icon: <Trophy className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => <span key={c.id} className="font-medium">{c.title}</span>),
  },
  {
    label: 'الحالة',
    icon: <BarChart3 className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => (
      <Badge key={c.id} variant="outline" className={`text-xs ${statusConfig[c.status].className}`}>
        {statusConfig[c.status].label}
      </Badge>
    )),
  },
  {
    label: 'نوع المباراة',
    icon: <Tag className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => {
      const typeLabels: Record<string, string> = {
        RECRUITMENT: '💼 توظيف',
        ACADEMIC: '🎓 دراسية',
        SCHOLARSHIP: '💰 منحة دراسية',
        CONTINUING_EDUCATION: '📚 تكوين مستمر',
        ADMISSION: '🚪 ولوج',
      };
      return (
        <Badge key={c.id} variant="outline" className="text-xs">
          {typeLabels[c.type] || '🎓 دراسية'}
        </Badge>
      );
    }),
  },
  {
    label: 'المدرسة',
    icon: <Building className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => <span key={c.id}>{c.school?.name || '—'}</span>),
  },
  {
    label: 'التصنيف',
    icon: <Tag className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => <span key={c.id}>{c.category?.nameAr || c.category?.name || '—'}</span>),
  },
  {
    label: 'المدينة',
    icon: <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => <span key={c.id}>{c.city?.nameAr || c.city?.name || '—'}</span>),
  },
  {
    label: 'المستوى',
    icon: <GraduationCap className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => <span key={c.id}>{c.level?.nameAr || c.level?.name || '—'}</span>),
  },
  {
    label: 'آجل التسجيل',
    icon: <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) => <span key={c.id}>{formatDate(c.deadline)}</span>),
  },
  {
    label: 'الشروط',
    icon: <ListChecks className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) =>
      c.requirements ? (
        <span key={c.id} className="text-xs leading-relaxed line-clamp-3">{c.requirements}</span>
      ) : (
        <span key={c.id}>—</span>
      )
    ),
  },
  {
    label: 'الوثائق المطلوبة',
    icon: <FileText className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) =>
      c.documents ? (
        <span key={c.id} className="text-xs leading-relaxed line-clamp-3">{c.documents}</span>
      ) : (
        <span key={c.id}>—</span>
      )
    ),
  },
  {
    label: 'الرابط الرسمي',
    icon: <Link2 className="h-4 w-4 text-emerald-500 shrink-0" />,
    getValues: (items: Competition[]) => items.map((c) =>
      c.officialLink ? (
        <a
          key={c.id}
          href={c.officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline text-xs"
        >
          <ExternalLink className="h-3 w-3" />
          زيارة الرابط
        </a>
      ) : (
        <span key={c.id}>—</span>
      )
    ),
  },
];

const schoolRowDefs: ComparisonRowDef[] = [
  {
    label: 'الاسم',
    icon: <GraduationCap className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) => <span key={s.id} className="font-medium">{s.name}</span>),
  },
  {
    label: 'النوع',
    icon: <Building className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) => (
      <Badge key={s.id} variant="outline" className={`text-xs ${schoolTypeConfig[s.type].className}`}>
        {schoolTypeConfig[s.type].label}
      </Badge>
    )),
  },
  {
    label: 'المدينة',
    icon: <MapPin className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) => <span key={s.id}>{s.city?.nameAr || s.city?.name || '—'}</span>),
  },
  {
    label: 'التصنيف',
    icon: <Tag className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) => <span key={s.id}>{s.category?.nameAr || s.category?.name || '—'}</span>),
  },
  {
    label: 'المستوى',
    icon: <GraduationCap className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) => <span key={s.id}>{s.level?.nameAr || s.level?.name || '—'}</span>),
  },
  {
    label: 'عدد المباريات',
    icon: <Trophy className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) => (
      <Badge key={s.id} variant="secondary" className="bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
        {s._count?.competitions ?? 0}
      </Badge>
    )),
  },
  {
    label: 'الموقع الإلكتروني',
    icon: <Globe className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) =>
      s.website ? (
        <a
          key={s.id}
          href={s.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline text-xs"
        >
          <ExternalLink className="h-3 w-3" />
          زيارة الموقع
        </a>
      ) : (
        <span key={s.id}>—</span>
      )
    ),
  },
  {
    label: 'البريد الإلكتروني',
    icon: <Mail className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) =>
      s.email ? (
        <a key={s.id} href={`mailto:${s.email}`} className="text-teal-600 dark:text-teal-400 hover:underline text-xs">
          {s.email}
        </a>
      ) : (
        <span key={s.id}>—</span>
      )
    ),
  },
  {
    label: 'الهاتف',
    icon: <Phone className="h-4 w-4 text-teal-500 shrink-0" />,
    getValues: (items: School[]) => items.map((s) => <span key={s.id}>{s.phone || '—'}</span>),
  },
];

// ============================================
// MAIN COMPARISON VIEW
// ============================================

export function ComparisonView() {
  const { items, compareType, addItem, removeItem, clearAll, setCompareType } = useComparisonStore();
  const [highlightDifferences, setHighlightDifferences] = useState(false);

  // Fetch competition details
  const competitionQueries = items
    .filter((i) => i.type === 'competition')
    .map((item) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useQuery({
        queryKey: ['competition-compare', item.id],
        queryFn: () => competitionsApi.get(item.id),
        enabled: compareType === 'competition' && items.some((i) => i.id === item.id),
      })
    );

  // Fetch school details
  const schoolQueries = items
    .filter((i) => i.type === 'school')
    .map((item) =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useQuery({
        queryKey: ['school-compare', item.id],
        queryFn: () => schoolsApi.get(item.id),
        enabled: compareType === 'school' && items.some((i) => i.id === item.id),
      })
    );

  const competitions = competitionQueries
    .map((q) => q.data?.data)
    .filter((c): c is Competition => !!c);

  const schools = schoolQueries
    .map((q) => q.data?.data)
    .filter((s): s is School => !!s);

  const isLoading =
    (compareType === 'competition' && competitionQueries.some((q) => q.isLoading)) ||
    (compareType === 'school' && schoolQueries.some((q) => q.isLoading));

  const activeItems = compareType === 'competition' ? competitions : schools;
  const itemCount = activeItems.length;

  const handleAddItem = (id: string) => {
    addItem({ id, type: compareType });
  };

  const handleTypeChange = (type: 'competition' | 'school') => {
    if (type !== compareType) {
      setCompareType(type);
    }
  };

  const activeRowDefs = compareType === 'competition' ? competitionRowDefs : schoolRowDefs;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <GitCompare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">المقارنة</h1>
            <p className="text-sm text-muted-foreground">قارن بين المباريات أو المدارس جنباً إلى جنب</p>
          </div>
        </div>

        {/* Type Toggle */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={compareType === 'competition' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTypeChange('competition')}
            className={`gap-1.5 text-sm ${
              compareType === 'competition'
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : ''
            }`}
          >
            <Trophy className="h-4 w-4" />
            مباريات
          </Button>
          <Button
            variant={compareType === 'school' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleTypeChange('school')}
            className={`gap-1.5 text-sm ${
              compareType === 'school'
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : ''
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            مدارس
          </Button>
        </div>
      </motion.div>

      {/* Controls Bar */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center gap-3"
      >
        <ItemSelector
          compareType={compareType}
          selectedIds={items.map((i) => i.id)}
          onSelect={handleAddItem}
        />

        {items.length > 0 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`gap-1.5 text-sm ${highlightDifferences ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30' : ''}`}
            >
              <ArrowUpDown className="h-3.5 w-3.5" />
              تمييز الاختلافات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              className="gap-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
            >
              <Trash2 className="h-3.5 w-3.5" />
              مسح الكل
            </Button>
          </>
        )}

        <div className="mr-auto text-sm text-muted-foreground">
          {items.length}/4 عناصر
        </div>
      </motion.div>

      {/* Empty State */}
      {items.length === 0 && <EmptyState />}

      {/* Comparison Content */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="overflow-hidden border-emerald-200/50 dark:border-emerald-800/50">
            {/* Item Headers Row */}
            <div
              className="grid border-b border-border/50 bg-muted/30"
              style={{
                gridTemplateColumns: `160px repeat(${itemCount}, minmax(200px, 1fr))`,
              }}
            >
              <div className="p-4 flex items-center justify-center">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <AnimatePresence mode="popLayout">
                {activeItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-r border-border/30 last:border-r-0"
                  >
                    <ItemHeader
                      item={item}
                      type={compareType}
                      onRemove={() => removeItem(item.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {/* Empty loading slots */}
              {Array.from({ length: Math.max(0, items.length - activeItems.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="border-r border-border/30 last:border-r-0 p-4">
                  <div className="flex flex-col items-center justify-center h-24">
                    <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center mb-2">
                      <span className="text-xs text-muted-foreground">...</span>
                    </div>
                    <span className="text-xs text-muted-foreground">جاري التحميل</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            {isLoading ? (
              <div className="p-12 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">جاري تحميل البيانات...</span>
                </div>
              </div>
            ) : activeItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {activeRowDefs.map((rowDef, rowIndex) => (
                      <ComparisonRow
                        key={rowIndex}
                        row={rowDef}
                        items={activeItems}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 flex items-center justify-center">
                <span className="text-sm text-muted-foreground">لا توجد بيانات للمقارنة</span>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Tips Section */}
      {items.length === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-dashed border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <Plus className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  أضف عنصراً آخر للمقارنة! يمكنك مقارنة ما يصل إلى 4 عناصر في نفس الوقت.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
