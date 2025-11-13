"use client";

import { MapPin, Calendar, Users, Clock, ArrowLeft } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import ActionButton from "@/components/ui/ActionButton";
import styles from "./EventPopup.module.scss";
import type { CityEvent } from "../mockEvents";
import { getCategoryIcon, getCategoryColor } from "../constants/categories";

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
      maxWidth="680px"
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
            {/* Компактная сетка информации */}
            <div className={styles.infoGrid}>
              {/* Дата */}
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}>
                  <Calendar size={16} />
                </div>
                <div className={styles.infoValue}>
                  {event.isDateTbd ? "Дата уточняется" : event.eventDate}
                </div>
              </div>

              {/* Время */}
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

              {/* Участники */}
              {event.regedUsers > 0 && (
                <div className={styles.infoItem}>
                  <div className={styles.iconWrapper}>
                    <Users size={16} />
                  </div>
                  <div className={styles.infoValue}>
                    {event.regedUsers} участников
                  </div>
                </div>
              )}
            </div>

            {/* Место на всю ширину */}
            <div className={styles.placeItem}>
              <div className={styles.iconWrapper}>
                <MapPin size={16} />
              </div>
              <div className={styles.placeValue}>{event.place}</div>
            </div>
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

