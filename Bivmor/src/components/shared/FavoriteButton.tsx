'use client';

import { useFavoritesStore } from '@/store/favorites';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  id: string;
  type: 'competition' | 'school';
  title: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
}

export function FavoriteButton({ id, type, title, size = 'md', variant = 'ghost' }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
  const favorite = isFavorite(id);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorite) {
      removeFavorite(id);
    } else {
      addFavorite({ id, type, title });
    }
  };

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-9 w-9',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      variant={variant}
      size="icon"
      className={`${sizeClasses[size]} ${
        favorite
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-red-400'
      } transition-colors`}
      onClick={handleToggle}
      aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
    >
      <Heart className={`${iconSizes[size]} ${favorite ? 'fill-red-500' : ''}`} />
    </Button>
  );
}
