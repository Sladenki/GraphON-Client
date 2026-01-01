'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { GraphService } from '@/services/graph.service'
import { useSelectedGraphId, useSetSelectedGraphId, useUIStore } from '@/stores/useUIStore'
import { UserService } from '@/services/user.service'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import styles from './GraphSwitcherIcon.module.scss'
import { IGraphList } from '@/types/graph.interface'

const BASE_S3_URL = process.env.NEXT_PUBLIC_S3_URL

const GraphSwitcherIcon: React.FC = () => {
  const { user, setUser } = useAuth()
  const router = useRouter()
  const selectedGraphId = useSelectedGraphId()
  const setSelectedGraphId = useSetSelectedGraphId()
  const [isOpen, setIsOpen] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { data: globalGraphsData, isLoading } = useQuery({
    queryKey: ['graph/getAllGlobalGraphs'],
    queryFn: () => GraphService.getAllGlobalGraphs(),
  })

  const globalGraphs = globalGraphsData?.data || []

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

  if (isLoading || globalGraphs.length === 0 || globalGraphs.length === 1) {
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

