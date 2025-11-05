import { 
  Music, 
  Image as ImageIcon, 
  GraduationCap, 
  Sparkles, 
  Users,
  MapPin
} from "lucide-react";

// Тип категории
export type EventCategory = "concert" | "exhibit" | "lecture" | "festival" | "meetup";

/**
 * Получить иконку по категории
 */
export function getCategoryIcon(category: string, size: number = 18) {
  switch (category) {
    case 'concert':
      return <Music size={size} />;
    case 'exhibit':
      return <ImageIcon size={size} />;
    case 'lecture':
      return <GraduationCap size={size} />;
    case 'festival':
      return <Sparkles size={size} />;
    case 'meetup':
      return <Users size={size} />;
    default:
      return <MapPin size={size} />;
  }
}

/**
 * Получить цвет по категории
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    concert: '#8b5cf6',
    exhibit: '#06b6d4',
    lecture: '#22c55e',
    festival: '#ec4899',
    meetup: '#fb923c',
  };
  return colors[category] || '#3b82f6';
}

/**
 * Список категорий для фильтров
 */
export const CATEGORIES = [
  { key: "concert", label: "Концерты", Icon: Music },
  { key: "exhibit", label: "Выставки", Icon: ImageIcon },
  { key: "lecture", label: "Лекции", Icon: GraduationCap },
  { key: "festival", label: "Фестивали", Icon: Sparkles },
  { key: "meetup", label: "Митапы", Icon: Users },
];

/**
 * Цвета для маркеров на карте (детальные настройки)
 */
export const CATEGORY_COLORS = {
  concert: { 
    light: "#8b5cf6", 
    dark: "#a78bfa", 
    stroke: { light: "#6d28d9", dark: "#c4b5fd" }, 
    glow: "rgba(139, 92, 246, 0.5)",
    pulseGlow: "rgba(139, 92, 246, 0.25)"
  },
  exhibit: { 
    light: "#06b6d4", 
    dark: "#22d3ee", 
    stroke: { light: "#0891b2", dark: "#67e8f9" }, 
    glow: "rgba(6, 182, 212, 0.5)",
    pulseGlow: "rgba(6, 182, 212, 0.25)"
  },
  lecture: { 
    light: "#22c55e", 
    dark: "#4ade80", 
    stroke: { light: "#16a34a", dark: "#86efac" }, 
    glow: "rgba(34, 197, 94, 0.5)",
    pulseGlow: "rgba(34, 197, 94, 0.25)"
  },
  festival: { 
    light: "#ec4899", 
    dark: "#f472b6", 
    stroke: { light: "#db2777", dark: "#f9a8d4" }, 
    glow: "rgba(236, 72, 153, 0.5)",
    pulseGlow: "rgba(236, 72, 153, 0.25)"
  },
  meetup: { 
    light: "#fb923c", 
    dark: "#fb923c", 
    stroke: { light: "#ea580c", dark: "#fdba74" }, 
    glow: "rgba(251, 146, 60, 0.5)",
    pulseGlow: "rgba(251, 146, 60, 0.25)"
  },
  default: { 
    light: "#3b82f6", 
    dark: "#60a5fa", 
    stroke: { light: "#1e40af", dark: "#93c5fd" }, 
    glow: "rgba(96, 165, 250, 0.5)",
    pulseGlow: "rgba(96, 165, 250, 0.25)"
  },
} as const;

