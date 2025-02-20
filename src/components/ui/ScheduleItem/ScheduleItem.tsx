import React from 'react';
import styles from './ScheduleItem.module.scss'
import { Pickaxe, School } from 'lucide-react';

interface ScheduleItemProps {
  name: string;
  graphName: string;
  timeFrom: string;
  timeTo: string;
  roomNumber: number;
  type: string
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ name, graphName, timeFrom, timeTo, roomNumber, type }) => (
  <div className={styles.ScheduleItemWrapper}>

    <div className={styles.ScheduleItem}>
      {/* В зависимости от типа показываем соответствующую иконку */}
      <div className={styles.icon}>
        {type === 'practice' ? (
          <Pickaxe 
            color='#D32F2F' 
            size={30} 
            strokeWidth={1.1} 
          />
        )  : (
          <School 
            color='green' 
            size={30} 
            strokeWidth={1.1} 
          />
        )}
      </div>
      
      {/* Блок с данными, выстраиваем элементы вертикально */}
      <div className={styles.mainInfo}>
        <div className={styles.graphName}>{graphName}</div>
        <div className={styles.eventName}>{name}</div>
        <div className={styles.time}>{timeFrom} - {timeTo}</div>
      </div>
      
      {/* Блок с кабинетом, обёрнут в прямоугольник с закругленными краями */}
      <div className={styles.room}>
        <span>Кабинет:</span> {roomNumber}
      </div>
    </div>

  </div>
);

export default ScheduleItem;
