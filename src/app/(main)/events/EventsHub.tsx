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

  const [activeTab, setActiveTab] = useState<EventsTab>(initialTab)

  // Sync tab with URL (and prevent unauth from landing on subs tab)
  useEffect(() => {
    if (!canShowToggle) {
      if (activeTab !== 'all') setActiveTab('all')
      return
    }
    setActiveTab(initialTab)
  }, [canShowToggle, initialTab])

  const setTabInUrl = (tab: EventsTab) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (tab === 'subs') sp.set('tab', 'subs')
    else sp.delete('tab')
    const qs = sp.toString()
    router.replace(qs ? `/events/?${qs}` : '/events/')
  }

  const handleSelectAll = () => {
    setActiveTab('all')
    setTabInUrl('all')
  }

  const handleSelectSubs = () => {
    setActiveTab('subs')
    setTabInUrl('subs')
  }

  if (!canShowToggle) {
    // Неавторизованные — только общий список
    return <EventsList />
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.topRow}>
          <div className={styles.segmented} role="tablist" aria-label="Режим мероприятий">
            <button
              type="button"
              className={`${styles.segButton} ${activeTab === 'all' ? styles.segButtonActive : ''}`}
              onClick={handleSelectAll}
              role="tab"
              aria-selected={activeTab === 'all'}
            >
              Все
            </button>
            <button
              type="button"
              className={`${styles.segButton} ${activeTab === 'subs' ? styles.segButtonActive : ''}`}
              onClick={handleSelectSubs}
              role="tab"
              aria-selected={activeTab === 'subs'}
            >
              Подписки
              <span className={styles.badge}>{subsCount}</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'all' ? (
        <EventsList />
      ) : subsCount === 0 ? (
        <div className={styles.container}>
          <EmptyState
            message="Вы не подписаны ни на какие группы"
            subMessage="Подпишитесь на интересные группы, чтобы видеть их мероприятия здесь"
            icon={Heart}
          />
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles.subsHeader}>
            <SearchBar
              placeholder="Поиск по подпискам..."
              onSearch={setSearchQuery}
              onTagFilter={() => {}}
              showTagFilter={false}
              availableTags={[]}
              initialQuery={searchQuery}
            />
          </div>
          <SubsEventsList />
        </div>
      )}
    </>
  )
}


