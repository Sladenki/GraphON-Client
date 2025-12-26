'use client'

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { ErrorState } from '@/components/global/ErrorState/ErrorState'
import EventCardNew from '@/components/shared/EventCardNew/EventCardNew'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchQuery, useSelectedGraphId, useSetSearchQuery } from '@/stores/useUIStore'
import { EventService } from '@/services/event.service'
import { EventItem } from '@/types/schedule.interface'
import { notifySuccess, notifyError } from '@/lib/notifications'
import styles from './EventsList.module.scss'
import SearchBar, { SearchTag } from '@/components/shared/SearchBar/SearchBar'
import { CalendarX, Search } from 'lucide-react'
import GraphSwitcher from '@/components/global/GraphSwitcher/GraphSwitcher'
import PillTabs from '@/components/shared/PillTabs/PillTabs'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import SubsEventsList from './SubsEventsList'
import { Search as SearchIcon } from 'lucide-react'
import EventCard from '@/components/shared/EventCard/EventCard'

const EVENTS_PER_PAGE = 20

type EventsPillTab = 'groups' | 'students' | 'subs'

export default function EventsList() {
  const { isLoggedIn, user } = useAuth()
  const subsCount = user?.graphSubsNum ?? 0
  const searchParams = useSearchParams()
  const router = useRouter()

  const searchQuery = useSearchQuery()
  const selectedGraphId = useSelectedGraphId()
  const setSearchQuery = useSetSearchQuery()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [includeTbd, setIncludeTbd] = useState<boolean>(true)
  const initialTab: EventsPillTab = useMemo(() => {
    const tab = searchParams.get('tab')
    if (tab === 'subs') return 'subs'
    return 'groups'
  }, [searchParams])
  const [activeTab, setActiveTab] = useState<EventsPillTab>(initialTab)
  const queryClient = useQueryClient()
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // sync tab with auth and URL
  useEffect(() => {
    if (!isLoggedIn && activeTab === 'subs') {
      setActiveTab('groups')
    } else {
      setActiveTab(initialTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, initialTab])

  const setTabInUrl = (tab: EventsPillTab) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (tab === 'subs') sp.set('tab', 'subs')
    else sp.delete('tab')
    const qs = sp.toString()
    router.replace(qs ? `/events/?${qs}` : '/events/')
  }

  const handleTabChange = (tab: EventsPillTab) => {
    if (!isLoggedIn && tab === 'subs') return
    setActiveTab(tab)
    setTabInUrl(tab)
  }

  // Бесконечная загрузка данных
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSuccess,
    error,
    refetch
  } = useInfiniteQuery({
    queryKey: ['eventsList', selectedGraphId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!selectedGraphId) {
        return { data: [] }
      }
      return await EventService.getUpcomingEvents(selectedGraphId, pageParam, EVENTS_PER_PAGE)
    },
    enabled: !!selectedGraphId,
    getNextPageParam: (lastPage, allPages) => {
      const events = lastPage?.data || []
      // Если вернулось меньше событий, чем запрашивали, значит это последняя страница
      if (events.length < EVENTS_PER_PAGE) {
        return undefined
      }
      // Возвращаем следующий skip
      return allPages.length * EVENTS_PER_PAGE
    },
    initialPageParam: 0,
    gcTime: 15 * 60 * 1000, // 15 минут
    staleTime: 10 * 60 * 1000, // 10 минут
  })

  // Объединение всех страниц в один массив событий
  const events = useMemo(() => {
    if (!data?.pages) return []
    return data.pages.flatMap(page => page?.data || [])
  }, [data?.pages])

  // IntersectionObserver для автоматической загрузки следующей страницы
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

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
      queryClient.setQueryData(['eventsList', selectedGraphId], (old: any) => {
        if (!old?.pages) return old
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: (page?.data || []).filter((event: EventItem) => event._id !== eventId)
          }))
        }
      })

      // Отправка запроса на сервер
      await EventService.deleteEvent(eventId)
      
      // Уведомление об успехе
      notifySuccess('Мероприятие успешно удалено')
    } catch (error) {
      console.error('Ошибка при удалении мероприятия:', error)
      
      // Откат оптимистичного обновления при ошибке
      refetch()
      
      // Уведомление об ошибке
      notifyError('Не удалось удалить мероприятие. Попробуйте еще раз.')
    }
  }, [queryClient, selectedGraphId, refetch])

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
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className={styles.container}>
      {/* Панель поиска и фильтров */}
      {isLoggedIn && (
        <div className={styles.mobileTabsRow}>
          <button
            type="button"
            className={styles.searchIconPill}
            aria-label="Поиск"
            onClick={() => setShowMobileSearch((v) => !v)}
          >
            <SearchIcon size={18} />
          </button>
          <PillTabs
            options={[
              { key: 'groups', label: 'События' },
              { key: 'students', label: 'Студенчество' },
              { key: 'subs', label: 'Подписки', badge: subsCount },
            ]}
            activeKey={activeTab}
            onChange={(key) => handleTabChange(key as EventsPillTab)}
            aria-label="Фильтр событий"
          />
        </div>
      )}

      {activeTab === 'subs' && isLoggedIn ? (
        <div className={styles.container}>
          <div className={styles.filters}>
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
      ) : (
        <>
          <div className={styles.filters}>
            {(!isLoggedIn || showMobileSearch) && (
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
            )}
          </div>
          
          {/* Переключатель графов - только для ПК */}
          <div className={styles.graphSwitcherWrapper}>
            <GraphSwitcher />
          </div>
          
          {/* Загрузка */}
          {isLoading && (
            <div className={styles.loader}>
              <SpinnerLoader />
            </div>
          )}

          {/* Пустое состояние - нет мероприятий вообще */}
          {isEmpty && !isLoading && (
            <EmptyState
              message="Нет предстоящих мероприятий"
              subMessage="Следите за обновлениями, чтобы не пропустить новые события"
              icon={CalendarX}
            />
          )}

          {/* Пустой результат поиска */}
          {noSearchResults && !isEmpty && !isLoading && (
            <EmptyState
              message="Ничего не найдено"
              subMessage="Измените текст, даты или теги"
              icon={Search}
            />
          )}

          {/* Список событий */}
          {isSuccess && !noSearchResults && !isEmpty && (
            <>
              <div className={styles.eventsList} data-swipe-enabled="true">
                {filteredEvents.map((event: EventItem, index: number) => (
                  <div 
                    key={event._id} 
                    className={styles.eventCard}
                    style={{ 
                      '--delay': `${Math.min(index * 0.05, 0.5)}s`
                    } as React.CSSProperties}
                  >
                {/* <EventCardNew event={event} /> */}
                <EventCard event={event} />
                  </div>
                ))}
              </div>
              
              {/* Индикатор загрузки следующей страницы */}
              {hasNextPage && (
                <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                  {isFetchingNextPage && (
                    <div className={styles.loader}>
                      <SpinnerLoader />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
