"use client";

import { MapPin } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import styles from "./EventsList.module.scss";
import type { CityEvent } from "../mockEvents";
import { getCategoryIcon, getCategoryColor } from "../constants/categories";

interface EventsListProps {
  isOpen: boolean;
  onClose: () => void;
  events: CityEvent[];
  onEventClick: (event: CityEvent) => void;
}

export default function EventsList({ isOpen, onClose, events, onEventClick }: EventsListProps) {

  const handleEventClick = (event: CityEvent) => {
    onEventClick(event);
    // Не вызываем onClose() здесь - пусть родитель управляет навигацией
  };

  return (
    <FooterPopUp 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Мероприятия (${events.length})`}
      maxHeight="90vh"
    >
      <div className={styles.eventsList}>
        {events.map((event) => (
          <button
            key={event.id}
            className={styles.eventCard}
            onClick={() => handleEventClick(event)}
            type="button"
          >
            <div 
              className={styles.eventIconWrapper}
              style={{ background: getCategoryColor(event.category) }}
            >
              {getCategoryIcon(event.category)}
            </div>
            
            <div className={styles.eventContent}>
              <h4 className={styles.eventName}>{event.name}</h4>
              <div className={styles.eventMeta}>
                <span className={styles.eventPlace}>{event.place}</span>
                <span className={styles.eventDot}>•</span>
                <span className={styles.eventDate}>
                  {event.isDateTbd ? "Дата уточняется" : event.eventDate}
                </span>
              </div>
            </div>

            <MapPin size={16} className={styles.showOnMapIcon} />
          </button>
        ))}
      </div>
    </FooterPopUp>
  );
}

