"use client";

import { Music, Image as ImageIcon, GraduationCap, Sparkles, Users, MapPin } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import styles from "./EventsList.module.scss";
import type { CityEvent } from "../mockEvents";

interface EventsListProps {
  isOpen: boolean;
  onClose: () => void;
  events: CityEvent[];
  onEventClick: (event: CityEvent) => void;
}

export default function EventsList({ isOpen, onClose, events, onEventClick }: EventsListProps) {
  // Получение иконки по категории
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'concert':
        return <Music size={18} />;
      case 'exhibit':
        return <ImageIcon size={18} />;
      case 'lecture':
        return <GraduationCap size={18} />;
      case 'festival':
        return <Sparkles size={18} />;
      case 'meetup':
        return <Users size={18} />;
      default:
        return <MapPin size={18} />;
    }
  };

  // Получение цвета по категории
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      concert: '#8b5cf6',
      exhibit: '#06b6d4',
      lecture: '#22c55e',
      festival: '#ec4899',
      meetup: '#fb923c',
    };
    return colors[category] || '#3b82f6';
  };

  const handleEventClick = (event: CityEvent) => {
    onEventClick(event);
    // Не вызываем onClose() здесь - пусть родитель управляет навигацией
  };

  return (
    <FooterPopUp 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Мероприятия (${events.length})`}
      maxHeight="75vh"
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

