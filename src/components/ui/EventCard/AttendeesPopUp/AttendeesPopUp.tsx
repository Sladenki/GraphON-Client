import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';
import PopUpWrapper from '../../../global/PopUpWrapper/PopUpWrapper';
import { Spinner } from '@heroui/react';
import styles from './AttendeesPopUp.module.scss';
import AttendeeItem, { AttendeeUser } from '@/components/ui/AttendeeItem';

interface AttendeesPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

 

const AttendeesPopUp: React.FC<AttendeesPopUpProps> = ({ isOpen, onClose, eventId, eventName }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['eventRegUsers', eventId],
    queryFn: async () => {
      const res = await EventRegService.getUsersByEventId(eventId);
      return res.data as AttendeeUser[];
    },
    enabled: isOpen && Boolean(eventId),
    staleTime: 60_000,
  });

  return (
    <PopUpWrapper
      isOpen={isOpen}
      onClose={onClose}
      width={520}
      height={600}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Участники</h3>
          <p className={styles.subtitle}>{eventName}</p>
        </div>

        {isLoading && (
          <div className={styles.center}>
            <Spinner size="md" />
          </div>
        )}

        {isError && (
          <div className={styles.center}>Не удалось загрузить список участников</div>
        )}

        {!isLoading && !isError && (
          <div className={styles.list}>
            {(data || []).map((u) => {
              return <AttendeeItem key={u._id} user={u} />;
            })}
            {(!data || data.length === 0) && (
              <div className={styles.center}>Пока нет участников</div>
            )}
          </div>
        )}
      </div>
    </PopUpWrapper>
  );
};

export default AttendeesPopUp;


