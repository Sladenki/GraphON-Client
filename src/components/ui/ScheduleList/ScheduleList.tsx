import React from 'react';
import ScheduleItem from "@/components/ui/ScheduleItem/ScheduleItem";

interface ScheduleDisplayProps {
  scheduleByDays: { [key: number]: any[] }; // Типизируйте точнее, если известно содержимое расписания
  title?: string; // Необязательный заголовок
}

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

const ScheduleList: React.FC<ScheduleDisplayProps> = ({ scheduleByDays, title }) => {
  return (
    <div>
      {title && <h2>{title}</h2>}
      <div>
        {daysOfWeek.map((day, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <h3>{day}</h3>
            {scheduleByDays[index]?.length > 0 ? (
              <ul>
                {scheduleByDays[index].map((item) => (
                  <ScheduleItem
                    key={item._id}
                    name={item.name}
                    graphName={item.graphId.name}
                    timeFrom={item.timeFrom}
                    timeTo={item.timeTo}
                    roomNumber={item.roomNumber}
                  />
                ))}
              </ul>
            ) : (
              <p>Нет мероприятий</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;
