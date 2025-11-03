// ===== ТИПЫ ДЛЯ ЛУЧШЕЙ ТИПИЗАЦИИ =====

export type RoadType = "major" | "secondary" | "minor";
export type FillType = "admin" | "water" | "park" | "land";

// ===== КОНСТАНТЫ ЦВЕТОВ =====

export const COLORS = {
  light: {
    motorway: "#ff0080", // яркий розовый неон для крупных дорог
    highway: "#ff0080", // яркий розовый неон
    primary: "#00d4ff", // яркий голубой неон
    main: "#00d4ff", // яркий голубой неон
    secondary: "#a855f7", // фиолетовый неон
    street: "#a855f7", // фиолетовый неон
    road: "#a855f7", // фиолетовый неон
    minor: "#10b981", // зеленый неон для мелких дорог
    major: "#ff0080", // alias для совместимости
    water: "#BBD6EC", // холодная голубая вода
    waterOutline: "#9EC3E3", // чуть темнее заливки
    park: "#a8c29a",
    parkOutline: "#7ba07a",
    boundary: "#9AA9BA"
  },
  dark: {
    motorway: "#00eaff",
    highway: "#00eaff",
    primary: "#ff5cf4",
    main: "#ff5cf4",
    secondary: "#a47cff",
    street: "#a47cff",
    road: "#a47cff",
    minor: "#3effc3",
    water: "#1a2a3f",
    waterOutline: "#2a4a6f",
    park: "#3a6a5a",
    parkOutline: "#4a8a6a",
    boundary: "#3a4a5a"
  }
};

// ===== ФУНКЦИЯ ПОЛУЧЕНИЯ ЦВЕТА =====

export const getLayerColor = (id: string, isLight: boolean) => {
  const s = id.toLowerCase();
  if (isLight) {
    if (s.includes("motorway") || s.includes("highway")) return COLORS.light.motorway;
    if (s.includes("primary") || s.includes("main")) return COLORS.light.primary;
    if (s.includes("secondary") || s.includes("street") || s.includes("road")) return COLORS.light.secondary;
    return COLORS.light.minor;
  }
  if (s.includes("motorway") || s.includes("highway")) return COLORS.dark.motorway;
  if (s.includes("primary") || s.includes("main")) return COLORS.dark.primary;
  if (s.includes("secondary") || s.includes("street") || s.includes("road")) return COLORS.dark.secondary;
  return COLORS.dark.minor;
};

// ===== КОНСТАНТЫ СТИЛЕЙ ДОРОГ =====

export const ROAD_STYLES = {
  major: {
    opacity: { light: [0.7, 0.85, 0.95, 1.0], dark: [0.45, 0.65, 0.85, 1.0] },
    width: [1.0, 2.0, 3.2, 5.0],
    blur: { light: 0.5, dark: 0.4 } // Увеличен blur для неона в светлой теме
  },
  secondary: {
    opacity: { light: [0.4, 0.5, 0.6, 0.7], dark: [0.20, 0.30, 0.45, 0.60] },
    width: [0.3, 0.6, 1.0, 1.6],
    blur: { light: 0.3, dark: 0.2 } // Увеличен blur для неона
  },
  minor: {
    opacity: { light: [0.2, 0.3, 0.4, 0.5], dark: [0.10, 0.15, 0.22, 0.30] },
    width: [0.2, 0.4, 0.6, 1.0],
    blur: { light: 0.2, dark: 0.1 } // Увеличен blur для неона
  }
};

// ===== КОНСТАНТЫ СТИЛЕЙ ДЛЯ FILL СЛОЕВ =====

export const FILL_STYLES: any = {
  admin: {
    opacity: 0.05,
    outline: { opacity: 0.4, width: 2, blur: 2 }
  },
  water: {
    opacity: { light: 0.5, dark: 0.3 },
    outline: { opacity: { light: 0.6, dark: 0.5 }, width: 0.5 }
  },
  park: {
    opacity: { light: 0.4, dark: 0.3 },
    outline: { opacity: 0.5, width: { light: 0.3, dark: 0.5 } }
  },
  land: {
    opacity: { dark: 0.35 },
    color: { dark: "#3a3f4a" }
  }
};

// ===== КОНСТАНТЫ ДЛЯ "ТЯЖЕЛЫХ" СТИЛЕЙ ДОРОГ =====

export const HEAVY_ROAD_STYLES = {
  major: {
    opacity: { light: 1.0, dark: 1.0 },
    width: [3.0, 5.0, 7.0, 10.0],
    blur: { light: 0.8, dark: 0.6 } // Сильный blur для неонового свечения
  },
  secondary: {
    opacity: { light: 0.6, dark: 0.5 },
    width: [0.5, 1.0, 1.5, 2.0],
    blur: { light: 0.4, dark: 0.2 } // Увеличен blur
  },
  minor: {
    opacity: { light: 0.3, dark: 0.2 },
    width: [0.2, 0.3, 0.5, 0.8],
    blur: { light: 0.2, dark: 0.1 } // Увеличен blur
  },
  default: {
    opacity: { light: 0.8, dark: 0.7 },
    width: [1.0, 1.5, 2.0, 3.0],
    blur: { light: 0.4, dark: 0.2 } // Увеличен blur
  }
};
