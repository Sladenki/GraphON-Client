import { LifeTraceData, EventNode, FriendNode } from './types';

export function generateMockData(): LifeTraceData {
  const now = new Date();
  const events: EventNode[] = [];
  const friends: FriendNode[] = [];

  // Центральный узел пользователя
  const userNode = {
    id: 'user-core',
    x: 0,
    y: 0,
  };

  // Генерируем события
  const eventCount = 15;
  const categories: Array<'sport' | 'science' | 'creative' | 'general'> = ['sport', 'science', 'creative', 'general'];
  const eventNames = [
    'Хакатон по машинному обучению',
    'Футбольный матч',
    'Концерт студенческого оркестра',
    'Лекция по квантовой физике',
    'Турнир по настольному теннису',
    'Выставка студенческих работ',
    'Воркшоп по дизайну',
    'Баскетбольная тренировка',
    'Конференция по IT',
    'Театральная постановка',
    'Семинар по программированию',
    'Волейбольный матч',
    'Мастер-класс по фотографии',
    'Лекция по искусственному интеллекту',
    'Танцевальный вечер',
  ];

  const maxDaysAgo = 90;
  const baseRadius = 100; // Базовый радиус от центра
  const angleStep = (Math.PI * 2) / eventCount; // Угол между событиями
  const radiusGrowth = 15; // Рост радиуса с каждым событием

  for (let i = 0; i < eventCount; i++) {
    const daysAgo = (i / eventCount) * maxDaysAgo;
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Спиралевидное расположение
    const angle = i * angleStep;
    const radius = baseRadius + i * radiusGrowth;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const category = categories[Math.floor(Math.random() * categories.length)];

    events.push({
      id: `event-${i}`,
      eventId: `evt-${i}`,
      name: eventNames[i] || `Событие ${i + 1}`,
      category,
      timestamp,
      x,
      y,
      radius: 8,
      description: `Описание события ${i + 1}`,
    });

    // Генерируем друзей для некоторых событий
    if (Math.random() > 0.5 && i > 0) {
      const friendCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < friendCount; j++) {
        friends.push({
          id: `friend-${i}-${j}`,
          userId: `user-${i}-${j}`,
          firstName: ['Алексей', 'Мария', 'Дмитрий', 'Анна', 'Иван'][Math.floor(Math.random() * 5)],
          lastName: ['Иванов', 'Петрова', 'Сидоров', 'Козлова', 'Смирнов'][Math.floor(Math.random() * 5)],
          username: `user${i}${j}`,
          eventId: `event-${i}`,
        });
      }
    }
  }

  return {
    userNode,
    events,
    friends,
  };
}

