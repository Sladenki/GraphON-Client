"use client";

import { useCallback, useEffect, useRef, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import styles from "./FooterPopUp.module.scss";

interface FooterPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxHeight?: string;
  className?: string;
}

/**
 * Универсальный компонент для выдвигающихся снизу PopUp окон
 * с поддержкой свайпа вниз для закрытия
 */
export default function FooterPopUp({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxHeight = "70vh",
  className = "",
}: FooterPopUpProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const [dragTranslateY, setDragTranslateY] = useState(0);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Монтируем компонент для Portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Определяем десктоп
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Небольшая задержка для корректной работы CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateOpen(true);
        });
      });
    } else {
      setAnimateOpen(false);
    }
  }, [isOpen]);

  const handlePointerDown = useCallback((clientY: number) => {
    setIsDragging(true);
    dragStartYRef.current = clientY;
  }, []);

  const handlePointerMove = useCallback(
    (clientY: number) => {
      if (!isDragging || dragStartYRef.current == null) return;
      const delta = clientY - dragStartYRef.current;
      setDragTranslateY(Math.max(0, delta));
    },
    [isDragging]
  );

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

  if (!isOpen || !mounted) return null;

  // Стиль для драга - только когда идет перетаскивание
  const sheetStyle = {
    ...(isDragging && {
      transform: isDesktop 
        ? `translate(-50%, ${dragTranslateY}px)`
        : `translateY(${dragTranslateY}px)`,
    }),
    maxHeight,
  } as React.CSSProperties;

  const content = (
    <div 
      className={`${styles.overlay} ${animateOpen ? styles.overlayVisible : ""}`} 
      onClick={onClose}
    >
      <div
        className={`${styles.sheet} ${animateOpen ? styles.sheetOpen : ""} ${className}`}
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

        {title && (
          <div className={styles.header}>
            <h3 className={styles.title}>{title}</h3>
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <div className={styles.content}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );

  // Рендерим через Portal в document.body
  return createPortal(content, document.body);
}

