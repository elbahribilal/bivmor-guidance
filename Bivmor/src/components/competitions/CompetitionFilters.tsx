'use client';

import { useQuery } from '@tanstack/react-query';
import { getCities, getCategories, getLevels } from '@/lib/api';
import type { CompetitionStatus, CompetitionType } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { useNavigationStore } from '@/store/navigation';

const statusOptions: { value: CompetitionStatus; label: string }[] = [
  { value: 'OPEN', label: 'مفتوح' },
  { value: 'CLOSED', label: 'مغلق' },
  { value: 'UPCOMING', label: 'قادم' },
  { value: 'EXPIRED', label: 'منتهي' },
];

const typeOptions: { value: CompetitionType; label: string; icon: string }[] = [
  { value: 'RECRUITMENT', label: 'توظيف', icon: '💼' },
  { value: 'ACADEMIC', label: 'دراسية', icon: '🎓' },
  { value: 'SCHOLARSHIP', label: 'منحة دراسية', icon: '💰' },
  { value: 'CONTINUING_EDUCATION', label: 'تكوين مستمر', icon: '📚' },
  { value: 'ADMISSION', label: 'ولوج', icon: '🚪' },
];

export default function CompetitionFilters() {
  const { competitionFilters, setCompetitionFilters, resetCompetitionFilters } = useNavigationStore();

  const { data: citiesData } = useQuery({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const { data: levelsData } = useQuery({
    queryKey: ['levels'],
    queryFn: getLevels,
  });

  const cities = citiesData?.data || [];
  const categories = categoriesData?.data || [];
  const levels = levelsData?.data || [];

  const hasActiveFilters = competitionFilters.cityId || competitionFilters.categoryId || competitionFilters.levelId || competitionFilters.status || competitionFilters.type;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث عن مباراة..."
          value={competitionFilters.search || ''}
          onChange={(e) => setCompetitionFilters({ search: e.target.value, page: 1 })}
          className="pr-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* City Filter */}
        <Select
          value={competitionFilters.cityId || '_all'}
          onValueChange={(val) =>
            setCompetitionFilters({ cityId: val === '_all' ? '' : val, page: 1 })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="المدينة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">جميع المدن</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={competitionFilters.categoryId || '_all'}
          onValueChange={(val) =>
            setCompetitionFilters({ categoryId: val === '_all' ? '' : val, page: 1 })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="المجال" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">جميع المجالات</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Level Filter */}
        <Select
          value={competitionFilters.levelId || '_all'}
          onValueChange={(val) =>
            setCompetitionFilters({ levelId: val === '_all' ? '' : val, page: 1 })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="المستوى" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">جميع المستويات</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level.id} value={level.id}>
                {level.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={competitionFilters.type || '_all'}
          onValueChange={(val) =>
            setCompetitionFilters({ type: (val === '_all' ? '' : val) as CompetitionType | '', page: 1 })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="نوع المباراة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">جميع الأنواع</SelectItem>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={competitionFilters.status || '_all'}
          onValueChange={(val) =>
            setCompetitionFilters({ status: (val === '_all' ? '' : val) as CompetitionStatus | '', page: 1 })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">جميع الحالات</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetCompetitionFilters}
            className="gap-1 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            مسح الفلاتر
          </Button>
        )}
      </div>
    </div>
  );
}
