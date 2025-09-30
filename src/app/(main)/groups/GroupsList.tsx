'use client'

import React, { useState, useCallback } from 'react'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import GraphBlock from '@/components/ui/GraphBlock/GraphBlock'
import SchedulePopUp from '@/components/ui/SchedulePopUp/SchedulePopUp'
import InfoGraphPopUp from '@/components/ui/InfoGraphPopUp/InfoGraphPopUp'
import SearchBar, { SearchTag } from '@/components/ui/SearchBar/SearchBar'
import { useFetchBunchData } from '@/hooks/useFetchBunchData'
import { useSearchWithTags, extractTagsFromData } from '@/hooks/useSearchWithTags'
import { useSelectedGraphId } from '@/stores/useUIStore'
import { IGraphList } from '@/types/graph.interface'
import styles from './GroupsList.module.scss'

export default function GroupsList() {
  const selectedGraphId = useSelectedGraphId()
  
  // Состояния для PopUp
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
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

  // Статический список доступных тегов (из требований)
  const staticTags: SearchTag[] = [
    { _id: '1', name: 'Самоуправление' },
    { _id: '2', name: 'Отряды' },
    { _id: '3', name: 'Волонтерство' },
    { _id: '4', name: 'Творчество' },
    { _id: '5', name: 'Спорт' },
    { _id: '6', name: 'Медиа' },
    { _id: '7', name: 'Наука' },
    { _id: '8', name: 'Литература' },
    { _id: '9', name: 'Трудоустройство' },
    { _id: '10', name: 'Военно-патриотизм' }
  ]

  // Извлекаем доступные теги из данных групп
  const dataTags: SearchTag[] = extractTagsFromData(
    allGraphs,
    'tags',
    '_id',
    'name'
  )

  // Объединяем статические теги с тегами из данных
  const availableTags: SearchTag[] = React.useMemo(() => {
    const tagMap = new Map<string, SearchTag>()
    
    // Добавляем статические теги
    staticTags.forEach(tag => tagMap.set(tag._id, tag))
    
    // Добавляем теги из данных (перезаписывают статические если есть конфликт)
    dataTags.forEach(tag => tagMap.set(tag._id, tag))
    
    return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [dataTags])

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
    tagField: 'tags',
    tagIdField: '_id'
  })

  // Обработчики PopUp
  const handleScheduleClick = useCallback((id: string) => {
    setPopupGraphId(id)
    setIsScheduleOpen(true)
  }, [])

  const handleInfoClick = useCallback((id: string) => {
    setPopupGraphId(id)
    setIsInfoOpen(true)
  }, [])

  const closeSchedule = useCallback(() => setIsScheduleOpen(false), [])
  const closeInfo = useCallback(() => setIsInfoOpen(false), [])

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
      <div className={styles.error}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorText}>Ошибка загрузки данных</div>
        <button 
          className={styles.retryButton} 
          onClick={() => window.location.reload()}
        >
          Повторить
        </button>
      </div>
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
                handleInfoGraphButtonClick={() => handleInfoClick(graph._id)}
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

      {isInfoOpen && popupGraphId && (
        <InfoGraphPopUp 
          graphId={popupGraphId} 
          isInfoGraphPopupOpen={isInfoOpen} 
          closeInfoGraphPopup={closeInfo} 
        />
      )}

      <div ref={loaderRef} />
    </div>
  )
}
