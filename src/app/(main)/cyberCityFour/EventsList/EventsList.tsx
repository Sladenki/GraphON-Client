"use client";

import { useState, useMemo } from "react";
import { MapPin, Search, X } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const handleEventClick = (event: CityEvent) => {
    onEventClick(event);
    // Не вызываем onClose() здесь - пусть родитель управляет навигацией
  };

  // Фильтрация событий по поисковому запросу
  const filteredEvents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return events;

    return events.filter((event) => {
      const searchableText = [
        event.name,
        event.place,
        event.category,
        event.eventDate,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [events, searchQuery]);

  return (
    <FooterPopUp 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Мероприятия (${filteredEvents.length})`}
      maxHeight="90vh"
    >
      {/* Поисковая строка */}
      <div className={styles.searchContainer}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск мероприятий..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={styles.clearButton}
              aria-label="Очистить поиск"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.eventsList}>
        {filteredEvents.length === 0 ? (
          <div className={styles.emptyState}>
            <Search size={48} />
            <p className={styles.emptyTitle}>Ничего не найдено</p>
            <p className={styles.emptyText}>
              Попробуйте изменить запрос
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
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
        ))
        )}
      </div>
    </FooterPopUp>
  );
}

