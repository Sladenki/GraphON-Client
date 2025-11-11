"use client";

import { useCallback, useState } from "react";
import FooterPopUp from "@/components/global/FooterPopUp";
import ActionButton from "@/components/ui/ActionButton";
import DatePickerField from "@/components/ui/DatePickerField/DatePickerField";
import styles from "./EventFilter.module.scss";
import { CATEGORIES } from "../constants/categories";

interface EventFilterProps {
  isOpen: boolean;
  onClose: () => void;
  resultsCount?: number;
}

export default function EventFilter({ isOpen, onClose, resultsCount = 0 }: EventFilterProps) {
  const [selectedCategories, setSelectedCategories] = useState<Record<string, boolean>>({
    music: false,
    art: false,
    education: false,
    business: false,
    sport: false,
    humor: false,
    gastro: false,
    family: false,
    city: false,
    party: false,
    meetup: false,
    cinema: false,
    theater: false,
  });

  const [datePreset, setDatePreset] = useState<"today" | "tomorrow" | "weekend" | "custom" | null>(null);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const toggleCategory = useCallback((key: string) => {
    setSelectedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const footer = (
    <ActionButton
      label={`Показать ${resultsCount} событий`}
      variant="primary"
      onClick={onClose}
      className={styles.applyButton}
    />
  );

  return (
    <FooterPopUp 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Фильтры мероприятий"
      footer={footer}
      maxHeight="70vh"
    >
      {/* Секция дат */}
      <div className={styles.sectionTitle}>Когда</div>
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
        <div className={styles.dateRangeContainer}>
          <div className={styles.dateRangeField}>
            <DatePickerField
              value={dateFrom}
              onChange={setDateFrom}
              label="С какого"
              ariaLabel="Дата начала"
              size="sm"
              variant="flat"
            />
          </div>
          <div className={styles.dateRangeField}>
            <DatePickerField
              value={dateTo}
              onChange={setDateTo}
              label="По какое"
              ariaLabel="Дата окончания"
              size="sm"
              variant="flat"
            />
          </div>
        </div>
      )}
      
      {/* Секция категорий */}
      <div className={styles.sectionTitle}>Что интересует</div>
      <div className={styles.categoriesGrid}>
        {CATEGORIES.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            className={styles.categoryItem}
            data-selected={Boolean(selectedCategories[key])}
            onClick={() => toggleCategory(key)}
            aria-pressed={Boolean(selectedCategories[key])}
          >
            <Icon size={18} />
            <div className={styles.categoryLabel}>{label}</div>
          </button>
        ))}
      </div>
    </FooterPopUp>
  );
}
