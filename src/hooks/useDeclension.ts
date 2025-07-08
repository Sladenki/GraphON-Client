import { useMemo } from 'react';

interface DeclensionRules {
  one: string;    // 1 участник
  few: string;    // 2-4 участника
  many: string;   // 5-20 участников
  other: string;  // 21, 22, 25, 31, 32, 35... участников
}

/**
 * Хук для правильного склонения слов по падежам
 * @param count - количество
 * @param rules - правила склонения
 * @returns правильно склоненное слово
 */
export const useDeclension = (count: number, rules: DeclensionRules): string => {
  return useMemo(() => {
    const absCount = Math.abs(count);
    const lastDigit = absCount % 10;
    const lastTwoDigits = absCount % 100;

    // Специальные случаи для чисел 11-14
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return rules.other;
    }

    // Для остальных случаев
    if (lastDigit === 1) {
      return rules.one;
    } else if (lastDigit >= 2 && lastDigit <= 4) {
      return rules.few;
    } else {
      return rules.other;
    }
  }, [count, rules]);
};

/**
 * Предустановленные правила склонения для часто используемых слов
 */
export const DECLENSION_RULES = {
  PARTICIPANT: {
    one: 'участник',
    few: 'участника', 
    many: 'участников',
    other: 'участников'
  },
  EVENT: {
    one: 'мероприятие',
    few: 'мероприятия',
    many: 'мероприятий', 
    other: 'мероприятий'
  },
  GRAPH: {
    one: 'граф',
    few: 'графа',
    many: 'графов',
    other: 'графов'
  },
  USER: {
    one: 'пользователь',
    few: 'пользователя',
    many: 'пользователей',
    other: 'пользователей'
  },
  DAY: {
    one: 'день',
    few: 'дня',
    many: 'дней',
    other: 'дней'
  },
  HOUR: {
    one: 'час',
    few: 'часа',
    many: 'часов',
    other: 'часов'
  },
  MINUTE: {
    one: 'минута',
    few: 'минуты',
    many: 'минут',
    other: 'минут'
  },
  EVENT_ITEM: {
    one: 'событие',
    few: 'события',
    many: 'событий',
    other: 'событий'
  }
} as const;

/**
 * Удобная функция для быстрого использования с предустановленными правилами
 */
export const useDeclensionWord = (count: number, wordType: keyof typeof DECLENSION_RULES): string => {
  return useDeclension(count, DECLENSION_RULES[wordType]);
}; 