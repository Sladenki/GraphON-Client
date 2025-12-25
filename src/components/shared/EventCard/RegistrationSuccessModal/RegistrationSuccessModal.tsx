/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react';
import { motion } from 'framer-motion';
import * as htmlToImage from 'html-to-image';
import styles from './RegistrationSuccessModal.module.scss';
import { ShareableEventCard } from '../ShareableEventCard/ShareableEventCard';
import { X, Send, Download } from 'lucide-react';
import { notifyError } from '@/lib/notifications';

type RegistrationSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    name: string;
    description?: string;
  };
  user: {
    name: string;
    avatarUrl?: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent?: string;
  };
};

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, data] = dataUrl.split(',');
  const mime = meta.match(/data:(.*);base64/)?.[1] ?? 'image/png';
  const binStr = atob(data);
  const len = binStr.length;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
  return new File([arr], filename, { type: mime });
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  event,
  user,
  theme,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastImageDataUrl, setLastImageDataUrl] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const PREVIEW_SCALE = 0.78;

  const eventUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/events/${event.id}`;
  }, [event.id]);

  const generateImage = useCallback(async () => {
    if (!captureRef.current) return null;
    if (isGenerating) return lastImageDataUrl;
    setIsGenerating(true);
    try {
      // Даем браузеру дорендерить (важно для анимаций/шрифтов)
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const dataUrl = await htmlToImage.toPng(captureRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        // делаем попытку корректной отрисовки внешних картинок
        useCORS: true,
        // чтобы библиотека не подкладывала белый фон
        backgroundColor: 'transparent',
      });
      setLastImageDataUrl(dataUrl);
      return dataUrl;
    } catch (e) {
      notifyError('Не удалось создать изображение', 'Попробуйте ещё раз');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Прегенерация изображения при открытии модалки — чтобы share работал “с клика” (и не ломался pop-up блокером)
  useEffect(() => {
    if (!isOpen) return;
    // Если уже есть изображение — не генерируем повторно
    if (lastImageDataUrl) return;
    const t = setTimeout(() => {
      void generateImage();
    }, 0);
    return () => clearTimeout(t);
  }, [generateImage, isOpen, lastImageDataUrl]);

  const downloadImage = useCallback(async () => {
    const dataUrl = lastImageDataUrl ?? (await generateImage());
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `graphon-event-${event.id}.png`;
    a.click();
  }, [event.id, generateImage, lastImageDataUrl]);

  const handleTelegramShare = useCallback(async () => {
    const url = eventUrl;
    const text = `Пойдём со мной на «${event.name}»!\n${url}`;
    // На Windows `navigator.share` открывает системное окно шаринга (не Telegram).
    // Поэтому на Windows/desktop пропускаем navigator.share и открываем Telegram web share (как в шапке).
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isWindows = /Windows/i.test(ua);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);

    // Web share URL (как в EventCard.handleShare)
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;

    if (isWindows && !isMobile) {
      const opened = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
      if (opened) return;
      try {
        window.location.href = telegramUrl;
        return;
      } catch {
        // ignore
      }
      await downloadImage();
      return;
    }

    // 1) Если можем шарить ФАЙЛОМ — это единственный способ получить "выбор чата" в Telegram с картинкой
    // (обычно работает на Android/iOS; на desktop почти всегда недоступно).
    try {
      const nav: any = navigator;
      const dataUrl = lastImageDataUrl ?? (await generateImage());
      if (dataUrl) {
        const file = dataUrlToFile(dataUrl, `graphon-event-${event.id}.png`);
        if (nav?.canShare?.({ files: [file] }) && nav?.share) {
          // Не передаём url отдельно, чтобы Telegram не дублировал ссылку
          await nav.share({
            files: [file],
            title: event.name,
            text,
          });
          return;
        }
      }
    } catch {
      // fallback ниже
    }

    // Критично: открываем Telegram СИНХРОННО относительно клика (иначе pop-up блокируется).
    const opened = window.open(telegramUrl, '_blank', 'noopener,noreferrer');
    if (opened) return;

    // Если pop-up заблокирован — пробуем открыть в текущей вкладке
    try {
      window.location.href = telegramUrl;
      return;
    } catch {
      // ignore
    }

    // Если всплывающее окно заблокировано — копируем ссылку + скачиваем изображение
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
    await downloadImage();
  }, [downloadImage, event.id, event.name, eventUrl, generateImage, lastImageDataUrl]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      // Нужен blur + общее затемнение фона
      backdrop="transparent"
      size="xl"
      placement="center"
      classNames={{
        backdrop: 'bg-black/40 backdrop-blur-xl',
        base: 'shadow-none',
      }}
    >
      {/* Убираем любые дефолтные тени у контента */}
      <ModalContent className={`${styles.modalContent} bg-neutral-background shadow-none`}>
        {(close) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="min-w-0">
                  <div className="text-[18px] font-semibold text-text-primary">Вы записаны!</div>
                  <div className="text-[13px] text-text-secondary">Поделитесь карточкой, чтобы позвать друзей</div>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  aria-label="Закрыть"
                  onPress={close}
                  className="text-text-secondary"
                >
                  <X size={18} />
                </Button>
              </div>
            </ModalHeader>
            {/* Кнопки должны быть под карточкой, поэтому переносим их в body */}
            <ModalBody className="pt-2 pb-5">
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Preview (scaled) */}
                <div className="w-full flex justify-center">
                  {/* Важно: scale() не меняет layout, поэтому задаём контейнеру реальные размеры scaled-превью */}
                  <div
                    className="relative"
                    style={{
                      width: `${400 * PREVIEW_SCALE}px`,
                      height: `${711 * PREVIEW_SCALE}px`,
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left' }}
                    >
                      <ShareableEventCard
                        eventName={event.name}
                      eventDescription={event.description}
                        eventUrl={eventUrl}
                        theme={theme}
                        user={user}
                      />
                    </div>
                  </div>
                </div>

                {/* Offscreen render for capture */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                  <ShareableEventCard
                    ref={captureRef}
                    eventName={event.name}
                    eventDescription={event.description}
                    eventUrl={eventUrl}
                    theme={theme}
                    user={user}
                    variant="capture"
                  />
                </div>

                {/* Buttons under the card */}
                <div className="w-full flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center -mt-1">
                  <Button
                    className={`${styles.primaryGlowButton} bg-primary text-white flex-1 sm:flex-none`}
                    onPress={() => void handleTelegramShare()}
                    isDisabled={isGenerating}
                    startContent={<Send size={16} />}
                  >
                    Поделиться в ТГ
                  </Button>
                  <Button
                    variant="bordered"
                    className="border-neutral-border text-text-primary flex-1 sm:flex-none"
                    onPress={() => void downloadImage()}
                    isDisabled={isGenerating}
                    startContent={<Download size={16} />}
                  >
                    Скачать изображение
                  </Button>
                </div>
              </motion.div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};


