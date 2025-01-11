import React from 'react';

interface ScheduleItemProps {
  name: string;
  timeFrom: string;
  timeTo: string;
  roomNumber: number;
}

const ScheduleItem: React.FC<ScheduleItemProps> =({ name, timeFrom, timeTo, roomNumber }) => (
  <li>
    <strong>Имя:</strong> {name} <br />
    <strong>Время:</strong> {timeFrom} - {timeTo} <br />
    <strong>Кабинет:</strong> {roomNumber}
  </li>
);

export default ScheduleItem;
