import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { EventRegService } from '@/services/eventReg.service';
import UsersListPopUp from '@/components/shared/UsersListPopUp/UsersListPopUp';
import styles from './AttendeesPopUp.module.scss';
import { AttendeeUser } from '@/components/shared/UsersListPopUp/AttendeeItem';

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

  return (
    <UsersListPopUp
      isOpen={isOpen}
      onClose={onClose}
      title="Участники мероприятия"
      subtitle={eventName}
      isLoading={isLoading}
      isError={isError}
      users={attendees as any}
      emptyTitle="Пока нет участников"
      emptyHint="Станьте первым, кто зарегистрируется!"
      loadingText="Загрузка участников..."
      errorText="Не удалось загрузить список участников"
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

export default AttendeesPopUp;


