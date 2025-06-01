import { FC, useMemo } from 'react';
import { SpinnerLoader } from '@/components/global/SpinnerLoader/SpinnerLoader';
import { useFetchBunchData } from '@/hooks/useFetchBunchData';
import styles from './AllGraphs.module.scss';
import GraphsList from '@/components/ui/GraphsList/GraphsList';

interface AllGraphsProps {
  searchQuery: string;
}

export const AllGraphs: FC<AllGraphsProps> = ({ searchQuery }) => {
  const { 
    allPosts: allGraphs, 
    isPostsFetching, 
    isEndPosts, 
    loaderRef, 
    error 
  } = useFetchBunchData('graph/getParentGraphs', [], true);

  const filteredGraphs = useMemo(() => {
    if (!searchQuery) return allGraphs;
    return allGraphs.filter((graph) =>
      graph.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allGraphs, searchQuery]);

  if (error) {
    return <div className={styles.error}>Ошибка загрузки данных</div>;
  }

  return (
    <div className={styles.postsList}>
      {isPostsFetching && !isEndPosts && <SpinnerLoader />}
      {allGraphs.length > 0 && (
        <GraphsList allGraphs={filteredGraphs} />
      )}
      <div ref={loaderRef} />
    </div>
  );
}; 