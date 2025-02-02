import React from 'react'
import styles from './EventItem.module.scss'

interface EventItemProps {
    name: string;
    description: string;
    graphName: string;
    eventDate: string;
    timeFrom: string;
    timeTo: string;
}

const EventItem: React.FC<EventItemProps> = ({ name, description, graphName, eventDate, timeFrom, timeTo }) => {
    return (
        <div className={styles.eventItem}>
            <h3 className={styles.eventTitle}>{name}</h3>
            <p className={styles.eventDescription}>{description}</p>
            <p className={styles.eventGraph}>Граф: <strong>{graphName}</strong></p>
            <p className={styles.eventDate}>📅 {new Date(eventDate).toLocaleDateString()}</p>
            <p className={styles.eventTime}>🕒 {timeFrom} - {timeTo}</p>
        </div>
    );
}

export default EventItem
