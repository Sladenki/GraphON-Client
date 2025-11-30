'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { GraphService } from '@/services/graph.service'
import { useSelectedGraphId, useSetSelectedGraphId } from '@/stores/useUIStore'
import { UserService } from '@/services/user.service'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { SpinnerLoader } from '../SpinnerLoader/SpinnerLoader'
import styles from './GraphSwitcher.module.scss'
import { IGraphList } from '@/types/graph.interface'

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL

const GraphSwitcher: React.FC = () => {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const selectedGraphId = useSelectedGraphId()
  const setSelectedGraphId = useSetSelectedGraphId()
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Загружаем список глобальных графов
  const { data: globalGraphsResp, isLoading } = useQuery<IGraphList[]>({
    queryKey: ['graph/getGlobalGraphs'],
    queryFn: async () => {
      const res = await GraphService.getGlobalGraphs()
      return res.data as IGraphList[]
    }
  })

  const globalGraphs = globalGraphsResp || []
  const currentGraph = globalGraphs.find(g => g._id === selectedGraphId)

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
    if (graphId === selectedGraphId || isChanging) return

    setIsChanging(true)
    setIsOpen(false)

    try {
      // Обновляем состояние в Zustand store
      setSelectedGraphId(graphId)

      // Если пользователь авторизован, обновляем на сервере
      if (user) {
        await UserService.updateSelectedGraph(graphId)
        setUser({ ...user, selectedGraphId: graphId })
      }

      // Перезагружаем страницу для обновления данных
      router.refresh()
    } catch (error) {
      console.error('Error updating selected graph:', error)
    } finally {
      setTimeout(() => setIsChanging(false), 300)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loader}>
        <SpinnerLoader />
      </div>
    )
  }

  // Скрываем компонент если пользователь не студент
  if (user && (user as any).isStudent === false) {
    return null
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

