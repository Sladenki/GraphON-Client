"use client";

import { useCallback, useMemo, useState } from "react";
import { Music, Image, GraduationCap, Sparkles, Users } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import styles from "./EventFilter.module.scss";

interface EventFilterProps {
  isOpen: boolean;
  onClose: () => void;
  resultsCount?: number;
}

export default function EventFilter({ isOpen, onClose, resultsCount = 0 }: EventFilterProps) {
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    concert: true,
    exhibit: true,
    lecture: true,
    festival: true,
    meetup: true,
  });

  const [datePreset, setDatePreset] = useState<"today" | "tomorrow" | "weekend" | "custom" | null>(null);
  const [customDate, setCustomDate] = useState<string>("");

  const categories = useMemo(() => ([
    { key: "concert", label: "Концерты", Icon: Music },
    { key: "exhibit", label: "Выставки", Icon: Image },
    { key: "lecture", label: "Лекции", Icon: GraduationCap },
    { key: "festival", label: "Фестивали", Icon: Sparkles },
    { key: "meetup", label: "Митапы", Icon: Users },
  ]), []);

  const toggleCategory = useCallback((key: string) => {
    setSelectedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const footer = (
    <button className={styles.applyButton} onClick={onClose}>
      {`Показать ${resultsCount} событий`}
    </button>
  );

  return (
    <FooterPopUp 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Фильтры мероприятий"
      footer={footer}
      maxHeight="70vh"
    >
      <div className={styles.dateGroup} role="group" aria-label="Дата мероприятия">
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "today"}
          onClick={() => setDatePreset("today")}
          aria-pressed={datePreset === "today"}
        >
          Сегодня
        </button>
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "tomorrow"}
          onClick={() => setDatePreset("tomorrow")}
          aria-pressed={datePreset === "tomorrow"}
        >
          Завтра
        </button>
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "weekend"}
          onClick={() => setDatePreset("weekend")}
          aria-pressed={datePreset === "weekend"}
        >
          Выходные
        </button>
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "custom"}
          onClick={() => setDatePreset("custom")}
          aria-pressed={datePreset === "custom"}
        >
          Выбрать дату
        </button>
      </div>
      {datePreset === "custom" && (
        <div className={styles.datePickerRow}>
          <input
            className={styles.datePicker}
            type="date"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        </div>
      )}
      <div className={styles.categoriesGrid}>
        {categories.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={styles.categoryItem}
            data-selected={Boolean(selectedCategories[key])}
            onClick={() => toggleCategory(key)}
            aria-pressed={Boolean(selectedCategories[key])}
          >
            <Icon size={22} />
            <div className={styles.categoryLabel}>{label}</div>
          </button>
        ))}
      </div>
    </FooterPopUp>
  );
}
