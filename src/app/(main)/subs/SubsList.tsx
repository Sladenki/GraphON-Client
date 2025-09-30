'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import EventCard from '@/components/ui/EventCard/EventCard'
import { useQueryWithRetry } from '@/hooks/useQueryWithRetry'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchQuery } from '@/stores/useUIStore'
import { GraphSubsService } from '@/services/graphSubs.service'
import { EventItem } from '@/types/schedule.interface'
import styles from './SubsList.module.scss'

export default function SubsList() {
  const searchQuery = useSearchQuery()
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
    queryKey: ['subsEvents'],
    queryFn: () => GraphSubsService.getSubsEvents(),
    gcTime: 10 * 60 * 1000, // 10 минут
    staleTime: 5 * 60 * 1000, // 5 минут
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
        message="Нет подписанных мероприятий"
        subMessage="Подпишитесь на интересные группы, чтобы видеть их события здесь"
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
