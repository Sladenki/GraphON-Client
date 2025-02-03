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
      {type === 'practice' ? <Pickaxe /> : <School />}
      
      {/* Блок с данными, выстраиваем элементы вертикально */}
      <div className={styles.mainInfo}>
        <div><strong>Граф:</strong> {graphName}</div>
        <div><strong>Имя:</strong> {name}</div>
        <div><strong>Время:</strong> {timeFrom} - {timeTo}</div>
      </div>
      
      {/* Блок с кабинетом, обёрнут в прямоугольник с закругленными краями */}
      <div className={styles.room}>
        <span>Кабинет:</span> {roomNumber}
      </div>
    </div>
  </div>
);

export default ScheduleItem;
