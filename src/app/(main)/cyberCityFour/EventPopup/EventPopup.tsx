"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, MapPin, Calendar, Users, Clock } from "lucide-react";
import styles from "./EventPopup.module.scss";
import type { CityEvent } from "../mockEvents";

interface EventPopupProps {
  event: CityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export default function EventPopup({ event, isOpen, onClose, isLight = false }: EventPopupProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const [dragTranslateY, setDragTranslateY] = useState(0);
  const [animateOpen, setAnimateOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimateOpen(true);
    }
  }, [isOpen]);

  const handlePointerDown = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartYRef.current = clientY;
  }, []);

  const handlePointerMove = useCallback((clientY: number) => {
    if (!isDragging || dragStartYRef.current == null) return;
    const delta = clientY - dragStartYRef.current;
    setDragTranslateY(Math.max(0, delta));
  }, [isDragging]);

  const finishDrag = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const shouldClose = dragTranslateY > 80;
    setDragTranslateY(0);
    if (shouldClose) onClose();
  }, [isDragging, dragTranslateY, onClose]);

  useEffect(() => {
    function onMove(e: TouchEvent | MouseEvent) {
      if (!isDragging) return;
      if (e instanceof TouchEvent) {
        handlePointerMove(e.touches[0]?.clientY ?? 0);
      } else {
        handlePointerMove((e as MouseEvent).clientY);
      }
    }
    function onUp() {
      finishDrag();
    }
    if (isDragging) {
      window.addEventListener("touchmove", onMove, { passive: false } as any);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("touchend", onUp);
      window.addEventListener("mouseup", onUp);
    }
    return () => {
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, handlePointerMove, finishDrag]);

  if (!isOpen || !event) return null;

  const sheetStyle = {
    transform: `translateY(${isDragging ? dragTranslateY : 0}px)`
  } as React.CSSProperties;

  return (
    <div className={styles.popupOverlay} onClick={onClose}>
      <div
        className={`${styles.sheet} ${animateOpen ? styles.sheetOpen : ""}`}
        style={sheetStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={styles.sheetHandleArea}
          onMouseDown={(e) => handlePointerDown(e.clientY)}
          onTouchStart={(e) => handlePointerDown(e.touches[0]?.clientY ?? 0)}
        >
          <div className={styles.sheetHandle} />
        </div>

        <div className={styles.popupHeader}>
          <h3 className={styles.popupTitle}>{event.name}</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.popupContent}>
          <div className={styles.eventInfo}>
            <div className={styles.infoItem}>
              <MapPin className={styles.infoIcon} size={18} />
              <div className={styles.infoContent}>
                <div className={styles.infoLabel}>Место</div>
                <div className={styles.infoValue}>{event.place}</div>
              </div>
            </div>

            <div className={styles.infoItem}>
              <Calendar className={styles.infoIcon} size={18} />
              <div className={styles.infoContent}>
                <div className={styles.infoLabel}>Дата</div>
                <div className={styles.infoValue}>
                  {event.isDateTbd ? "Дата уточняется" : event.eventDate}
                </div>
              </div>
            </div>

            {event.timeFrom && event.timeTo && (
              <div className={styles.infoItem}>
                <Clock className={styles.infoIcon} size={18} />
                <div className={styles.infoContent}>
                  <div className={styles.infoLabel}>Время</div>
                  <div className={styles.infoValue}>
                    {event.timeFrom} – {event.timeTo}
                  </div>
                </div>
              </div>
            )}

            {event.regedUsers > 0 && (
              <div className={styles.infoItem}>
                <Users className={styles.infoIcon} size={18} />
                <div className={styles.infoContent}>
                  <div className={styles.infoLabel}>Участники</div>
                  <div className={styles.infoValue}>{event.regedUsers} человек</div>
                </div>
              </div>
            )}
          </div>

          {event.description && (
            <div className={styles.eventDescription}>
              <div className={styles.descriptionTitle}>Описание</div>
              <p className={styles.descriptionText}>{event.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

