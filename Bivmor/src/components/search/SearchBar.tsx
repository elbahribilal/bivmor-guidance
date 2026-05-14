'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigationStore } from '@/store/navigation';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, navigateToSearch, searchFilters, setSearchFilters } = useNavigationStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFilters({ q: searchQuery.trim() });
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن مباراة، مدرسة، أو مجال..."
          className="h-14 pr-12 pl-4 text-base rounded-xl border-emerald-200 dark:border-emerald-800 focus:border-emerald-500"
        />
      </div>
    </form>
  );
}
