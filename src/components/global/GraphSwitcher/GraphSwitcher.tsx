'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { GraphService } from '@/services/graph.service'
import { useSelectedGraphId, useSetSelectedGraphId, useUIStore } from '@/stores/useUIStore'
import { UserService } from '@/services/user.service'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { SpinnerLoader } from '../SpinnerLoader/SpinnerLoader'
import styles from './GraphSwitcher.module.scss'
import { IGraphList } from '@/types/graph.interface'

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL

// ID университетов для фильтрации
const KBKK_ID = '6896447465255a1c4ed48eaf'
const KGTU_ID = '67a499dd08ac3c0df94d6ab7'

const GraphSwitcher: React.FC = () => {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const selectedGraphId = useSelectedGraphId()
  const setSelectedGraphId = useSetSelectedGraphId()
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [isGuestNonStudent, setIsGuestNonStudent] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Синхронизируем статус гостя (не студент) с localStorage
  useEffect(() => {
    if (user) {
      setIsGuestNonStudent(false)
      return
    }

    if (typeof window === 'undefined') return

    const updateGuestStatus = () => {
      const stored = window.localStorage.getItem('isStudent')
      setIsGuestNonStudent(stored === 'false')
    }

    updateGuestStatus()

    window.addEventListener('storage', updateGuestStatus)

    return () => {
      window.removeEventListener('storage', updateGuestStatus)
    }
  }, [user, selectedGraphId])

  // Загружаем список глобальных графов
  const { data: globalGraphsResp, isLoading } = useQuery<IGraphList[]>({
    queryKey: ['graph/getGlobalGraphs'],
    queryFn: async () => {
      const res = await GraphService.getGlobalGraphs()
      // Нормализуем ответ - может быть res.data или сам res
      const data = res.data || res
      // Убеждаемся, что это массив
      return Array.isArray(data) ? data : []
    }
  })

  // Фильтруем графы в зависимости от universityGraphId пользователя
  const globalGraphs = useMemo(() => {
    // Убеждаемся, что это массив
    let graphs: IGraphList[] = []
    
    if (Array.isArray(globalGraphsResp)) {
      graphs = globalGraphsResp
    } else if (globalGraphsResp && typeof globalGraphsResp === 'object' && 'data' in globalGraphsResp) {
      // Если это объект с полем data
      graphs = Array.isArray((globalGraphsResp as any).data) ? (globalGraphsResp as any).data : []
    }
    
    const universityGraphId = user?.universityGraphId

    if (!universityGraphId) return graphs

    // Если пользователь из КБК - скрываем КГТУ
    if (universityGraphId === KBKK_ID) {
      return graphs.filter(g => g._id !== KGTU_ID)
    }

    // Если пользователь из КГТУ - скрываем КБК
    if (universityGraphId === KGTU_ID) {
      return graphs.filter(g => g._id !== KBKK_ID)
    }

    return graphs
  }, [globalGraphsResp, user?.universityGraphId])

  // Мемоизируем currentGraph для правильной реактивности
  const currentGraph = useMemo(() => {
    if (!Array.isArray(globalGraphs) || !selectedGraphId) {
      return undefined
    }
    return globalGraphs.find(g => g._id === selectedGraphId)
  }, [globalGraphs, selectedGraphId])

  // Формируем полный URL изображения
  const getImageUrl = (imgPath: string | undefined) => {
    if (!imgPath) return null
    return `${BASE_S3_URL}/${imgPath}`
  }

  const currentImageUrl = useMemo(() => getImageUrl(currentGraph?.imgPath), [currentGraph?.imgPath])

  // Обработчик ошибки загрузки изображения
  const handleImageError = (graphId: string) => {
    setImageErrors(prev => new Set(prev).add(graphId))
  }

  // Проверяем, нужно ли показывать placeholder вместо изображения
  const shouldShowPlaceholder = (graphId: string, imgPath: string | undefined) => {
    if (!imgPath) return true
    if (imageErrors.has(graphId)) return true
    return false
  }

  // Закрываем dropdown при клике вне его и по ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const handleGraphSelect = async (graphId: string) => {
    if (graphId === selectedGraphId || isChanging) {
      console.log('GraphSwitcher: Early return', { graphId, selectedGraphId, isChanging })
      return
    }

    console.log('GraphSwitcher: handleGraphSelect called', { 
      graphId, 
      currentSelectedGraphId: selectedGraphId, 
      user: !!user,
      storeState: useUIStore.getState().selectedGraphId
    })
    
    setIsChanging(true)
    setIsOpen(false)

    const previousGraphId = selectedGraphId

    try {
      // Обновляем состояние в Zustand store (сохранится в localStorage)
      console.log('GraphSwitcher: Calling setSelectedGraphId with', graphId)
      
      // Вызываем функцию напрямую из store для гарантии
      const store = useUIStore.getState()
      console.log('GraphSwitcher: Store before update', { selectedGraphId: store.selectedGraphId })
      
      // Используем функцию напрямую из store, а не из хука
      useUIStore.getState().setSelectedGraphId(graphId)
      
      // Проверяем сразу после вызова
      const storeAfter = useUIStore.getState()
      console.log('GraphSwitcher: Store after setSelectedGraphId call', { 
        selectedGraphId: storeAfter.selectedGraphId,
        success: storeAfter.selectedGraphId === graphId
      })
      
      // Дополнительная проверка через таймаут
      setTimeout(() => {
        const finalState = useUIStore.getState()
        console.log('GraphSwitcher: Final store state after timeout', { 
          selectedGraphId: finalState.selectedGraphId,
          expected: graphId,
          match: finalState.selectedGraphId === graphId
        })
        
        if (finalState.selectedGraphId !== graphId) {
          console.error('GraphSwitcher: State was not updated correctly!', {
            expected: graphId,
            actual: finalState.selectedGraphId
          })
        }
      }, 100)

      // Если пользователь авторизован, обновляем на сервере
      if (user) {
        await UserService.updateSelectedGraph(graphId)
        setUser({ ...user, selectedGraphId: graphId })
        // Для авторизованных пользователей обновляем страницу
        router.refresh()
      } else {
        // Для неавторизованных пользователей НЕ вызываем router.refresh(),
        // так как это может сбросить состояние из-за логики в layout.tsx
        // Zustand автоматически обновит все подписанные компоненты
        console.log('GraphSwitcher: Guest user - state updated in store, no refresh needed')
      }
    } catch (error) {
      console.error('GraphSwitcher: Error updating selected graph:', error)
      // В случае ошибки возвращаем предыдущее значение
      setSelectedGraphId(previousGraphId)
    } finally {
      setTimeout(() => setIsChanging(false), 300)
    }
  }

  const isUserNonStudent = Boolean(user && (user as any).isStudent === false)
  // Для неавторизованных пользователей: скрываем только если НЕ студент И НЕ выбран университет
  const shouldHideForGuest = !user && isGuestNonStudent && !selectedGraphId

  if (isUserNonStudent || shouldHideForGuest) {
    return null
  }

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <SpinnerLoader />
      </div>
    )
  }

  // Скрываем компонент если нет графов или если список состоит только из одного элемента
  if (globalGraphs.length === 0 || globalGraphs.length === 1) {
    return null
  }

  return (
    <div className={styles.switcher} ref={dropdownRef}>
      <button
        className={`${styles.currentGraph} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        aria-label="Переключить университет"
      >
        {currentImageUrl && !shouldShowPlaceholder(selectedGraphId || '', currentGraph?.imgPath) ? (
          <img
            src={currentImageUrl}
            alt={currentGraph?.name || 'Университет'}
            className={styles.graphImage}
            onError={() => handleImageError(selectedGraphId || '')}
          />
        ) : (
          <div className={styles.graphImagePlaceholder}>
            {currentGraph?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <span className={styles.graphName}>
          {currentGraph?.name || 'Выберите университет'}
        </span>
        <ChevronDown 
          size={18} 
          className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownContent}>
            {globalGraphs.map((graph) => {
              const isSelected = graph._id === selectedGraphId
              return (
                <button
                  key={graph._id}
                  className={`${styles.dropdownItem} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleGraphSelect(graph._id)}
                  disabled={isChanging}
                >
                  {getImageUrl(graph.imgPath) && !shouldShowPlaceholder(graph._id, graph.imgPath) ? (
                    <img
                      src={getImageUrl(graph.imgPath)!}
                      alt={graph.name}
                      className={styles.itemImage}
                      onError={() => handleImageError(graph._id)}
                    />
                  ) : (
                    <div className={styles.itemImagePlaceholder}>
                      {graph.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className={styles.itemName}>{graph.name}</span>
                  {isSelected && (
                    <Check size={20} className={styles.checkIcon} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default GraphSwitcher

