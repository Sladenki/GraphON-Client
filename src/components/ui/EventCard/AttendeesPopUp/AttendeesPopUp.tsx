import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';
import PopUpWrapper from '../../../global/PopUpWrapper/PopUpWrapper';
import { Spinner } from '@heroui/react';
import { Users, AlertCircle } from 'lucide-react';
import styles from './AttendeesPopUp.module.scss';
import AttendeeItem, { AttendeeUser } from '@/components/ui/AttendeeItem';

interface AttendeesPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

const AttendeesPopUp: React.FC<AttendeesPopUpProps> = ({ 
  isOpen, 
  onClose, 
  eventId, 
  eventName 
}) => {
  const { data: attendees, isLoading, isError } = useQuery({
    queryKey: ['eventRegUsers', eventId],
    queryFn: async () => {
      const res = await EventRegService.getUsersByEventId(eventId);
      return res.data as AttendeeUser[];
    },
    enabled: isOpen && Boolean(eventId),
    staleTime: 60_000,
  });

  const attendeesCount = useMemo(() => attendees?.length || 0, [attendees]);

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
              <h3 className={styles.title}>Участники мероприятия</h3>
              {attendeesCount > 0 && !isLoading && (
                <div className={styles.badge}>{attendeesCount}</div>
              )}
            </div>
            <p className={styles.subtitle}>{eventName}</p>
          </div>
        </div>

        {/* Content */}
        {isLoading && (
          <div className={styles.center}>
            <Spinner size="lg" color="primary" />
            <p className={styles.loadingText}>Загрузка участников...</p>
          </div>
        )}

        {isError && (
          <div className={styles.center}>
            <div className={styles.errorState}>
              <AlertCircle size={48} className={styles.errorIcon} />
              <p className={styles.errorText}>Не удалось загрузить список участников</p>
              <p className={styles.errorHint}>Попробуйте обновить страницу</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {attendeesCount === 0 ? (
              <div className={styles.center}>
                <div className={styles.emptyState}>
                  <Users size={48} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>Пока нет участников</p>
                  <p className={styles.emptyHint}>Станьте первым, кто зарегистрируется!</p>
                </div>
              </div>
            ) : (
              <div className={styles.list}>
                {attendees?.map((user) => (
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

export default AttendeesPopUp;


