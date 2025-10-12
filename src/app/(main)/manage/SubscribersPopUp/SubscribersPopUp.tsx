import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import UsersListPopUp from '@/components/shared/UsersListPopUp';
import styles from './SubscribersPopUp.module.scss';
import AttendeeItem, { AttendeeUser } from '@/components/shared/AttendeeItem';
import { GraphSubsService } from '@/services/graphSubs.service';

interface SubscribersPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  graphId: string;
  graphName: string;
}

const SubscribersPopUp: React.FC<SubscribersPopUpProps> = ({ 
  isOpen, 
  onClose, 
  graphId, 
  graphName 
}) => {
  const { data: subscribers, isLoading, isError } = useQuery({
    queryKey: ['graphSubscribers', graphId],
    queryFn: async () => {
      const res = await GraphSubsService.getGraphSubscribers(graphId);
      return res.data as AttendeeUser[];
    },
    enabled: isOpen && Boolean(graphId),
    staleTime: 60_000,
  });

  return (
    <UsersListPopUp
      isOpen={isOpen}
      onClose={onClose}
      title="Подписчики"
      subtitle={graphName}
      isLoading={isLoading}
      isError={isError}
      users={subscribers as any}
      renderItem={(user) => <AttendeeItem user={user as any} />}
      emptyTitle="Пока нет подписчиков"
      emptyHint="Станьте первым, кто подпишется!"
      loadingText="Загрузка подписчиков..."
      errorText="Не удалось загрузить список подписчиков"
      errorHint="Попробуйте обновить страницу"
      width={540}
      height={620}
      classNames={{
        container: styles.container,
        header: styles.header,
        headerIcon: styles.headerIcon,
        headerContent: styles.headerContent,
        titleRow: styles.titleRow,
        title: styles.title,
        subtitle: styles.subtitle,
        badge: styles.badge,
        center: styles.center,
        loadingText: styles.loadingText,
        errorState: styles.errorState,
        errorIcon: styles.errorIcon,
        errorText: styles.errorText,
        errorHint: styles.errorHint,
        emptyState: styles.emptyState,
        emptyIcon: styles.emptyIcon,
        emptyText: styles.emptyText,
        emptyHint: styles.emptyHint,
        list: styles.list,
      }}
    />
  );
};

export default SubscribersPopUp;

