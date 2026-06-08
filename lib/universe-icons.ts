import {
  Home,
  Music,
  Gamepad2,
  Cat,
  Dog,
  Shirt,
  Sparkles,
  Heart,
  Sprout,
  Coffee,
  Gift,
  BookOpen,
  Camera,
  Palette,
  Star,
  Tv,
  Headphones,
  Flame,
  Gem,
  Rocket,
  Smile,
  Trophy,
  Film,
  Bike,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  home: Home,
  music: Music,
  gamepad: Gamepad2,
  cat: Cat,
  dog: Dog,
  shirt: Shirt,
  sparkles: Sparkles,
  heart: Heart,
  sprout: Sprout,
  coffee: Coffee,
  gift: Gift,
  book: BookOpen,
  camera: Camera,
  palette: Palette,
  star: Star,
  tv: Tv,
  headphones: Headphones,
  flame: Flame,
  gem: Gem,
  rocket: Rocket,
  smile: Smile,
  trophy: Trophy,
  film: Film,
  bike: Bike,
};

export function getUniverseIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  return ICONS[name] ?? null;
}
