"use client";

import { useCallback } from "react";
import { MapPin, Calendar, Users, Clock, ArrowLeft, Share2 } from "lucide-react";
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

  // Функция форматирования времени для поделиться
  const getFormattedTime = useCallback(() => {
    if (!event) return "";
    
    if (event.isDateTbd) return "Дата уточняется";
    
    const dateStr = formatEventDate(event.eventDate);
    if (event.timeFrom && event.timeTo) {
      return `${dateStr}, ${event.timeFrom} – ${event.timeTo}`;
    }
    return dateStr;
  }, [event]);

  // Обработчик поделиться
  const handleShare = useCallback(async () => {
    if (!event) return;
    
    try {
      const shareUrl = `${window.location.origin}/events/${event.id}`;
      const formattedTime = getFormattedTime();
      const text = `${event.name} — ${formattedTime}${event.place ? `, ${event.place}` : ''}`;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;

      const opened = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      if (opened) {
        return;
      }

      // Если всплывающее окно заблокировано
      if (navigator.share) {
        await navigator.share({ title: event.name, text: text, url: shareUrl } as any);
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      const fallbackUrl = `${window.location.origin}/events/${event.id}`;
      try {
        if (navigator.share) {
          const formattedTime = getFormattedTime();
          const text = `${event.name} — ${formattedTime}${event.place ? `, ${event.place}` : ''}`;
          await navigator.share({ title: event.name, text: text, url: fallbackUrl } as any);
          return;
        }
      } catch {}
      try {
        await navigator.clipboard.writeText(fallbackUrl);
      } catch {
        // ignore
      }
    }
  }, [event, getFormattedTime]);

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
        className={styles.shareButton}
        onClick={handleShare}
        aria-label="Поделиться мероприятием"
        title="Поделиться мероприятием"
      >
        <Share2 size={20} />
      </button>
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
                  {event.isDateTbd ? "Дата уточняется" : formatEventDate(event.eventDate)}
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

