"use client";

import { useState, useMemo } from "react";
import { MapPin, Search, X, Filter } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import styles from "./EventsList.module.scss";
import type { CityEvent } from "../mockEvents";
import { getCategoryIcon, getCategoryColor } from "../constants/categories";

interface EventsListProps {
  isOpen: boolean;
  onClose: () => void;
  events: CityEvent[];
  onEventClick: (event: CityEvent) => void;
  onOpenFilter?: () => void;
  hasActiveFilters?: boolean;
  portalContainer?: HTMLElement | null;
}

// Функция форматирования даты в формат "6 ноября 2025г."
const formatEventDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Если дата некорректна, вернем исходную строку
    }
    
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Если уже есть "г.", убираем пробел перед ним если есть, иначе добавляем "г." без пробела
    if (dateStr.includes('г.')) {
      return dateStr.replace(/\s+г\./, 'г.');
    }
    return dateStr.replace(/\s(\d{4})$/, '$1г.');
  } catch {
    return dateString;
  }
};

export default function EventsList({ isOpen, onClose, events, onEventClick, onOpenFilter, hasActiveFilters = false, portalContainer }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleEventClick = (event: CityEvent) => {
    onEventClick(event);
    // Не вызываем onClose() здесь - пусть родитель управляет навигацией
  };

  const handleFilterClick = () => {
    if (onOpenFilter) {
      onOpenFilter();
    }
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
      container={portalContainer}
    >
      {/* Поисковая строка и фильтр */}
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
        {onOpenFilter && (
          <button
            type="button"
            onClick={handleFilterClick}
            className={`${styles.filterButton} ${hasActiveFilters ? styles.filterButtonActive : ''}`}
            aria-label="Открыть фильтры"
          >
            <Filter size={18} />
            {hasActiveFilters && <span className={styles.filterBadge} />}
          </button>
        )}
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
          filteredEvents.map((event, index) => (
          <button
            key={event.id}
            className={styles.eventCard}
            onClick={() => handleEventClick(event)}
            type="button"
            style={{
              animationDelay: `${Math.min(index * 0.05, 0.4)}s`
            }}
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
                  {event.isDateTbd ? "Дата уточняется" : formatEventDate(event.eventDate)}
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

