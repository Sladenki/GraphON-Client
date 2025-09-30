'use client'

import { useState, useCallback, useMemo } from 'react'
import { SearchTag } from '@/components/ui/SearchBar/SearchBar'

export interface UseSearchWithTagsOptions<T> {
  data: T[]
  searchFields: (keyof T)[]
  tagField?: keyof T
  tagIdField?: keyof T
  initialQuery?: string
  initialSelectedTags?: string[]
}

export interface UseSearchWithTagsReturn<T> {
  query: string
  selectedTags: string[]
  filteredData: T[]
  hasActiveFilters: boolean
  setQuery: (query: string) => void
  setSelectedTags: (tags: string[]) => void
  clearFilters: () => void
  clearQuery: () => void
  clearTags: () => void
}

export function useSearchWithTags<T>({
  data,
  searchFields,
  tagField,
  tagIdField = '_id' as keyof T,
  initialQuery = '',
  initialSelectedTags = []
}: UseSearchWithTagsOptions<T>): UseSearchWithTagsReturn<T> {
  const [query, setQuery] = useState(initialQuery)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags)

  // Фильтрация данных
  const filteredData = useMemo(() => {
    let result = [...data]

    // Фильтрация по текстовому запросу
    if (query.trim()) {
      const searchQuery = query.toLowerCase().trim()
      result = result.filter(item => {
        return searchFields.some(field => {
          const value = item[field]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchQuery)
          }
          return false
        })
      })
    }

    // Фильтрация по тегам
    if (selectedTags.length > 0 && tagField) {
      result = result.filter(item => {
        const itemTags = item[tagField]
        if (Array.isArray(itemTags)) {
          // Если теги - это массив объектов с _id
          return itemTags.some((tag: any) => {
            if (typeof tag === 'object' && tag !== null) {
              return selectedTags.includes(tag[tagIdField as string])
            }
            return false
          })
        } else if (typeof itemTags === 'string') {
          // Если тег - это строка (ID тега)
          return selectedTags.includes(itemTags)
        }
        return false
      })
    }

    return result
  }, [data, query, selectedTags, searchFields, tagField, tagIdField])

  const hasActiveFilters = useMemo(() => {
    return query.trim() !== '' || selectedTags.length > 0
  }, [query, selectedTags])

  const clearFilters = useCallback(() => {
    setQuery('')
    setSelectedTags([])
  }, [])

  const clearQuery = useCallback(() => {
    setQuery('')
  }, [])

  const clearTags = useCallback(() => {
    setSelectedTags([])
  }, [])

  return {
    query,
    selectedTags,
    filteredData,
    hasActiveFilters,
    setQuery,
    setSelectedTags,
    clearFilters,
    clearQuery,
    clearTags
  }
}

// Утилита для получения уникальных тегов из данных
export function extractTagsFromData<T>(
  data: T[],
  tagField: keyof T,
  tagIdField: keyof T = '_id' as keyof T,
  tagNameField: keyof T = 'name' as keyof T
): SearchTag[] {
  const tagMap = new Map<string, SearchTag>()

  data.forEach(item => {
    const itemTags = item[tagField]
    if (Array.isArray(itemTags)) {
      itemTags.forEach((tag: any) => {
        if (typeof tag === 'object' && tag !== null) {
          const id = tag[tagIdField as string]
          const name = tag[tagNameField as string]
          if (id && name) {
            tagMap.set(id, { _id: id, name })
          }
        }
      })
    }
  })

  return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}
