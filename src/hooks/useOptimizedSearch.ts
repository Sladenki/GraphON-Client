import { useMemo } from 'react';
import { useDebounce } from './useDebounce';

interface SearchableItem {
  _id?: string;
  name?: string;
  [key: string]: any;
}

interface UseOptimizedSearchProps<T extends SearchableItem> {
  data: T[];
  searchQuery: string;
  searchFields?: (keyof T)[];
  debounceMs?: number;
}

export const useOptimizedSearch = <T extends SearchableItem>({
  data,
  searchQuery,
  searchFields = ['name'],
  debounceMs = 300
}: UseOptimizedSearchProps<T>) => {
  // Дебаунсинг поискового запроса для лучшей производительности
  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs);

  // Оптимизированная фильтрация с дебаунсингом
  const filteredData = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return data;
    }

    const query = debouncedSearchQuery.toLowerCase().trim();
    
    return data.filter((item) => {
      if (!item?._id) return false;
      
      return searchFields.some(field => {
        const fieldValue = item[field];
        if (typeof fieldValue !== 'string') return false;
        
        const normalizedValue = fieldValue.toLowerCase();
        
        // Быстрый поиск для коротких запросов
        if (query.length <= 2) {
          return normalizedValue.startsWith(query);
        }
        
        // Для длинных запросов используем includes
        return normalizedValue.includes(query);
      });
    });
  }, [data, debouncedSearchQuery, searchFields]);

  return {
    debouncedSearchQuery,
    filteredData,
    isSearching: searchQuery !== debouncedSearchQuery
  };
}; 