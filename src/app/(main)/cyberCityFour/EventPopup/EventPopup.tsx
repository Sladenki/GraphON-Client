"use client";

import { MapPin, Calendar, Users, Clock, Navigation, ArrowLeft, Music, Image as ImageIcon, GraduationCap, Sparkles } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import ActionButton from "@/components/ui/ActionButton";
import styles from "./EventPopup.module.scss";
import type { CityEvent, EventCategory } from "../mockEvents";

interface EventPopupProps {
  event: CityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export default function EventPopup({ 
  event, 
  isOpen, 
  onClose, 
  isLight = false,
  showBackButton = false,
  onBack 
}: EventPopupProps) {
  // Получение иконки по категории
  const getCategoryIcon = (category: EventCategory, size = 18) => {
    switch (category) {
      case 'concert':
        return <Music size={size} />;
      case 'exhibit':
        return <ImageIcon size={size} />;
      case 'lecture':
        return <GraduationCap size={size} />;
      case 'festival':
        return <Sparkles size={size} />;
      case 'meetup':
        return <Users size={size} />;
      default:
        return <MapPin size={size} />;
    }
  };

  // Получение цвета по категории
  const getCategoryColor = (category: EventCategory) => {
    const colors: Record<EventCategory, string> = {
      concert: '#8b5cf6',
      exhibit: '#06b6d4',
      lecture: '#22c55e',
      festival: '#ec4899',
      meetup: '#fb923c',
    };
    return colors[category];
  };

  // Функция открытия маршрута в Яндекс.Картах
  const openInYandexMaps = () => {
    if (!event) return;
    
    // URL с маршрутом: от текущего местоположения (~) до координат события
    const yandexMapsURL = `https://yandex.ru/maps/?rtext=~${event.lat},${event.lng}&rtt=auto`;
    window.open(yandexMapsURL, '_blank');
  };

  // Фиксированная кнопка внизу
  const footer = event ? (
    <div className={styles.footerButtons}>
      {showBackButton && onBack && (
        <button
          className={styles.backButton}
          onClick={onBack}
          aria-label="Назад к списку"
          title="Назад к списку"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <ActionButton
        label="Записаться"
        icon={<Calendar size={18} />}
        variant="primary"
        onClick={() => {
          // TODO: Implement registration logic
          console.log('Register for event:', event.id);
        }}
        className={styles.registerButton}
      />
      <button
        className={styles.mapButton}
        onClick={openInYandexMaps}
        aria-label="Открыть в Яндекс Картах"
        title="Открыть в Яндекс Картах"
      >
        <MapPin size={20} />
      </button>
    </div>
  ) : null;

  return (
    <FooterPopUp 
      isOpen={isOpen && !!event} 
      onClose={onClose} 
      title={event?.name || ""}
      footer={footer}
    >
      {event && (
        <>
          {/* Декоративные фоновые иконки */}
          <div className={styles.backgroundIcons}>
            <div 
              className={styles.bgIcon}
              style={{ color: getCategoryColor(event.category) }}
            >
              {getCategoryIcon(event.category, 120)}
            </div>
            <div 
              className={styles.bgIconSecondary}
              style={{ color: getCategoryColor(event.category) }}
            >
              {getCategoryIcon(event.category, 80)}
            </div>
            <div 
              className={styles.bgIconTertiary}
              style={{ color: getCategoryColor(event.category) }}
            >
              {getCategoryIcon(event.category, 60)}
            </div>
          </div>

          <div className={styles.eventInfo}>
            {/* Место */}
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <MapPin size={16} />
              </div>
              <div className={styles.infoValue}>{event.place}</div>
            </div>

            {/* Дата и время в одной строке */}
            <div className={styles.infoRow}>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <Calendar size={16} />
                </div>
                <div className={styles.infoValue}>
                  {event.isDateTbd ? "Дата уточняется" : event.eventDate}
                </div>
              </div>

              {event.timeFrom && event.timeTo && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <Clock size={16} />
                  </div>
                  <div className={styles.infoValue}>
                    {event.timeFrom} – {event.timeTo}
                  </div>
                </div>
              )}
            </div>

            {/* Участники */}
            {event.regedUsers > 0 && (
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <Users size={16} />
                </div>
                <div className={styles.infoValue}>
                  <span className={styles.badge}>{event.regedUsers}</span>
                  {" "}участников
                </div>
              </div>
            )}
          </div>

          {/* Описание */}
          {event.description && (
            <div className={styles.eventDescription}>
              <p className={styles.descriptionText}>{event.description}</p>
            </div>
          )}
        </>
      )}
    </FooterPopUp>
  );
}

