'use client';

import EventsHub from './EventsHub'
import EventsTikTokFeed from './EventsTikTokFeed'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function EventsNewPage() {
  // Показываем TikTok-ленту на мобильных, обычную ленту на ПК
  const isMobile = useMediaQuery('(max-width: 768px)')
  
  return isMobile ? <EventsTikTokFeed /> : <EventsHub />
}
