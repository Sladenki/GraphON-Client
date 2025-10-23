'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { ErrorState } from '@/components/global/ErrorState/ErrorState'
import EventCard from '@/components/shared/EventCard/EventCard'
import { useQueryWithRetry } from '@/hooks/useQueryWithRetry'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchQuery, useSelectedGraphId, useSetSearchQuery } from '@/stores/useUIStore'
import { EventService } from '@/services/event.service'
import { EventItem } from '@/types/schedule.interface'
import { notifySuccess, notifyError } from '@/lib/notifications'
import styles from './EventsList.module.scss'
import SearchBar, { SearchTag } from '@/components/shared/SearchBar/SearchBar'
import { CalendarX, Search } from 'lucide-react'

export default function EventsList() {
  const searchQuery = useSearchQuery()
  const selectedGraphId = useSelectedGraphId()
  const setSearchQuery = useSetSearchQuery()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [includeTbd, setIncludeTbd] = useState<boolean>(true)

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

  // Доступные теги: используем graphId и parentGraphId (если приходит)
  const availableTags: SearchTag[] = useMemo(() => {
    const map = new Map<string, SearchTag>()
    events.forEach((ev: any) => {
      if (ev?.graphId?._id && ev?.graphId?.name) {
        map.set(ev.graphId._id, { _id: ev.graphId._id, name: ev.graphId.name })
      }
      const parent = ev?.graphId?.parentGraphId
      if (parent?._id && parent?.name) {
        map.set(parent._id, { _id: parent._id, name: parent.name })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [events])

  // Фильтрация событий: текст + теги + даты
  const filteredEvents = useMemo(() => {
    let result: any[] = [...events]

    const query = debouncedSearchQuery.toLowerCase().trim()
    if (query) {
      result = result.filter((ev: EventItem | any) => {
        const fields: string[] = [ev?.name, ev?.description, ev?.place, ev?.graphId?.name].filter(Boolean)
        return fields.some((v) => String(v).toLowerCase().includes(query))
      })
    }

    if (selectedTagIds.length > 0) {
      result = result.filter((ev: any) => {
        const gid = ev?.graphId?._id
        const pid = ev?.graphId?.parentGraphId?._id
        return (gid && selectedTagIds.includes(gid)) || (pid && selectedTagIds.includes(pid))
      })
    }

    const hasDateFrom = Boolean(dateFrom)
    const hasDateTo = Boolean(dateTo)
    if (hasDateFrom || hasDateTo) {
      result = result.filter((ev: any) => {
        const isTbd = Boolean(ev?.isDateTbd)
        const dateStr: string | null = ev?.eventDate ?? null
        if (!dateStr) {
          return includeTbd && isTbd
        }
        const evDate = new Date(dateStr)
        if (Number.isNaN(evDate.getTime())) {
          return includeTbd && isTbd
        }
        if (hasDateFrom) {
          const from = new Date(dateFrom)
          if (evDate < from) return false
        }
        if (hasDateTo) {
          const to = new Date(dateTo)
          // включительно
          const toEnd = new Date(to)
          toEnd.setHours(23, 59, 59, 999)
          if (evDate > toEnd) return false
        }
        return true
      })
    }

    return result
  }, [events, debouncedSearchQuery, selectedTagIds, dateFrom, dateTo, includeTbd])

  // Обработчик удаления
  const handleDelete = useCallback(async (eventId: string) => {
    try {
      // Оптимистичное обновление UI
      handleOptimisticUpdate((old: any) => {
        if (!old?.data) return old
        
        return {
          ...old,
          data: old.data.filter((event: EventItem) => event._id !== eventId)
        }
      })

      // Отправка запроса на сервер
      await EventService.deleteEvent(eventId)
      
      // Уведомление об успехе
      notifySuccess('Мероприятие успешно удалено')
    } catch (error) {
      console.error('Ошибка при удалении мероприятия:', error)
      
      // Откат оптимистичного обновления при ошибке
      handleRetry()
      
      // Уведомление об ошибке
      notifyError('Не удалось удалить мероприятие. Попробуйте еще раз.')
    }
  }, [handleOptimisticUpdate, handleRetry])

  // Состояния
  const hasError = !!error
  const isEmpty = events.length === 0 && !isLoading
  const noSearchResults = filteredEvents.length === 0 && !isLoading

  // Рендер состояний
  if (hasError) {
    return (
      <ErrorState
        message="Ошибка загрузки данных"
        subMessage="Не удалось загрузить список мероприятий"
        onRetry={handleRetry}
      />
    )
  }

  if (isEmpty) {
    return (
      <EmptyState
        message="Нет предстоящих мероприятий"
        subMessage="Следите за обновлениями, чтобы не пропустить новые события"
        icon={CalendarX}
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Панель поиска и фильтров */}
      <div className={styles.filters}>
        <SearchBar
          placeholder="Поиск мероприятий..."
          onSearch={setSearchQuery}
          onTagFilter={setSelectedTagIds}
          availableTags={availableTags}
          initialQuery={searchQuery}
          showDateFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          includeTbd={includeTbd}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onIncludeTbdChange={setIncludeTbd}
        />
      </div>
      
      {/* Загрузка */}
      {isLoading && (
        <div className={styles.loader}>
          <SpinnerLoader />
        </div>
      )}

      {/* Пустой результат поиска */}
      {noSearchResults && !isLoading && (
        <EmptyState
          message="Ничего не найдено"
          subMessage="Измените текст, даты или теги"
          icon={Search}
        />
      )}

      {/* Список событий */}
      {isSuccess && !noSearchResults && (
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
