'use client'

import React, { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { ErrorState } from '@/components/global/ErrorState/ErrorState'
import { Search } from 'lucide-react'

import SchedulePopUp from '@/app/(main)/groups/SchedulePopUp/SchedulePopUp'
import SearchBar, { SearchTag } from '@/components/shared/SearchBar/SearchBar'
import { useFetchBunchData } from '@/hooks/useFetchBunchData'
import { useSearchWithTags } from '@/hooks/useSearchWithTags'
import { useSelectedGraphId } from '@/stores/useUIStore'
import { GraphInfo, IGraphList } from '@/types/graph.interface'
import styles from './GroupsList.module.scss'
import GroupBlock from '@/components/shared/GroupBlock/GroupBlock'
import { useAuth } from '@/providers/AuthProvider'
import { GraphService } from '@/services/graph.service'

export default function GroupsList() {
  const selectedGraphId = useSelectedGraphId()
  const { user, isLoggedIn } = useAuth()
  
  // Состояния для PopUp
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [popupGraphId, setPopupGraphId] = useState<string | null>(null)

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

  // Показываем "Мои группы" только если они присутствуют в текущем списке групп выбранного университета
  const ownedGroupsInCurrentList: GraphInfo[] = React.useMemo(() => {
    if (!managedGroups?.length || !allGraphs?.length) return []
    const allIds = new Set(allGraphs.map((g: IGraphList) => g._id))
    return managedGroups.filter((g) => allIds.has(g._id))
  }, [managedGroups, allGraphs])

  const ownedIdsSet = React.useMemo(() => {
    return new Set(ownedGroupsInCurrentList.map((g) => g._id))
  }, [ownedGroupsInCurrentList])

  // Убираем "мои группы" из общего списка, чтобы не было дублей
  const generalGraphs: IGraphList[] = React.useMemo(() => {
    if (!allGraphs?.length) return []
    if (ownedIdsSet.size === 0) return allGraphs
    return allGraphs.filter((g: IGraphList) => !ownedIdsSet.has(g._id))
  }, [allGraphs, ownedIdsSet])

  // Извлекаем доступные теги из данных групп (из parentGraphId.name)
  const availableTags: SearchTag[] = React.useMemo(() => {
    const tagMap = new Map<string, SearchTag>()
    
    generalGraphs.forEach((graph: IGraphList) => {
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
  }, [generalGraphs])

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
    data: generalGraphs,
    searchFields: ['name', 'about'],
    tagField: 'parentGraphId',
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
  const isLoading = isPostsFetching && !isEndPosts
  const hasData = generalGraphs.length > 0
  const hasError = !!error
  const noSearchResults = hasActiveFilters && filteredGraphs.length === 0

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

  return (
    <div className={styles.container}>
      {/* Мои группы (если пользователь владеет группами) */}
      {ownedGroupsInCurrentList.length > 0 && (
        <div className={styles.ownedSection}>
          <div className={styles.sectionTitle}>Мои группы</div>
          <div className={styles.grid} data-swipe-enabled="true">
            {ownedGroupsInCurrentList.map((g) => (
              <div key={g._id} className={styles.graphItem}>
                <GroupBlock
                  id={g._id}
                  name={g.name}
                  isSubToGraph={Boolean(g.isSubscribed)}
                  imgPath={g.imgPath}
                  about={g.about}
                  handleScheduleButtonClick={() => handleScheduleClick(g._id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Поиск и фильтры - всегда видимый */}
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
            Найдено: {filteredGraphs.length} из {generalGraphs.length} групп
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
                isSubToGraph={graph.isSubscribed}
                imgPath={graph.imgPath}
                about={graph.about}
                handleScheduleButtonClick={() => handleScheduleClick(graph._id)}
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

      <div ref={loaderRef} />
    </div>
  )
}
