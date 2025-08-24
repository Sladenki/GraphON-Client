import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';
import PopUpWrapper from '../../../global/PopUpWrapper/PopUpWrapper';
import { Spinner } from '@heroui/react';
import Image from 'next/image';
import styles from './AttendeesPopUp.module.scss';

interface AttendeesPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
}

interface AttendeeUser {
  _id: string;
  telegramId?: string;
  avaPath?: string;
  firstName?: string;
  username?: string;
  lastName?: string;
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
      modalId={`attendees-popup-${eventId}`}
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
              const display = u.firstName || u.username || u.lastName || 'Пользователь';
              return (
                <div key={u._id} className={styles.item}>
                  <div className={styles.avatar}>
                    {u.avaPath ? (
                      <Image src={u.avaPath} alt={display} width={40} height={40} />
                    ) : (
                      <div className={styles.fallback}>{display.charAt(0).toUpperCase()}</div>
                    )}
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name}>{display}</div>
                    {(u.firstName && u.lastName) && (
                      <div className={styles.meta}>@{u.username || '—'}</div>
                    )}
                  </div>
                </div>
              );
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


