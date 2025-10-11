import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GraphService } from '@/services/graph.service';
import PopUpWrapper from '../../global/PopUpWrapper/PopUpWrapper';
import { Spinner } from '@heroui/react';
import { Users, AlertCircle } from 'lucide-react';
import styles from './SubscribersPopUp.module.scss';
import AttendeeItem, { AttendeeUser } from '@/components/ui/AttendeeItem';
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

  const subscribersCount = useMemo(() => subscribers?.length || 0, [subscribers]);

  return (
    <PopUpWrapper
      isOpen={isOpen}
      onClose={onClose}
      width={540}
      height={620}
    >
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <Users size={24} />
          </div>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>Подписчики</h3>
              {subscribersCount > 0 && !isLoading && (
                <div className={styles.badge}>{subscribersCount}</div>
              )}
            </div>
            <p className={styles.subtitle}>{graphName}</p>
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className={styles.center}>
            <Spinner size="lg" color="primary" />
            <p className={styles.loadingText}>Загрузка подписчиков...</p>
          </div>
        )}

        {isError && (
          <div className={styles.center}>
            <div className={styles.errorState}>
              <AlertCircle size={48} className={styles.errorIcon} />
              <p className={styles.errorText}>Не удалось загрузить список подписчиков</p>
              <p className={styles.errorHint}>Попробуйте обновить страницу</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {subscribersCount === 0 ? (
              <div className={styles.center}>
                <div className={styles.emptyState}>
                  <Users size={48} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>Пока нет подписчиков</p>
                  <p className={styles.emptyHint}>Станьте первым, кто подпишется!</p>
                </div>
              </div>
            ) : (
              <div className={styles.list}>
                {subscribers?.map((user) => (
                  <AttendeeItem key={user._id} user={user} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PopUpWrapper>
  );
};

export default SubscribersPopUp;

