import { useMemo } from 'react';

export interface LoadingState {
  isFirstLoad?: boolean;
  isLoading: boolean;
  hasData: boolean;
  isEmpty: boolean;
  hasSearchResults: boolean;
  noSearchResults: boolean;
  hasError: boolean;
  isSearching: boolean;
}

interface UseListStateProps {
  isLoading: boolean;
  hasError: boolean;
  data: any[];
  searchQuery: string;
  debouncedSearchQuery: string;
  filteredData: any[];
  isFirstLoad?: boolean;
  allData?: any;
}

export const useListState = ({
  isLoading,
  hasError,
  data,
  searchQuery,
  debouncedSearchQuery,
  filteredData,
  isFirstLoad = false,
  allData
}: UseListStateProps): LoadingState => {
  return useMemo(() => ({
    isFirstLoad,
    isLoading: isFirstLoad || (isLoading && !allData),
    hasData: !isFirstLoad && data.length > 0,
    isEmpty: !isFirstLoad && data.length === 0 && !isLoading,
    hasSearchResults: !isLoading && !!debouncedSearchQuery && filteredData.length > 0,
    noSearchResults: !isLoading && !!debouncedSearchQuery && filteredData.length === 0,
    hasError: !!hasError,
    isSearching: searchQuery !== debouncedSearchQuery
  }), [
    isFirstLoad,
    isLoading,
    allData,
    data.length,
    debouncedSearchQuery,
    filteredData.length,
    hasError,
    searchQuery
  ]);
}; 