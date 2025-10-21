import React from 'react';
import Link from 'next/link';
import { ScheduleItem } from '@/types/schedule';
import { Clock } from 'lucide-react';
import styles from './ScheduleCard.module.scss';

interface ScheduleCardProps {
  item: ScheduleItem;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({ item }) => {
  const groupId = item.graphId?._id;

  return (
    <div className={styles.scheduleCard}>
      <div className={styles.cardHeader}>
        <div className={styles.timeContainer}>
          <Clock size={16} className={styles.clockIcon} />
          <span className={styles.scheduleTime}>
            {item.timeFrom} - {item.timeTo}
          </span>
        </div>
        <div className={styles.typeBadge}>
          {item.type === 'lecture' ? 'Лекция' : item.type === 'practice' ? 'Практика' : 'Занятие'}
        </div>
      </div>
      
      <div className={styles.cardBody}>
        <h3 className={styles.scheduleTitle}>{item.name}</h3>
        <div className={styles.scheduleLocation}>
          {groupId ? (
            <Link href={`/groups/${groupId}`} className={styles.groupLink}>
              {item.graphId?.name || 'Неизвестная группа'}
            </Link>
          ) : (
            <span className={styles.groupName}>{item.graphId?.name || 'Неизвестная группа'}</span>
          )}
          <span className={styles.separator}>•</span>
          <span className={styles.roomNumber}>Аудитория {item.roomNumber}</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCard;

