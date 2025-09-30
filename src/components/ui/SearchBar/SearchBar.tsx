'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X, Filter, Tag } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import styles from './SearchBar.module.scss'

export interface SearchTag {
  _id: string
  name: string
}

export interface SearchBarProps {
  onSearch: (query: string) => void
  onTagFilter: (tagIds: string[]) => void
  placeholder?: string
  availableTags?: SearchTag[]
  showTagFilter?: boolean
  initialQuery?: string
  initialSelectedTags?: string[]
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onTagFilter,
  placeholder = "Поиск...",
  availableTags = [],
  showTagFilter = true,
  initialQuery = "",
  initialSelectedTags = [],
  className = ""
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags)
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  
  const searchInputRef = useRef<HTMLInputElement>(null)
  const tagFilterRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(query, 300)

  // Отправляем поисковый запрос при изменении
  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  // Отправляем фильтр тегов при изменении
  useEffect(() => {
    onTagFilter(selectedTags)
  }, [selectedTags, onTagFilter])

  // Закрываем фильтр тегов при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagFilterRef.current && !tagFilterRef.current.contains(event.target as Node)) {
        setIsTagFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const clearQuery = useCallback(() => {
    setQuery('')
    searchInputRef.current?.focus()
  }, [])

  const toggleTagFilter = useCallback(() => {
    setIsTagFilterOpen(prev => !prev)
  }, [])

  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId)
      } else {
        return [...prev, tagId]
      }
    })
  }, [])

  const clearAllTags = useCallback(() => {
    setSelectedTags([])
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isTagFilterOpen) {
        setIsTagFilterOpen(false)
      } else {
        searchInputRef.current?.blur()
      }
    }
  }, [isTagFilterOpen])

  const selectedTagsData = availableTags.filter(tag => selectedTags.includes(tag._id))
  const hasActiveFilters = query.trim() !== '' || selectedTags.length > 0

  return (
    <div className={`${styles.searchBar} ${className}`}>
      {/* Основная строка поиска */}
      <div className={styles.searchInputWrapper}>
        <div className={`${styles.searchInput} ${isFocused ? styles.focused : ''}`}>
          <Search 
            className={`${styles.searchIcon} ${isFocused ? styles.searchIconFocused : ''}`} 
            size={20} 
          />
          
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={styles.input}
          />
          
          {query && (
            <button
              onClick={clearQuery}
              className={styles.clearButton}
              aria-label="Очистить поиск"
            >
              <X size={16} />
            </button>
          )}
          
          {showTagFilter && availableTags.length > 0 && (
            <button
              onClick={toggleTagFilter}
              className={`${styles.filterButton} ${selectedTags.length > 0 ? styles.active : ''}`}
              aria-label="Фильтр по тегам"
            >
              <Filter size={18} />
              {selectedTags.length > 0 && (
                <span className={styles.tagCount}>{selectedTags.length}</span>
              )}
            </button>
          )}
        </div>

        {/* Индикатор активных фильтров */}
        {hasActiveFilters && (
          <div className={styles.activeFilters}>
            {query && (
              <span className={styles.queryFilter}>
                "{query}"
              </span>
            )}
            {selectedTagsData.map(tag => (
              <span key={tag._id} className={styles.tagFilter}>
                <Tag size={12} />
                {tag.name}
                <button
                  onClick={() => handleTagToggle(tag._id)}
                  className={styles.removeTag}
                  aria-label={`Убрать тег ${tag.name}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setQuery('')
                clearAllTags()
              }}
              className={styles.clearAllButton}
              aria-label="Очистить все фильтры"
            >
              Очистить все
            </button>
          </div>
        )}
      </div>

      {/* Выпадающий список тегов */}
      {isTagFilterOpen && availableTags.length > 0 && (
        <div ref={tagFilterRef} className={styles.tagFilterDropdown}>
          <div className={styles.tagFilterHeader}>
            <span className={styles.tagFilterTitle}>Теги</span>
            {selectedTags.length > 0 && (
              <button
                onClick={clearAllTags}
                className={styles.clearTagsButton}
              >
                Очистить все
              </button>
            )}
          </div>
          
          <div className={styles.tagList}>
            {availableTags.map(tag => (
              <button
                key={tag._id}
                onClick={() => handleTagToggle(tag._id)}
                className={`${styles.tagOption} ${selectedTags.includes(tag._id) ? styles.selected : ''}`}
              >
                <Tag size={14} />
                <span>{tag.name}</span>
                {selectedTags.includes(tag._id) && (
                  <X size={14} className={styles.tagRemoveIcon} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
