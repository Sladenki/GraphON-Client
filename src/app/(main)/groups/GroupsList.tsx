'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { ErrorState } from '@/components/global/ErrorState/ErrorState'
import { Search, SlidersHorizontal } from 'lucide-react'

import SchedulePopUp from '@/app/(main)/groups/SchedulePopUp/SchedulePopUp'
import SearchBar, { SearchTag } from '@/components/shared/SearchBar/SearchBar'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useFetchBunchData } from '@/hooks/useFetchBunchData'
import { useSearchWithTags } from '@/hooks/useSearchWithTags'
import { useSelectedGraphId } from '@/stores/useUIStore'
import { GraphInfo, IGraphList } from '@/types/graph.interface'
import styles from './GroupsList.module.scss'
import GroupBlock from '@/components/shared/GroupBlock/GroupBlock'
import { useAuth } from '@/providers/AuthProvider'
import { GraphService } from '@/services/graph.service'
import PillTabs from '@/components/shared/PillTabs/PillTabs'
import { GraphSubsService } from '@/services/graphSubs.service'
import { useRouter, useSearchParams } from 'next/navigation'

type GroupsPillTab = 'manage' | 'groups' | 'subs'

export default function GroupsList() {
  const selectedGraphId = useSelectedGraphId()
  const { user, isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Состояния для PopUp
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [popupGraphId, setPopupGraphId] = useState<string | null>(null)
  
  // Определяем начальную вкладку из URL или по умолчанию
  const initialTab: GroupsPillTab = useMemo(() => {
    const tab = searchParams.get('tab')
    if (tab === 'subs') return 'subs'
    if (tab === 'manage') return 'manage'
    return 'groups'
  }, [searchParams])
  
  const [activeTab, setActiveTab] = useState<GroupsPillTab>(initialTab)

  // Загрузка данных
  const { 
    allPosts: allGraphs, 
    isPostsFetching, 
    isEndPosts, 
    loaderRef, 
    error 
  } = useFetchBunchData(
    `graph/getAllChildrenGraphs/${selectedGraphId}`,
    [],
    true
  )

  // IDs групп, которыми владеет/управляет пользователь (как раньше было в /manage)
  const managedIds: string[] = React.useMemo(() => {
    if (!user) return []
    const anyUser: any = user as any
    const raw = anyUser?.managed_graph_id ?? anyUser?.managedGraphIds ?? []
    return Array.isArray(raw) ? raw.filter(Boolean) : []
  }, [user])

  const { data: managedGroups } = useQuery({
    queryKey: ['managedGroups', managedIds],
    queryFn: async () => {
      if (managedIds.length === 0) return []
      const results = await Promise.all(managedIds.map((id) => GraphService.getGraphById(id)))
      return results
    },
    enabled: isLoggedIn && managedIds.length > 0,
    staleTime: 5 * 60_000,
  })

  // Синхронизация вкладки с URL и авторизацией
  useEffect(() => {
    if (!isLoggedIn && activeTab === 'subs') {
      setActiveTab('groups')
    } else {
      setActiveTab(initialTab)
    }
  }, [isLoggedIn, initialTab])

  const setTabInUrl = (tab: GroupsPillTab) => {
    const sp = new URLSearchParams(searchParams.toString())
    if (tab === 'subs') sp.set('tab', 'subs')
    else if (tab === 'manage') sp.set('tab', 'manage')
    else sp.delete('tab')
    const qs = sp.toString()
    router.replace(qs ? `/groups/?${qs}` : '/groups/')
  }

  const handleTabChange = (tab: GroupsPillTab | string | number) => {
    const tabKey = tab as GroupsPillTab
    if (!isLoggedIn && tabKey === 'subs') return
    setActiveTab(tabKey)
    setTabInUrl(tabKey)
    // Очищаем поиск и фильтры при переключении вкладки
    setQuery('')
    setSelectedTags([])
  }

  // Показываем "Мои группы" только если они присутствуют в текущем списке групп выбранного университета
  const ownedGroupsInCurrentList: GraphInfo[] = React.useMemo(() => {
    if (!managedGroups?.length || !allGraphs?.length) return []
    const allIds = new Set(allGraphs.map((g: IGraphList) => g._id))
    return managedGroups.filter((g) => allIds.has(g._id))
  }, [managedGroups, allGraphs])
  
  // Загрузка подписок пользователя
  const { data: subscribedGroupsData, isLoading: isLoadingSubs } = useQuery({
    queryKey: ['userSubscribedGraphs'],
    queryFn: () => GraphSubsService.getUserSubscribedGraphs(),
    enabled: isLoggedIn && activeTab === 'subs',
    staleTime: 5 * 60_000,
  })
  
  const subscribedGroups: IGraphList[] = useMemo(() => {
    if (!subscribedGroupsData?.data) return []
    return subscribedGroupsData.data
  }, [subscribedGroupsData])

  const ownedIdsSet = React.useMemo(() => {
    return new Set(ownedGroupsInCurrentList.map((g) => g._id))
  }, [ownedGroupsInCurrentList])

  // Убираем "мои группы" из общего списка, чтобы не было дублей
  const generalGraphs: IGraphList[] = React.useMemo(() => {
    if (!allGraphs?.length) return []
    if (ownedIdsSet.size === 0) return allGraphs
    return allGraphs.filter((g: IGraphList) => !ownedIdsSet.has(g._id))
  }, [allGraphs, ownedIdsSet])

  // Определяем данные для текущей вкладки
  const currentTabData: IGraphList[] = useMemo(() => {
    if (activeTab === 'manage') {
      return ownedGroupsInCurrentList as any[]
    } else if (activeTab === 'subs') {
      return subscribedGroups as any[]
    }
    return generalGraphs
  }, [activeTab, ownedGroupsInCurrentList, subscribedGroups, generalGraphs])

  // Извлекаем доступные теги из данных групп (из parentGraphId.name)
  const availableTags: SearchTag[] = React.useMemo(() => {
    const tagMap = new Map<string, SearchTag>()
    
    currentTabData.forEach((graph: IGraphList) => {
      const parentGraph = (graph as any).parentGraphId
      if (parentGraph && typeof parentGraph === 'object' && parentGraph.name) {
        // Используем название как ключ для избежания дублирования
        const tagKey = parentGraph.name.toLowerCase().trim()
        const tagId = parentGraph._id || parentGraph.name.toLowerCase().replace(/\s+/g, '_')
        tagMap.set(tagKey, { _id: tagId, name: parentGraph.name })
      }
    })
    
    const tags = Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    return tags
  }, [currentTabData])

  // Используем хук для поиска и фильтрации
  const {
    query,
    selectedTags,
    filteredData: filteredGraphs,
    hasActiveFilters,
    setQuery,
    setSelectedTags,
    clearFilters
  } = useSearchWithTags({
    data: currentTabData,
    searchFields: ['name', 'about'],
    // В данных графа поле parentGraphId может не быть описано в IGraphList типах,
    // но фактически приходит с API — приводим к any, чтобы не ломать типизацию.
    tagField: 'parentGraphId' as any,
    tagIdField: '_id',
    tagNameField: 'name'
  })

  // Обработчики PopUp
  const handleScheduleClick = useCallback((id: string) => {
    setPopupGraphId(id)
    setIsScheduleOpen(true)
  }, [])

  const closeSchedule = useCallback(() => setIsScheduleOpen(false), [])

  // Обработчики поиска
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery)
  }, [setQuery])

  const handleTagFilter = useCallback((tagIds: string[]) => {
    setSelectedTags(tagIds)
  }, [setSelectedTags])

  // Состояния загрузки
  const isLoading = (isPostsFetching && !isEndPosts) || (activeTab === 'subs' && isLoadingSubs)
  const hasData = currentTabData.length > 0
  const hasError = !!error
  const noSearchResults = hasActiveFilters && filteredGraphs.length === 0
  const hasManagedGroups = ownedGroupsInCurrentList.length > 0

  // Рендер состояний
  if (hasError) {
    return (
      <ErrorState
        message="Ошибка загрузки данных"
        subMessage="Не удалось загрузить список групп"
        onRetry={() => window.location.reload()}
      />
    )
  }

  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleFilterClick = useCallback(() => {
    // Пока что просто очищаем фильтры при клике на иконку фильтров
    clearFilters()
  }, [clearFilters])

  return (
    <div className={styles.container}>
      {/* PillTabs для переключения между вкладками */}
      <div className={styles.tabsRow}>
        {isMobile && (
          <button className={styles.filterButton} aria-label="Фильтры" onClick={handleFilterClick}>
            <SlidersHorizontal />
          </button>
        )}
        <div className={styles.pillsWrapper}>
          <PillTabs
            options={[
              ...(hasManagedGroups ? [{ key: 'manage', label: 'Управление' }] : []),
              { key: 'groups', label: 'Группы' },
              ...(isLoggedIn ? [{ key: 'subs', label: 'Подписки' }] : []),
            ]}
            activeKey={activeTab}
            onChange={handleTabChange}
          />
        </div>
      </div>

      {/* Поиск и фильтры - скрыт на мобильных */}
      <div className={styles.searchSection}>
        <SearchBar
          onSearch={handleSearch}
          onTagFilter={handleTagFilter}
          placeholder="Поиск групп..."
          availableTags={availableTags}
          showTagFilter={true}
          initialQuery={query}
          initialSelectedTags={selectedTags}
        />
        
        {/* Информация о результатах */}
        {hasActiveFilters && (
          <div className={styles.searchResults}>
            Найдено: {filteredGraphs.length} из {currentTabData.length} групп
          </div>
        )}
      </div>
 

      {/* Состояния загрузки и контента */}
      {isLoading && (
        <div className={styles.loader}>
          <SpinnerLoader />
        </div>
      )}
      
      {/* Показываем EmptyState если нет результатов поиска */}
      {noSearchResults && (
        <div className={styles.emptyStateWrapper}>
          <EmptyState
            message="Ничего не найдено"
            subMessage="Попробуйте изменить параметры поиска"
            icon={Search}
          />
        </div>
      )}
      
      {/* Показываем сетку групп если есть данные и есть результаты */}
      {hasData && !noSearchResults && (
        <div className={styles.grid} data-swipe-enabled="true">
          {filteredGraphs.map((graph: IGraphList) => (
            <div key={graph._id} className={styles.graphItem}>
              <GroupBlock
                id={graph._id}
                name={graph.name}
                isSubToGraph={(graph as any).isSubscribed ?? false}
                imgPath={graph.imgPath}
                about={graph.about}
                subscribersCount={(graph as any).subsNum ?? 0}
                specializations={[
                  ...(((graph as any).parentGraphId?.name ? [{ key: String((graph as any).parentGraphId?._id ?? (graph as any).parentGraphId?.name), label: String((graph as any).parentGraphId?.name) }] : []) as any[]),
                  ...((Array.isArray((graph as any).tags) ? (graph as any).tags : []).map((t: any) => ({ key: String(t?._id ?? t?.name), label: String(t?.name) })).filter((x: any) => x.label && x.label !== 'undefined')),
                ]}
                handleScheduleButtonClick={() => handleScheduleClick(graph._id)}
                layout="horizontal"
              />
            </div>
          ))}
        </div>
      )}

      {/* PopUp компоненты */}
      {isScheduleOpen && popupGraphId && (
        <SchedulePopUp 
          graphId={popupGraphId} 
          isSchedulePopupOpen={isScheduleOpen} 
          closeSchedulePopup={closeSchedule} 
        />
      )}

      {/* Loader ref только для вкладки "Группы" с бесконечным скроллом */}
      {activeTab === 'groups' && <div ref={loaderRef} />}
    </div>
  )
}
