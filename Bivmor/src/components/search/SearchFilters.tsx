'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { getCities, getCategories, getLevels } from '@/lib/api';
import { useNavigationStore } from '@/store/navigation';

export default function SearchFilters() {
  const { searchFilters, setSearchFilters } = useNavigationStore();

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

  const hasActiveFilters = searchFilters.cityId || searchFilters.categoryId || searchFilters.levelId;

  const clearFilters = () => {
    setSearchFilters({
      cityId: '',
      categoryId: '',
      levelId: '',
      type: '',
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Type tabs */}
      <div className="flex rounded-lg border overflow-hidden">
        {[
          { value: '', label: 'الكل' },
          { value: 'competitions', label: 'المباريات' },
          { value: 'schools', label: 'المدارس' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSearchFilters({ type: tab.value as typeof searchFilters.type })}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              searchFilters.type === tab.value
                ? 'bg-emerald-600 text-white'
                : 'bg-background text-muted-foreground hover:bg-accent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* City Filter */}
      <Select
        value={searchFilters.cityId || '_all'}
        onValueChange={(val) =>
          setSearchFilters({ cityId: val === '_all' ? '' : val })
        }
      >
        <SelectTrigger className="w-[140px]">
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
        value={searchFilters.categoryId || '_all'}
        onValueChange={(val) =>
          setSearchFilters({ categoryId: val === '_all' ? '' : val })
        }
      >
        <SelectTrigger className="w-[140px]">
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
        value={searchFilters.levelId || '_all'}
        onValueChange={(val) =>
          setSearchFilters({ levelId: val === '_all' ? '' : val })
        }
      >
        <SelectTrigger className="w-[140px]">
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

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1 text-muted-foreground"
        >
          <X className="h-4 w-4" />
          مسح
        </Button>
      )}
    </div>
  );
}
