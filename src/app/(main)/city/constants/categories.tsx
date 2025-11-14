import { 
  Music,
  Palette,
  GraduationCap,
  Briefcase,
  Trophy,
  Laugh,
  UtensilsCrossed,
  Home,
  Building2,
  MapPin,
  PartyPopper,
  Users,
  Film,
  Theater
} from "lucide-react";

// Тип категории
export type EventCategory = "music" | "art" | "education" | "business" | "sport" | "humor" | "gastro" | "family" | "city" | "party" | "meetup" | "cinema" | "theater";

/**
 * Получить иконку по категории
 */
export function getCategoryIcon(category: string, size: number = 18) {
  switch (category) {
    case 'music':
      return <Music size={size} />;
    case 'art':
      return <Palette size={size} />;
    case 'education':
      return <GraduationCap size={size} />;
    case 'business':
      return <Briefcase size={size} />;
    case 'sport':
      return <Trophy size={size} />;
    case 'humor':
      return <Laugh size={size} />;
    case 'gastro':
      return <UtensilsCrossed size={size} />;
    case 'family':
      return <Home size={size} />;
    case 'city':
      return <Building2 size={size} />;
    case 'party':
      return <PartyPopper size={size} />;
    case 'meetup':
      return <Users size={size} />;
    case 'cinema':
      return <Film size={size} />;
    case 'theater':
      return <Theater size={size} />;
    default:
      return <MapPin size={size} />;
  }
}

/**
 * Получить цвет по категории
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    music: '#8b5cf6',      // Фиолетовый
    art: '#ec4899',        // Розовый
    education: '#22c55e',  // Зеленый
    business: '#3b82f6',   // Синий
    sport: '#f59e0b',      // Оранжевый
    humor: '#eab308',      // Желтый
    gastro: '#ef4444',     // Красный
    family: '#06b6d4',     // Голубой
    city: '#6366f1',       // Индиго
    party: '#a855f7',      // Пурпурный
    meetup: '#14b8a6',     // Бирюзовый
    cinema: '#0ea5e9',     // Небесно-голубой
    theater: '#d946ef',    // Фуксия
  };
  return colors[category] || '#3b82f6';
}

/**
 * Список категорий для фильтров
 */
export const CATEGORIES = [
  { key: "music", label: "Музыка", Icon: Music },
  { key: "art", label: "Искусство", Icon: Palette },
  { key: "education", label: "Образование", Icon: GraduationCap },
  { key: "business", label: "Бизнес", Icon: Briefcase },
  { key: "sport", label: "Спорт", Icon: Trophy },
  { key: "humor", label: "Юмор", Icon: Laugh },
  { key: "gastro", label: "Гастро", Icon: UtensilsCrossed },
  { key: "family", label: "Семья", Icon: Home },
  { key: "city", label: "Город", Icon: Building2 },
  { key: "party", label: "Вечеринки", Icon: PartyPopper },
  { key: "meetup", label: "Встречи", Icon: Users },
  { key: "cinema", label: "Кино", Icon: Film },
  { key: "theater", label: "Театр", Icon: Theater },
];

/**
 * Цвета для маркеров на карте (детальные настройки)
 */
export const CATEGORY_COLORS = {
  music: { 
    light: "#8b5cf6", 
    dark: "#a78bfa", 
    stroke: { light: "#6d28d9", dark: "#c4b5fd" }, 
    glow: "rgba(139, 92, 246, 0.5)",
    pulseGlow: "rgba(139, 92, 246, 0.25)"
  },
  art: { 
    light: "#ec4899", 
    dark: "#f472b6", 
    stroke: { light: "#db2777", dark: "#f9a8d4" }, 
    glow: "rgba(236, 72, 153, 0.5)",
    pulseGlow: "rgba(236, 72, 153, 0.25)"
  },
  education: { 
    light: "#22c55e", 
    dark: "#4ade80", 
    stroke: { light: "#16a34a", dark: "#86efac" }, 
    glow: "rgba(34, 197, 94, 0.5)",
    pulseGlow: "rgba(34, 197, 94, 0.25)"
  },
  business: { 
    light: "#3b82f6", 
    dark: "#60a5fa", 
    stroke: { light: "#1e40af", dark: "#93c5fd" }, 
    glow: "rgba(59, 130, 246, 0.5)",
    pulseGlow: "rgba(59, 130, 246, 0.25)"
  },
  sport: { 
    light: "#f59e0b", 
    dark: "#fbbf24", 
    stroke: { light: "#d97706", dark: "#fcd34d" }, 
    glow: "rgba(245, 158, 11, 0.5)",
    pulseGlow: "rgba(245, 158, 11, 0.25)"
  },
  humor: { 
    light: "#eab308", 
    dark: "#facc15", 
    stroke: { light: "#ca8a04", dark: "#fde047" }, 
    glow: "rgba(234, 179, 8, 0.5)",
    pulseGlow: "rgba(234, 179, 8, 0.25)"
  },
  gastro: { 
    light: "#ef4444", 
    dark: "#f87171", 
    stroke: { light: "#dc2626", dark: "#fca5a5" }, 
    glow: "rgba(239, 68, 68, 0.5)",
    pulseGlow: "rgba(239, 68, 68, 0.25)"
  },
  family: { 
    light: "#06b6d4", 
    dark: "#22d3ee", 
    stroke: { light: "#0891b2", dark: "#67e8f9" }, 
    glow: "rgba(6, 182, 212, 0.5)",
    pulseGlow: "rgba(6, 182, 212, 0.25)"
  },
  city: { 
    light: "#6366f1", 
    dark: "#818cf8", 
    stroke: { light: "#4f46e5", dark: "#a5b4fc" }, 
    glow: "rgba(99, 102, 241, 0.5)",
    pulseGlow: "rgba(99, 102, 241, 0.25)"
  },
  party: { 
    light: "#a855f7", 
    dark: "#c084fc", 
    stroke: { light: "#9333ea", dark: "#d8b4fe" }, 
    glow: "rgba(168, 85, 247, 0.5)",
    pulseGlow: "rgba(168, 85, 247, 0.25)"
  },
  meetup: { 
    light: "#14b8a6", 
    dark: "#2dd4bf", 
    stroke: { light: "#0d9488", dark: "#5eead4" }, 
    glow: "rgba(20, 184, 166, 0.5)",
    pulseGlow: "rgba(20, 184, 166, 0.25)"
  },
  cinema: { 
    light: "#0ea5e9", 
    dark: "#38bdf8", 
    stroke: { light: "#0284c7", dark: "#7dd3fc" }, 
    glow: "rgba(14, 165, 233, 0.5)",
    pulseGlow: "rgba(14, 165, 233, 0.25)"
  },
  theater: { 
    light: "#d946ef", 
    dark: "#e879f9", 
    stroke: { light: "#c026d3", dark: "#f0abfc" }, 
    glow: "rgba(217, 70, 239, 0.5)",
    pulseGlow: "rgba(217, 70, 239, 0.25)"
  },
  default: { 
    light: "#3b82f6", 
    dark: "#60a5fa", 
    stroke: { light: "#1e40af", dark: "#93c5fd" }, 
    glow: "rgba(96, 165, 250, 0.5)",
    pulseGlow: "rgba(96, 165, 250, 0.25)"
  },
} as const;

