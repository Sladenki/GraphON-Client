"use client";

import { useState } from "react";
import { X } from "lucide-react";
import styles from "./EventFilter.module.scss";

interface EventFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventFilter({ isOpen, onClose }: EventFilterProps) {
  const [filterStep, setFilterStep] = useState<"date" | "category" | "summary">("date");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  if (!isOpen) return null;

  return (
    <div className={styles.filterOverlay} onClick={onClose}>
      <div className={styles.filterPopup} onClick={(e) => e.stopPropagation()}>
        <div className={styles.filterHeader}>
          <h3 className={styles.filterTitle}>Фильтры</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.filterContent}>
          {/* Чат интерфейс - всегда видим все сообщения */}
          
          {/* Вопрос 1 - дата */}
          <div className={styles.chatMessage}>
            <div className={styles.chatBot}>Бот</div>
            <div className={styles.chatText}>Выберите дату</div>
          </div>
          
          {/* Ответ на первый вопрос */}
          {selectedDate && (
            <div className={`${styles.chatMessage} ${styles.chatUser}`}>
              <div className={styles.chatText}>{selectedDate}</div>
              <div className={styles.chatBot}>Вы</div>
            </div>
          )}
          
          {/* Вопрос 2 - тематика */}
          {selectedDate && (
            <>
              <div className={styles.chatMessage}>
                <div className={styles.chatBot}>Бот</div>
                <div className={styles.chatText}>Выберите тематику события</div>
              </div>
              
              {/* Ответ на второй вопрос */}
              {selectedCategory && filterStep === "summary" && (
                <div className={`${styles.chatMessage} ${styles.chatUser}`}>
                  <div className={styles.chatText}>{selectedCategory}</div>
                  <div className={styles.chatBot}>Вы</div>
                </div>
              )}
            </>
          )}
          
          {/* Ваш выбор - если всё заполнено */}
          {filterStep === "summary" && selectedDate && selectedCategory && (
            <div className={styles.chatMessage}>
              <div className={styles.chatBot}>Бот</div>
              <div className={styles.chatSummary}>
                <p className={styles.summaryTitle}>Ваш выбор:</p>
                <div className={styles.summaryItems}>
                  <div className={styles.summaryItem}>Дата: {selectedDate}</div>
                  <div className={styles.summaryItem}>Тематика: {selectedCategory}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Кнопки ответов */}
          <div className={styles.filterButtons}>
            {filterStep === "date" && (
              <>
                <button className={styles.filterOption} onClick={() => { setSelectedDate("Сегодня"); setFilterStep("category"); }}>
                  Сегодня
                </button>
                <button className={styles.filterOption} onClick={() => { setSelectedDate("Завтра"); setFilterStep("category"); }}>
                  Завтра
                </button>
                <button className={styles.filterOption} onClick={() => { setSelectedDate("Выбрать дату"); setFilterStep("category"); }}>
                  Выбрать дату
                </button>
                <button className={styles.filterOption} onClick={() => { setSelectedDate("Всё равно"); setFilterStep("category"); }}>
                  Всё равно
                </button>
              </>
            )}
            
            {filterStep === "category" && (
              <>
                <button className={styles.filterOption} onClick={() => { setSelectedCategory("Вечеринка"); setFilterStep("summary"); }}>
                  Вечеринка
                </button>
                <button className={styles.filterOption} onClick={() => { setSelectedCategory("Выставка"); setFilterStep("summary"); }}>
                  Выставка
                </button>
                <button className={styles.filterOption} onClick={() => { setSelectedCategory("Юмор"); setFilterStep("summary"); }}>
                  Юмор
                </button>
              </>
            )}
            
            {filterStep === "summary" && selectedDate && selectedCategory && (
              <button className={styles.changeButton} onClick={() => setFilterStep("date")}>
                Изменить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
