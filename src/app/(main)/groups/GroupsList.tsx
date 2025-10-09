'use client'

import React, { useState, useCallback } from 'react'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import { ErrorState } from '@/components/global/ErrorState/ErrorState'

import SchedulePopUp from '@/components/ui/SchedulePopUp/SchedulePopUp'
import SearchBar, { SearchTag } from '@/components/ui/SearchBar/SearchBar'
import { useFetchBunchData } from '@/hooks/useFetchBunchData'
import { useSearchWithTags } from '@/hooks/useSearchWithTags'
import { useSelectedGraphId } from '@/stores/useUIStore'
import { IGraphList } from '@/types/graph.interface'
import styles from './GroupsList.module.scss'
import GraphBlock from '@/components/ui/GraphBlock/GraphBlock'

export default function GroupsList() {
  const selectedGraphId = useSelectedGraphId()
  
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

  // Извлекаем доступные теги из данных групп (из parentGraphId.name)
  const availableTags: SearchTag[] = React.useMemo(() => {
    const tagMap = new Map<string, SearchTag>()
    
    allGraphs.forEach((graph: IGraphList) => {
      const parentGraph = (graph as any).parentGraphId
      if (parentGraph && typeof parentGraph === 'object' && parentGraph.name) {
        // Используем название как ключ для избежания дублирования
        const tagKey = parentGraph.name.toLowerCase().trim()
        const tagId = parentGraph._id || parentGraph.name.toLowerCase().replace(/\s+/g, '_')
        tagMap.set(tagKey, { _id: tagId, name: parentGraph.name })
      }
    })
    
    const tags = Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    console.log('Available tags:', tags)
    console.log('Total groups processed:', allGraphs.length)
    console.log('Unique parentGraph names found:', tagMap.size)
    return tags
  }, [allGraphs])

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
    data: allGraphs,
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
  const hasData = allGraphs.length > 0
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

  // Убираем ранний возврат для noSearchResults - поиск должен оставаться видимым

  return (
    <div className={styles.container}>
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
              Найдено: {filteredGraphs.length} из {allGraphs.length} групп
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
            emoji="🔍"
          />
        </div>
      )}
      
      {/* Показываем сетку групп если есть данные и есть результаты */}
      {hasData && !noSearchResults && (
        <div className={styles.grid}>
          {filteredGraphs.map((graph: IGraphList) => (
            <div key={graph._id} className={styles.graphItem}>
              <GraphBlock
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
