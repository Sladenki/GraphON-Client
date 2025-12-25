/**
 * Цветовая палитра GraphON
 * 
 * Единая система цветов для всего приложения
 */

export const colors = {
  // 🔹 Основной цвет
  primary: {
    DEFAULT: '#9682EE',
    hover: '#6E5AD6',
    light: '#E6E1FA',
  },

  // 🔹 Дополнительные (Secondary / Accent)
  secondary: {
    darkPurple: '#6E5AD6', // для ховеров, заголовков
    softLavender: '#E6E1FA', // фоновые блоки
    accentPink: '#EE82C8', // акценты, CTA, иконки
  },

  // ⚪ Нейтральные цвета
  neutral: {
    background: '#F9F8FD', // основной фон
    card: '#FFFFFF', // карточки / поверхности
    border: '#DAD6F3', // границы / разделители
  },

  // ⚫ Текст
  text: {
    primary: '#2B2A33', // заголовки
    secondary: '#5E5C6A', // описания
    muted: '#9A97AD', // приглушенный текст / placeholder
  },

  // ✅ Состояния
  status: {
    success: '#4CAF88',
    warning: '#F2B705',
    error: '#E05A5A',
    info: '#6FA8FF',
  },
} as const;

/**
 * RGB значения для использования с opacity
 */
export const colorsRGB = {
  primary: {
    DEFAULT: '150, 130, 238', // #9682EE
    hover: '110, 90, 214', // #6E5AD6
  },
  secondary: {
    accentPink: '238, 130, 200', // #EE82C8
  },
  status: {
    success: '76, 175, 136', // #4CAF88
    warning: '242, 183, 5', // #F2B705
    error: '224, 90, 90', // #E05A5A
    info: '111, 168, 255', // #6FA8FF
  },
} as const;

/**
 * Цвета для темной темы (опционально, если нужна поддержка)
 */
export const darkColors = {
  primary: {
    DEFAULT: '#A896F0', // немного светлее для темной темы
    hover: '#7E6DE6',
    light: '#2A1F4A',
  },
  neutral: {
    background: '#1A1825',
    card: '#252330',
    border: '#3A3548',
  },
  text: {
    primary: '#F5F4F8',
    secondary: '#C5C3D0',
    muted: '#8A8799',
  },
} as const;

