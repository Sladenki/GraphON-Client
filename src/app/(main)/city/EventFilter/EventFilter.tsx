"use client";

import { useCallback } from "react";
import { List, X } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp";
import ActionButton from "@/components/ui/ActionButton";
import DatePickerField from "@/components/ui/DatePickerField/DatePickerField";
import styles from "./EventFilter.module.scss";
import { CATEGORIES } from "../constants/categories";

interface EventFilterProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  resultsCount?: number;
  selectedCategories: Record<string, boolean>;
  onCategoriesChange: (categories: Record<string, boolean>) => void;
  datePreset: "today" | "tomorrow" | "weekend" | "custom" | null;
  onDatePresetChange: (preset: "today" | "tomorrow" | "weekend" | "custom" | null) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  onOpenList?: () => void;
  portalContainer?: HTMLElement | null;
}

export default function EventFilter({ 
  isOpen, 
  onClose,
  onApply,
  resultsCount = 0,
  selectedCategories,
  onCategoriesChange,
  datePreset,
  onDatePresetChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onOpenList,
  portalContainer,
}: EventFilterProps) {
  const toggleCategory = useCallback((key: string) => {
    onCategoriesChange({ ...selectedCategories, [key]: !selectedCategories[key] });
  }, [selectedCategories, onCategoriesChange]);

  // Сброс всех фильтров
  const clearAllFilters = useCallback(() => {
    onCategoriesChange({
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
    onDatePresetChange(null);
    onDateFromChange("");
    onDateToChange("");
  }, [onCategoriesChange, onDatePresetChange, onDateFromChange, onDateToChange]);

  // Проверка наличия активных фильтров
  const hasActiveFilters = Object.values(selectedCategories).some(selected => selected) || 
    datePreset !== null;

  const handleOpenList = useCallback(() => {
    if (onOpenList) {
      onOpenList();
    }
  }, [onOpenList]);

  const footer = (
    <ActionButton
      label={`Показать ${resultsCount} событий`}
      variant="primary"
      onClick={onApply || onClose}
      className={styles.applyButton}
    />
  );

  return (
    <FooterPopUp 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Фильтры мероприятий"
      footer={footer}
      maxHeight="90vh"
      container={portalContainer}
    >
      {/* Кнопки управления фильтрами */}
      {(onOpenList || hasActiveFilters) && (
        <div className={styles.topActionsContainer}>
          {onOpenList && (
            <button
              type="button"
              onClick={handleOpenList}
              className={`${styles.actionButton} ${styles.listButton}`}
              aria-label="Список мероприятий"
            >
              <List size={18} className={styles.actionIcon} />
              <span>Список мероприятий</span>
            </button>
          )}
          {hasActiveFilters && (
            <button
              type="button"
              className={`${styles.actionButton} ${styles.clearButton}`}
              onClick={clearAllFilters}
              aria-label="Очистить все фильтры"
            >
              <X size={18} className={styles.actionIcon} />
              <span>Очистить фильтры</span>
            </button>
          )}
        </div>
      )}
      
      {/* Секция дат */}
      <div className={styles.sectionTitle}>Когда</div>
      <div className={styles.dateGroup} role="group" aria-label="Дата мероприятия">
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "today"}
          onClick={() => onDatePresetChange("today")}
          aria-pressed={datePreset === "today"}
        >
          Сегодня
        </button>
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "tomorrow"}
          onClick={() => onDatePresetChange("tomorrow")}
          aria-pressed={datePreset === "tomorrow"}
        >
          Завтра
        </button>
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "weekend"}
          onClick={() => onDatePresetChange("weekend")}
          aria-pressed={datePreset === "weekend"}
        >
          Выходные
        </button>
        <button
          type="button"
          className={styles.dateButton}
          data-selected={datePreset === "custom"}
          onClick={() => onDatePresetChange("custom")}
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
              onChange={onDateFromChange}
              label="С какого"
              ariaLabel="Дата начала"
              size="sm"
              variant="flat"
            />
          </div>
          <div className={styles.dateRangeField}>
            <DatePickerField
              value={dateTo}
              onChange={onDateToChange}
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
            <Icon size={20} />
            <div className={styles.categoryLabel}>{label}</div>
          </button>
        ))}
      </div>
    </FooterPopUp>
  );
}
