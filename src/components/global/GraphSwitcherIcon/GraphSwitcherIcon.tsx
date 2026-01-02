'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { GraphService } from '@/services/graph.service'
import { useSelectedGraphId, useSetSelectedGraphId, useUIStore } from '@/stores/useUIStore'
import { UserService } from '@/services/user.service'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import styles from './GraphSwitcherIcon.module.scss'
import { IGraphList } from '@/types/graph.interface'
import { CITY_GRAPH_ID } from '@/constants/sidebar'

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL

// ID университетов для фильтрации
const KBKK_ID = '6896447465255a1c4ed48eaf'
const KGTU_ID = '67a499dd08ac3c0df94d6ab7'

const GraphSwitcherIcon: React.FC = () => {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const selectedGraphId = useSelectedGraphId()
  const setSelectedGraphId = useSetSelectedGraphId()
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: globalGraphsResp, isLoading } = useQuery<IGraphList[]>({
    queryKey: ['graph/getGlobalGraphs'],
    queryFn: async () => {
      const res = await GraphService.getGlobalGraphs()
      // Нормализуем ответ - может быть res.data или сам res
      const data = res.data || res
      // Убеждаемся, что это массив
      return Array.isArray(data) ? data : []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Фильтруем графы: показываем КБК, КГТУ и Калининград для переключения между ними
  // В отличие от GraphSwitcher, здесь всегда показываем все варианты, независимо от universityGraphId
  const globalGraphs = useMemo(() => {
    // Убеждаемся, что это массив
    let graphs: IGraphList[] = []
    
    if (Array.isArray(globalGraphsResp)) {
      graphs = globalGraphsResp
    } else if (globalGraphsResp && typeof globalGraphsResp === 'object' && 'data' in globalGraphsResp) {
      // Если это объект с полем data
      graphs = Array.isArray((globalGraphsResp as any).data) ? (globalGraphsResp as any).data : []
    }
    
    // Фильтруем КБК, КГТУ и Калининград (показываем все для переключения)
    return graphs.filter((graph: IGraphList) => 
      graph._id === KBKK_ID || graph._id === KGTU_ID || graph._id === CITY_GRAPH_ID
    )
  }, [globalGraphsResp])

  const currentGraph = globalGraphs.find((g: IGraphList) => g._id === selectedGraphId)

  const getImageUrl = (imgPath?: string): string | null => {
    if (!imgPath) return null
    if (imgPath.startsWith('http')) return imgPath
    return `${BASE_S3_URL}/${imgPath}`
  }

  const shouldShowPlaceholder = (graphId: string, imgPath?: string): boolean => {
    return imageErrors.has(graphId) || !imgPath
  }

  const handleImageError = (graphId: string) => {
    setImageErrors((prev) => new Set(prev).add(graphId))
  }

  const currentImageUrl = currentGraph ? getImageUrl(currentGraph.imgPath) : null

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

    const previousGraphId = selectedGraphId

    try {
      useUIStore.getState().setSelectedGraphId(graphId)

      if (user) {
        await UserService.updateSelectedGraph(graphId)
        setUser({ ...user, selectedGraphId: graphId })
        router.refresh()
      }
    } catch (error) {
      console.error('GraphSwitcherIcon: Error updating selected graph:', error)
      setSelectedGraphId(previousGraphId)
    } finally {
      setTimeout(() => setIsChanging(false), 300)
    }
  }

  // Показываем компонент только если есть хотя бы 2 графа для переключения
  if (isLoading) {
    return null
  }

  // Если графов меньше двух, не показываем компонент (нечего переключать)
  if (globalGraphs.length < 2) {
    return null
  }

  return (
    <div className={styles.switcherIcon} ref={dropdownRef}>
      <button
        className={`${styles.iconButton} ${isOpen ? styles.open : ''}`}
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

export default GraphSwitcherIcon

