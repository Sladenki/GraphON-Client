'use client'

import React, { useCallback, useMemo } from 'react'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import EventCard from '@/components/shared/EventCard/EventCard'
import { useQueryWithRetry } from '@/hooks/useQueryWithRetry'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchQuery } from '@/stores/useUIStore'
import { GraphSubsService } from '@/services/graphSubs.service'
import { EventService } from '@/services/event.service'
import { EventItem } from '@/types/schedule.interface'
import { notifySuccess, notifyError } from '@/lib/notifications'
import { CalendarX, Search } from 'lucide-react'

interface SubsEventsListProps {
  className?: string
}

export default function SubsEventsList({ className }: SubsEventsListProps) {
  const searchQuery = useSearchQuery()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const {
    data: allEvents,
    isLoading,
    isSuccess,
    error,
    handleRetry,
    handleOptimisticUpdate,
  } = useQueryWithRetry({
    queryKey: ['subsEvents'],
    queryFn: () => GraphSubsService.getSubsEvents(),
    gcTime: 10 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  })

  const events = useMemo(() => allEvents?.data || [], [allEvents?.data])

  const filteredEvents = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return events
    const query = debouncedSearchQuery.toLowerCase().trim()
    return events.filter((event: EventItem) => event?.name?.toLowerCase().includes(query))
  }, [events, debouncedSearchQuery])

  const handleDelete = useCallback(
    async (eventId: string) => {
      try {
        handleOptimisticUpdate((old: any) => {
          if (!old?.data) return old
          return {
            ...old,
            data: old.data.filter((event: EventItem) => event._id !== eventId),
          }
        })

        await EventService.deleteEvent(eventId)
        notifySuccess('Мероприятие успешно удалено')
      } catch (error) {
        console.error('Ошибка при удалении мероприятия:', error)
        handleRetry()
        notifyError('Не удалось удалить мероприятие. Попробуйте еще раз.')
      }
    },
    [handleOptimisticUpdate, handleRetry]
  )

  const hasError = !!error
  const isEmpty = events.length === 0 && !isLoading
  const noSearchResults = Boolean(debouncedSearchQuery) && filteredEvents.length === 0

  if (hasError) {
    return (
      <div className={className}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 24 }}>
          <div style={{ fontSize: 36 }}>⚠️</div>
          <div style={{ fontSize: 16, color: 'var(--main-text)', fontWeight: 500 }}>Ошибка загрузки данных</div>
          <button
            onClick={handleRetry}
            style={{
              padding: '12px 24px',
              background: 'rgb(var(--main-Color))',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Повторить
          </button>
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className={className}>
        <EmptyState
          message="Мероприятий нет"
          subMessage="В подписанных группах пока нет мероприятий"
          icon={CalendarX}
        />
      </div>
    )
  }

  if (noSearchResults) {
    return (
      <div className={className}>
        <EmptyState message="Ничего не найдено" subMessage="Попробуйте изменить параметры поиска" icon={Search} />
      </div>
    )
  }

  return (
    <div className={className}>
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <SpinnerLoader />
        </div>
      )}

      {isSuccess && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '20px 0' }} data-swipe-enabled="true">
          {filteredEvents.map((event: EventItem, index: number) => (
            <div
              key={event._id}
              style={{
                width: '100%',
                animation: 'fadeIn 0.4s ease-out forwards',
                animationDelay: `${Math.min(index * 0.05, 0.5)}s`,
              }}
            >
              <EventCard event={event} isAttended={event.isAttended} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


