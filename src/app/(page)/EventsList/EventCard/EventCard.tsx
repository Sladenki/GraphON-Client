import React from "react";
import styles from "./EventCard.module.scss";

interface EventProps {
  event: {
    _id: string;
    name: string;
    description: string;
    timeFrom: string;
    timeTo: string;
    graphId: {
      name: string;
    };
  };
}

const EventCard: React.FC<EventProps> = ({ event }) => {
  return (
    <div className={styles.eventCard}>
      <div className={styles.header}>
        <h3 className={styles.title}>{event.name}</h3>
        <span className={styles.author}>{event.graphId.name}</span>
      </div>
      <p className={styles.description}>{event.description}</p>
      <div className={styles.footer}>
        <span className={styles.time}>
          ⏰ {event.timeFrom} - {event.timeTo}
        </span>
      </div>
    </div>
  );
};

export default EventCard;
