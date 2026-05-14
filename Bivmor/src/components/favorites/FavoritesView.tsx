'use client';

import { useFavoritesStore } from '@/store/favorites';
import { useNavigationStore } from '@/store/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, GraduationCap, Heart, Trash2, ArrowRight } from 'lucide-react';

export function FavoritesView() {
  const { items, removeFavorite, clearAll } = useFavoritesStore();
  const { setSelectedCompetition, setSelectedSchool, setView } = useNavigationStore();

  const competitionFavorites = items.filter((i) => i.type === 'competition');
  const schoolFavorites = items.filter((i) => i.type === 'school');

  if (items.length === 0) {
    return (
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <Heart className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">المفضلة</h2>
            <p className="text-sm text-muted-foreground">المباريات والمدارس المحفوظة</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Heart className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium mb-2">لا توجد عناصر في المفضلة</p>
          <p className="text-sm mb-6">اضغط على أيقونة القلب لحفظ المباريات والمدارس المفضلة لديك</p>
          <div className="flex gap-3">
            <Button onClick={() => setView('competitions')} variant="outline" className="gap-2">
              <Trophy className="h-4 w-4" />
              تصفح المباريات
            </Button>
            <Button onClick={() => setView('schools')} variant="outline" className="gap-2">
              <GraduationCap className="h-4 w-4" />
              تصفح المدارس
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">المفضلة</h2>
            <p className="text-sm text-muted-foreground">{items.length} عنصر محفوظ</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-red-500 hover:text-red-600 gap-1.5"
        >
          <Trash2 className="h-4 w-4" />
          مسح الكل
        </Button>
      </div>

      {/* Competition Favorites */}
      {competitionFavorites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-semibold text-sm">المباريات المحفوظة ({competitionFavorites.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {competitionFavorites.map((fav) => (
              <Card
                key={fav.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/50"
                onClick={() => setSelectedCompetition(fav.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Trophy className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {fav.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">مباراة</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-500 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(fav.id);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-red-400" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* School Favorites */}
      {schoolFavorites.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-semibold text-sm">المدارس المحفوظة ({schoolFavorites.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {schoolFavorites.map((fav) => (
              <Card
                key={fav.id}
                className="group cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-border/50"
                onClick={() => setSelectedSchool(fav.id)}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                    <GraduationCap className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {fav.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">مدرسة / معهد</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:text-red-500 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(fav.id);
                    }}
                  >
                    <Heart className="h-4 w-4 fill-red-400" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
