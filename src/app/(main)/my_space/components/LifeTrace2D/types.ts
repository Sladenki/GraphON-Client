export type EventCategory = 'sport' | 'science' | 'creative' | 'general';

export interface EventNode {
  id: string;
  eventId: string;
  name: string;
  category: EventCategory;
  timestamp: Date;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  radius?: number;
  imageUrl?: string;
  description?: string;
}

export interface FriendNode {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl?: string;
  eventId: string; // ID события, где был добавлен друг
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface LifeTraceData {
  userNode: {
    id: string;
    x: number;
    y: number;
  };
  events: EventNode[];
  friends: FriendNode[];
}

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  sport: '#FF4136', // Красный
  science: '#7FDBFF', // Голубой
  creative: '#B10DC9', // Пурпурный
  general: '#FFFFFF', // Белый
};

