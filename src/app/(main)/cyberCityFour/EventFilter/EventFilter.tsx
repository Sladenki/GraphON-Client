"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Music, Image, GraduationCap, Sparkles, Users } from "lucide-react";
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

  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const [dragTranslateY, setDragTranslateY] = useState(0);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<"today" | "tomorrow" | "weekend" | "custom" | null>(null);
  const [customDate, setCustomDate] = useState<string>("");

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
    setAnimateOpen(true);
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

  if (!isOpen) return null;

  const sheetStyle = {
    transform: `translateY(${isDragging ? dragTranslateY : 0}px)`
  } as React.CSSProperties;

  return (
    <div className={styles.filterOverlay} onClick={onClose}>
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

        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>Фильтры мероприятий</h3>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.filterContent}>
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
        </div>

        <div className={styles.sheetFooter}>
          <button className={styles.applyButton} onClick={onClose}>
            {`Показать ${resultsCount} событий`}
          </button>
        </div>
      </div>
    </div>
  );
}
