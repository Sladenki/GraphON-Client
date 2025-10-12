'use client'

import React, { useState, useCallback, useRef, useEffect, useId } from 'react'
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
  // Date filter (optional). When provided, date controls appear inside dropdown
  showDateFilter?: boolean
  dateFrom?: string
  dateTo?: string
  includeTbd?: boolean
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  onIncludeTbdChange?: (value: boolean) => void
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
  showDateFilter = false,
  dateFrom,
  dateTo,
  includeTbd,
  onDateFromChange,
  onDateToChange,
  onIncludeTbdChange,
  initialQuery = "",
  initialSelectedTags = [],
  className = ""
}) => {
  const [query, setQuery] = useState(initialQuery)
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags)
  const [isTagFilterOpen, setIsTagFilterOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownId = useId()
  
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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }, [onSearch, query])

  const selectedTagsData = availableTags.filter(tag => selectedTags.includes(tag._id))
  const hasActiveFilters = query.trim() !== '' || selectedTags.length > 0
    || Boolean(dateFrom) || Boolean(dateTo) || includeTbd === false

  const supportsDateFilter = showDateFilter && typeof onDateFromChange === 'function' && typeof onDateToChange === 'function'

  return (
    <div className={`${styles.searchBar} ${className}` } role="search">
      {/* Основная строка поиска */}
      <form className={styles.searchInputWrapper} onSubmit={handleSubmit}>
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
            role="searchbox"
            aria-label={placeholder}
            autoComplete="off"
            spellCheck={false}
          />

          <div className={styles.rightControls}>
            <div className={styles.vertDivider} aria-hidden="true" />

            {query && (
              <button
                onClick={clearQuery}
                className={styles.clearButton}
                aria-label="Очистить поиск"
                type="button"
              >
                <X size={16} />
              </button>
            )}

            {showTagFilter && availableTags.length > 0 && (
              <button
                onClick={toggleTagFilter}
                className={`${styles.filterButton} ${selectedTags.length > 0 ? styles.active : ''}`}
                aria-label="Фильтр по тегам"
                aria-haspopup="listbox"
                aria-expanded={isTagFilterOpen}
                aria-controls={dropdownId}
                type="button"
              >
                <Filter size={18} />
                {selectedTags.length > 0 && (
                  <span className={styles.tagCount}>{selectedTags.length}</span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Индикатор активных фильтров */}
        {hasActiveFilters && (
          <div className={styles.activeFilters} aria-live="polite">
            {query && (
              <span className={styles.queryFilter}>
                &ldquo;{query}&rdquo;
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
                  type="button"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setQuery('')
                clearAllTags()
                onDateFromChange?.('')
                onDateToChange?.('')
                onIncludeTbdChange?.(true)
              }}
              className={styles.clearAllButton}
              aria-label="Очистить все фильтры"
              type="button"
            >
              Очистить все
            </button>
          </div>
        )}
      </form>

      {/* Выпадающий список тегов */}
      {isTagFilterOpen && (availableTags.length > 0 || supportsDateFilter) && (
        <div
          ref={tagFilterRef}
          className={styles.tagFilterDropdown}
          id={dropdownId}
          role="listbox"
          aria-multiselectable="true"
        >
          {(supportsDateFilter || availableTags.length > 0) && (
            <div className={styles.tagFilterHeader}>
              <span className={styles.tagFilterTitle}>Фильтры</span>
              {(selectedTags.length > 0) && (
                <button
                  onClick={clearAllTags}
                  className={styles.clearTagsButton}
                  type="button"
                >
                  Очистить теги
                </button>
              )}
            </div>
          )}

          {supportsDateFilter && (
            <div className={styles.dateFilterSection} role="group" aria-label="Фильтр по датам">
              <div className={styles.dateRow}>
                <label className={styles.dateFieldInDropdown}>
                  <span>От</span>
                  <input
                    type="date"
                    value={dateFrom ?? ''}
                    onChange={(e) => onDateFromChange?.(e.target.value)}
                  />
                </label>
                <label className={styles.dateFieldInDropdown}>
                  <span>До</span>
                  <input
                    type="date"
                    value={dateTo ?? ''}
                    onChange={(e) => onDateToChange?.(e.target.value)}
                  />
                </label>
              </div>
              <label className={styles.tbdToggleInline}>
                <input
                  type="checkbox"
                  checked={includeTbd ?? true}
                  onChange={(e) => onIncludeTbdChange?.(e.target.checked)}
                />
                <span>Показывать без даты</span>
              </label>
            </div>
          )}
          
          {availableTags.length > 0 && (
            <div className={styles.tagList}>
              {availableTags.map(tag => (
                <button
                  key={tag._id}
                  onClick={() => handleTagToggle(tag._id)}
                  className={`${styles.tagOption} ${selectedTags.includes(tag._id) ? styles.selected : ''}`}
                  role="option"
                  aria-selected={selectedTags.includes(tag._id)}
                >
                  <Tag size={14} />
                  <span>{tag.name}</span>
                  {selectedTags.includes(tag._id) && (
                    <X size={14} className={styles.tagRemoveIcon} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
