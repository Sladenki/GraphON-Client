'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import EventCard from '@/components/ui/EventCard/EventCard'
import { AdBanner } from '@/components/ads/banner'
import { useQueryWithRetry } from '@/hooks/useQueryWithRetry'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchQuery, useSelectedGraphId } from '@/stores/useUIStore'
import { EventService } from '@/services/event.service'
import { EventItem } from '@/types/schedule.interface'
import styles from './EventsList.module.scss'

export default function EventsList() {
  const searchQuery = useSearchQuery()
  const selectedGraphId = useSelectedGraphId()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Загрузка данных
  const { 
    data: allEvents, 
    isLoading, 
    isSuccess, 
    error,
    handleRetry,
    handleOptimisticUpdate
  } = useQueryWithRetry({
    queryKey: ['eventsList', selectedGraphId],
    queryFn: async () => {
      if (!selectedGraphId) {
        return { data: [] }
      }
      return await EventService.getUpcomingEvents(selectedGraphId)
    },
    enabled: !!selectedGraphId,
    gcTime: 15 * 60 * 1000, // 15 минут
    staleTime: 10 * 60 * 1000, // 10 минут
  })

  // Получение событий
  const events = useMemo(() => allEvents?.data || [], [allEvents?.data])

  // Фильтрация событий
  const filteredEvents = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return events
    }

    const query = debouncedSearchQuery.toLowerCase().trim()
    return events.filter((event: EventItem) => 
      event?.name?.toLowerCase().includes(query)
    )
  }, [events, debouncedSearchQuery])

  // Обработчик удаления
  const handleDelete = useCallback((eventId: string) => {
    handleOptimisticUpdate((old: any) => {
      if (!old?.data) return old
      
      return {
        ...old,
        data: old.data.filter((event: EventItem) => event._id !== eventId)
      }
    })
  }, [handleOptimisticUpdate])

  // Состояния
  const hasError = !!error
  const isEmpty = events.length === 0 && !isLoading
  const noSearchResults = debouncedSearchQuery && filteredEvents.length === 0

  // Рендер состояний
  if (hasError) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorText}>Ошибка загрузки данных</div>
        <button 
          className={styles.retryButton} 
          onClick={handleRetry}
        >
          Повторить
        </button>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        message="Нет предстоящих мероприятий"
        subMessage="Следите за обновлениями, чтобы не пропустить новые события"
        emoji="📅"
      />
    )
  }

  if (noSearchResults) {
    return (
      <EmptyState
        message="Ничего не найдено"
        subMessage="Попробуйте изменить параметры поиска"
        emoji="🔍"
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Реклама */}
      <div className={styles.adBanner}>
        <AdBanner />
      </div>

      {/* Загрузка */}
      {isLoading && (
        <div className={styles.loader}>
          <SpinnerLoader />
        </div>
      )}

      {/* Список событий */}
      {isSuccess && (
        <div className={styles.eventsList}>
          {filteredEvents.map((event: EventItem, index: number) => (
            <div 
              key={event._id} 
              className={styles.eventCard}
              style={{ 
                '--delay': `${Math.min(index * 0.05, 0.5)}s`
              } as React.CSSProperties}
            >
              <EventCard 
                event={event} 
                isAttended={event.isAttended} 
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
