"use client";

import { MapPin, Calendar, Users, Clock } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import styles from "./EventPopup.module.scss";
import type { CityEvent } from "../mockEvents";

interface EventPopupProps {
  event: CityEvent | null;
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export default function EventPopup({ event, isOpen, onClose, isLight = false }: EventPopupProps) {
  if (!event) return null;

  return (
    <FooterPopUp isOpen={isOpen} onClose={onClose} title={event.name}>
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
    </FooterPopUp>
  );
}

