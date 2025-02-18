import React from 'react';
import ScheduleItem from "@/components/ui/ScheduleItem/ScheduleItem";
import styles from './ScheduleList.module.scss'
import EventItem from '../EventItem/EventItem';

interface ScheduleDisplayProps {
  scheduleByDays: { [key: number]: any[] }; // Типизируйте точнее, если известно содержимое расписания
  events?: any[];
  title?: string; // Необязательный заголовок
}

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

const ScheduleList: React.FC<ScheduleDisplayProps> = ({ scheduleByDays, events, title }) => {
  return (
      <div className={styles.ScheduleListWrapper}>
          <div className={styles.scheduleSection}>
              {daysOfWeek.map((day, index) => (
                  <div key={index} className={styles.dayBlock}>

                    {/* День недели */}
                    <span className={styles.dayofWeek}>{day}</span>

                    {/* Расписание */}
                    {scheduleByDays[index]?.length > 0 ? (
                        scheduleByDays[index].map((item) => (
                        <div key={item._id} className={styles.scheduleItem}>
                            <ScheduleItem
                                key={item._id}
                                name={item.name}
                                graphName={item.graphId.name}
                                timeFrom={item.timeFrom}
                                timeTo={item.timeTo}
                                roomNumber={item.roomNumber}
                                type={item.type}
                            />
                        </div>
                
                        ))
                    ) : (
                        <p className={styles.noSchedule}>🥳 Нет занятий</p>
                    )}
                  </div>
              ))}
          </div>

              {
                events && (
                    <div className={styles.eventsSection}>
                        <h3>Ближайшие мероприятия</h3>
                        {events.length > 0 ? (
                            events.map((event: any) => (
                                <EventItem
                                    key={event._id}
                                    name={event.name}
                                    description={event.description}
                                    graphName={event.graphId.name}
                                    eventDate={event.eventDate}
                                    timeFrom={event.timeFrom}
                                    timeTo={event.timeTo}
                                />
                            ))
                        ) : (
                            <p className={styles.noSchedule}>🥳 Нет предстоящих мероприятий</p>
                        )}
                    </div>
                )
              }


      </div>
  );
};

export default ScheduleList;
