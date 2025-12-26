// СТАРАЯ РЕАЛИЗАЦИЯ - ЗАКОММЕНТИРОВАНА, НО СОХРАНЕНА ДЛЯ ВОЗМОЖНОГО ИСПОЛЬЗОВАНИЯ
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import EventsList from './EventsList'
import SubsEventsList from './SubsEventsList'
import styles from './EventsHub.module.scss'
import SearchBar from '@/components/shared/SearchBar/SearchBar'
import { useSearchQuery, useSetSearchQuery } from '@/stores/useUIStore'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { Heart } from 'lucide-react'

type EventsTab = 'all' | 'subs'

export default function EventsHub() {
  const { isLoggedIn, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchQuery = useSearchQuery()
  const setSearchQuery = useSetSearchQuery()

  const subsCount = user?.graphSubsNum ?? 0
  const canShowToggle = Boolean(isLoggedIn)

  const initialTab: EventsTab = useMemo(() => {
    const tab = searchParams.get('tab')
    if (tab === 'subs') return 'subs'
    return 'all'
  }, [searchParams])

  // Tabs and subscription logic are handled inside EventsList now
  return <EventsList />
}

// Новая реализация используется в EventsTikTokFeed
// export default function EventsHub() {
//   return null;
// }


