'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { citiesApi, regionsApi, competitionsApi, schoolsApi } from '@/lib/api';
import { useNavigationStore } from '@/store/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MapPin, Trophy, GraduationCap, Building2, ChevronDown, Search,
  X, ExternalLink, Calendar, ArrowLeft, Globe2,
} from 'lucide-react';
import type { City, Region, Competition, School } from '@/types';

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const detailPanelVariants = {
  hidden: { opacity: 0, height: 0, y: -20 },
  visible: {
    opacity: 1,
    height: 'auto',
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 25 },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

// ============================================
// LOADING SKELETONS
// ============================================

function CityCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-1.5 bg-muted" />
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function HeaderSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-8 mb-8">
      <div className="relative z-10 space-y-3">
        <Skeleton className="h-8 w-64 bg-white/20" />
        <Skeleton className="h-4 w-80 bg-white/15" />
      </div>
    </div>
  );
}

function RegionTabsSkeleton() {
  return (
    <div className="flex gap-2 mb-6 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-lg shrink-0" />
      ))}
    </div>
  );
}

// ============================================
// CITY CARD COMPONENT
// ============================================

function CityCard({
  city,
  isSelected,
  onClick,
  regionName,
}: {
  city: City;
  isSelected: boolean;
  onClick: () => void;
  regionName: string;
}) {
  const competitionCount = city._count?.competitions || 0;
  const schoolCount = city._count?.schools || 0;

  return (
    <motion.div variants={cardVariants}>
      <Card
        className={`overflow-hidden cursor-pointer transition-all duration-300 group relative ${
          isSelected
            ? 'ring-2 ring-emerald-500 dark:ring-emerald-400 shadow-lg shadow-emerald-500/10'
            : 'hover:shadow-md hover:-translate-y-0.5'
        }`}
        onClick={onClick}
      >
        {/* Gradient accent top border */}
        <div
          className={`h-1.5 transition-all duration-300 ${
            isSelected
              ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500'
              : 'bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 opacity-60 group-hover:opacity-100'
          }`}
        />

        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* City icon */}
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                isSelected
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 scale-110'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 dark:text-emerald-500 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40'
              }`}
            >
              <MapPin className="h-5 w-5" />
            </div>

            {/* City info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {city.nameAr || city.nameFr || city.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Globe2 className="h-3 w-3" />
                {regionName}
              </p>
            </div>

            {/* Expand indicator */}
            <motion.div
              animate={{ rotate: isSelected ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="shrink-0 text-muted-foreground/50 group-hover:text-muted-foreground"
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 mt-3">
            <Badge
              variant="secondary"
              className="text-[11px] gap-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-0"
            >
              <Trophy className="h-3 w-3" />
              {competitionCount} مباراة
            </Badge>
            <Badge
              variant="secondary"
              className="text-[11px] gap-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 border-0"
            >
              <GraduationCap className="h-3 w-3" />
              {schoolCount} مدرسة
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// CITY DETAIL PANEL
// ============================================

function CityDetailPanel({
  city,
  regionName,
  onClose,
}: {
  city: City;
  regionName: string;
  onClose: () => void;
}) {
  const { setView, setCompetitionFilters, setSelectedSchool } = useNavigationStore();
  const [activeTab, setActiveTab] = useState('competitions');

  const { data: competitionsData, isLoading: competitionsLoading } = useQuery({
    queryKey: ['city-competitions', city.id],
    queryFn: () => competitionsApi.list({ cityId: city.id, limit: 50 }),
    enabled: !!city.id,
  });

  const { data: schoolsData, isLoading: schoolsLoading } = useQuery({
    queryKey: ['city-schools', city.id],
    queryFn: () => schoolsApi.list({ cityId: city.id, limit: 50 }),
    enabled: !!city.id,
  });

  const competitions: Competition[] = competitionsData?.data || [];
  const schools: School[] = schoolsData?.data || [];

  const handleCompetitionClick = (competitionId: string) => {
    setCompetitionFilters({ cityId: city.id });
    setView('competitions');
  };

  const handleSchoolClick = (schoolId: string) => {
    setSelectedSchool(schoolId);
  };

  const handleViewAllCompetitions = () => {
    setCompetitionFilters({ cityId: city.id });
    setView('competitions');
  };

  const handleViewAllSchools = () => {
    setView('schools');
  };

  // Status helpers
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'مفتوحة',
      CLOSED: 'مغلقة',
      EXPIRED: 'منتهية',
      UPCOMING: 'قادمة',
    };
    return map[status] || status;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      OPEN: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      CLOSED: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
      EXPIRED: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
      UPCOMING: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    };
    return map[status] || '';
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      PUBLIC: 'عمومي',
      PRIVATE: 'خاص',
      SEMI_PRIVATE: 'شبه خصوصي',
    };
    return map[type] || type;
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      PUBLIC: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      PRIVATE: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      SEMI_PRIVATE: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
    };
    return map[type] || '';
  };

  return (
    <motion.div
      variants={detailPanelVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="overflow-hidden"
    >
      <Card className="overflow-hidden border-emerald-200 dark:border-emerald-800/50">
        {/* Gradient header */}
        <div className="bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white relative overflow-hidden">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 left-8 w-16 h-16 rounded-full border-2 border-white/30" />
            <div className="absolute bottom-1 right-16 w-10 h-10 rounded-full border border-white/20" />
            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/10" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{city.nameAr || city.nameFr || city.name}</h2>
                <p className="text-sm text-white/80 flex items-center gap-1">
                  <Globe2 className="h-3 w-3" />
                  {regionName}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Quick stats row */}
          <div className="relative z-10 flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
              <Trophy className="h-3.5 w-3.5" />
              <span className="font-semibold">{competitions.length}</span>
              <span className="text-white/80">مباراة</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="font-semibold">{schools.length}</span>
              <span className="text-white/80">مدرسة</span>
            </div>
          </div>
        </div>

        {/* Tabs content */}
        <CardContent className="p-0">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            dir="rtl"
            className="w-full"
          >
            <div className="border-b px-4 pt-3">
              <TabsList className="bg-transparent h-10 p-0 gap-2 w-full justify-start">
                <TabsTrigger
                  value="competitions"
                  className="data-[state=active]:bg-emerald-100 dark:data-[state=active]:bg-emerald-900/30 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 rounded-lg px-4 h-8 gap-1.5"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  المباريات
                  {competitions.length > 0 && (
                    <Badge variant="outline" className="h-5 min-w-5 text-[10px] px-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                      {competitions.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="schools"
                  className="data-[state=active]:bg-teal-100 dark:data-[state=active]:bg-teal-900/30 data-[state=active]:text-teal-700 dark:data-[state=active]:text-teal-400 rounded-lg px-4 h-8 gap-1.5"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  المدارس
                  {schools.length > 0 && (
                    <Badge variant="outline" className="h-5 min-w-5 text-[10px] px-1.5 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400">
                      {schools.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Competitions Tab */}
            <TabsContent value="competitions" className="m-0">
              <div className="p-4">
                {competitionsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : competitions.length > 0 ? (
                  <>
                    <ScrollArea className="max-h-96">
                      <div className="space-y-1.5">
                        {competitions.map((comp, index) => (
                          <motion.button
                            key={comp.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => handleCompetitionClick(comp.id)}
                            className="flex items-center gap-3 w-full text-right p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors group"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                              <Trophy className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                {comp.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                {comp.school && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {comp.school.name}
                                  </span>
                                )}
                                {comp.deadline && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(comp.deadline).toLocaleDateString('ar-MA')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${getStatusColor(comp.status)}`}
                              >
                                {getStatusLabel(comp.status)}
                              </Badge>
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-emerald-500 transition-colors" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </ScrollArea>
                    {competitions.length > 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewAllCompetitions}
                        className="w-full mt-3 gap-1.5 border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                      >
                        عرض جميع المباريات في {city.nameAr || city.nameFr || city.name}
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Trophy className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">لا توجد مباريات في هذه المدينة</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Schools Tab */}
            <TabsContent value="schools" className="m-0">
              <div className="p-4">
                {schoolsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : schools.length > 0 ? (
                  <>
                    <ScrollArea className="max-h-96">
                      <div className="space-y-1.5">
                        {schools.map((school, index) => (
                          <motion.button
                            key={school.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            onClick={() => handleSchoolClick(school.id)}
                            className="flex items-center gap-3 w-full text-right p-3 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors group"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                {school.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                {school.address && (
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {school.address}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${getTypeColor(school.type)}`}
                              >
                                {getTypeLabel(school.type)}
                              </Badge>
                              {school._count?.competitions !== undefined && (
                                <Badge variant="outline" className="text-[10px]">
                                  {school._count.competitions} مباراة
                                </Badge>
                              )}
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-teal-500 transition-colors" />
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </ScrollArea>
                    {schools.length > 5 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewAllSchools}
                        className="w-full mt-3 gap-1.5 border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                      >
                        عرض جميع المدارس في {city.nameAr || city.nameFr || city.name}
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mb-2 opacity-20" />
                    <p className="text-sm">لا توجد مدارس في هذه المدينة</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState({ regionName }: { regionName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground"
    >
      <div className="relative mb-4">
        <div className="h-20 w-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
          <MapPin className="h-10 w-10 text-emerald-300 dark:text-emerald-700" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
          <Search className="h-4 w-4 text-teal-400 dark:text-teal-600" />
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-1">لا توجد مدن</h3>
      <p className="text-sm text-center max-w-xs">
        لا توجد مدن مسجلة في منطقة &quot;{regionName}&quot; حالياً
      </p>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CitiesExplorerView() {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { setView } = useNavigationStore();

  // Fetch cities
  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: () => citiesApi.list(),
  });

  // Fetch regions
  const { data: regionsData, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn: () => regionsApi.list(),
  });

  const cities: City[] = citiesData?.data || [];
  const regions: Region[] = regionsData?.data || [];

  // Build a map of region id -> region name for quick lookup
  const regionMap = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach((r) => {
      map[r.id] = r.nameAr || r.nameFr || r.name;
    });
    return map;
  }, [regions]);

  // Filter cities by region and search
  const filteredCities = useMemo(() => {
    let result = cities;

    // Filter by region
    if (selectedRegionId) {
      result = result.filter((c) => c.regionId === selectedRegionId);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.nameAr && c.nameAr.toLowerCase().includes(q)) ||
          (c.nameFr && c.nameFr.toLowerCase().includes(q))
      );
    }

    // Sort by order then name
    return result.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ar'));
  }, [cities, selectedRegionId, searchQuery]);

  // Selected city data
  const selectedCity = useMemo(() => {
    if (!selectedCityId) return null;
    return cities.find((c) => c.id === selectedCityId) || null;
  }, [cities, selectedCityId]);

  const selectedRegionName = selectedCity ? regionMap[selectedCity.regionId] || '' : '';

  const handleCityClick = (cityId: string) => {
    setSelectedCityId((prev) => (prev === cityId ? null : cityId));
  };

  const handleCloseDetail = () => {
    setSelectedCityId(null);
  };

  // Loading state
  if (citiesLoading || regionsLoading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <HeaderSkeleton />
        <RegionTabsSkeleton />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <CityCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-8">
      {/* ============================================ */}
      {/* HEADER SECTION */}
      {/* ============================================ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-6 sm:p-8 mb-8 text-white">
        {/* Decorative background elements - Morocco map silhouette hint */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {/* Abstract map-like shapes */}
          <svg
            className="absolute left-0 top-0 h-full w-1/3 opacity-[0.07] text-white"
            viewBox="0 0 200 200"
            fill="currentColor"
          >
            <path d="M20,30 L50,10 L80,15 L100,5 L130,20 L150,10 L170,30 L160,60 L175,80 L165,110 L140,130 L150,160 L120,170 L100,150 L70,160 L50,140 L30,150 L15,120 L25,90 L10,60 Z" />
          </svg>
          {/* Decorative circles */}
          <div className="absolute top-6 left-1/4 w-32 h-32 rounded-full border border-white/10" />
          <div className="absolute bottom-4 right-1/3 w-24 h-24 rounded-full border border-white/10" />
          <div className="absolute top-1/2 right-8 w-16 h-16 rounded-full bg-white/5" />
          <div className="absolute top-4 right-20 w-6 h-6 rounded-full bg-white/10" />
          <div className="absolute bottom-8 left-16 w-8 h-8 rounded-full bg-white/5" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">استكشف المدن المغربية</h1>
              <p className="text-sm text-white/80 mt-0.5">
                تصفح المباريات والمدارس حسب المدينة
              </p>
            </div>
          </div>

          {/* Quick summary */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              <span className="font-semibold">{cities.length}</span>
              <span className="text-white/80">مدينة</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
              <Globe2 className="h-3.5 w-3.5" />
              <span className="font-semibold">{regions.length}</span>
              <span className="text-white/80">منطقة</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5 text-sm">
              <Trophy className="h-3.5 w-3.5" />
              <span className="font-semibold">
                {cities.reduce((sum, c) => sum + (c._count?.competitions || 0), 0)}
              </span>
              <span className="text-white/80">مباراة</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* SEARCH + REGION FILTERS */}
      {/* ============================================ */}
      <div className="mb-6 space-y-4">
        {/* Search input */}
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="ابحث عن مدينة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-background pr-10 pl-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all"
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

        {/* Region tabs - horizontal scrollable */}
        <ScrollArea className="w-full" dir="rtl">
          <div className="flex gap-2 pb-2 min-w-max">
            {/* All regions tab */}
            <Button
              variant={selectedRegionId === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedRegionId(null)}
              className={`shrink-0 gap-1.5 rounded-lg ${
                selectedRegionId === null
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800'
              }`}
            >
              <Globe2 className="h-3.5 w-3.5" />
              الكل
            </Button>

            {/* Region tabs */}
            {regions
              .sort((a, b) => a.order - b.order)
              .map((region) => {
                const isActive = selectedRegionId === region.id;
                const cityCount = cities.filter((c) => c.regionId === region.id).length;
                return (
                  <Button
                    key={region.id}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedRegionId(isActive ? null : region.id)}
                    className={`shrink-0 gap-1.5 rounded-lg ${
                      isActive
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800'
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {region.nameAr || region.nameFr || region.name}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {cityCount}
                    </span>
                  </Button>
                );
              })}
          </div>
        </ScrollArea>
      </div>

      {/* ============================================ */}
      {/* CITIES GRID */}
      {/* ============================================ */}
      {filteredCities.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={selectedRegionId || 'all'}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filteredCities.map((city) => (
            <CityCard
              key={city.id}
              city={city}
              isSelected={selectedCityId === city.id}
              onClick={() => handleCityClick(city.id)}
              regionName={regionMap[city.regionId] || ''}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          regionName={
            selectedRegionId
              ? regionMap[selectedRegionId] || 'غير محدد'
              : searchQuery
              ? searchQuery
              : 'غير محدد'
          }
        />
      )}

      {/* Results count */}
      {filteredCities.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            عرض {filteredCities.length} من {cities.length} مدينة
            {selectedRegionId && (
              <button
                onClick={() => setSelectedRegionId(null)}
                className="mr-1 text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                (عرض الكل)
              </button>
            )}
          </p>
        </div>
      )}

      {/* ============================================ */}
      {/* CITY DETAIL PANEL */}
      {/* ============================================ */}
      <AnimatePresence>
        {selectedCity && (
          <div className="mt-6">
            <CityDetailPanel
              city={selectedCity}
              regionName={selectedRegionName}
              onClose={handleCloseDetail}
            />
          </div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* BACK TO COMPETITIONS LINK */}
      {/* ============================================ */}
      <div className="mt-8 text-center">
        <Button
          variant="ghost"
          onClick={() => setView('competitions')}
          className="gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400"
        >
          <ArrowLeft className="h-4 w-4" />
          استعرض جميع المباريات
        </Button>
      </div>
    </section>
  );
}
