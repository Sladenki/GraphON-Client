'use client'

import React, { useState, useCallback } from 'react'
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader'
import { EmptyState } from '@/components/global/EmptyState/EmptyState'
import GraphBlock from '@/components/ui/GraphBlock/GraphBlock'
import SchedulePopUp from '@/components/ui/SchedulePopUp/SchedulePopUp'
import InfoGraphPopUp from '@/components/ui/InfoGraphPopUp/InfoGraphPopUp'
import { useFetchBunchData } from '@/hooks/useFetchBunchData'
import { useDebounce } from '@/hooks/useDebounce'
import { useSearchQuery, useSelectedGraphId } from '@/stores/useUIStore'
import { IGraphList } from '@/types/graph.interface'
import styles from './GroupsList.module.scss'

export default function GroupsList() {
  const searchQuery = useSearchQuery()
  const selectedGraphId = useSelectedGraphId()
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
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

  // Фильтрация графов
  const filteredGraphs = React.useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return allGraphs
    }

    const query = debouncedSearchQuery.toLowerCase().trim()
    return allGraphs.filter((graph: IGraphList) => 
      graph?.name?.toLowerCase().includes(query)
    )
  }, [allGraphs, debouncedSearchQuery])

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

  // Состояния загрузки
  const isLoading = isPostsFetching && !isEndPosts
  const hasData = allGraphs.length > 0
  const hasError = !!error
  const noSearchResults = debouncedSearchQuery && filteredGraphs.length === 0

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
      {isLoading && (
        <div className={styles.loader}>
          <SpinnerLoader />
        </div>
      )}
      
      {hasData && (
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
