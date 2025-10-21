import React from 'react';
import { ScheduleItem } from '@/types/schedule';
import styles from './ScheduleCard.module.scss';

interface ScheduleCardProps {
  item: ScheduleItem;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  return (
    <div className={styles.scheduleCard}>
      <div className={styles.scheduleTime}>
        {item.timeFrom} - {item.timeTo}
      </div>
      <div className={styles.scheduleTitle}>{item.name}</div>
      <div className={styles.scheduleLocation}>
        {item.graphId?.name || 'Неизвестная группа'} • Аудитория {item.roomNumber}
      </div>
    </div>
  );
};

export default ScheduleCard;

