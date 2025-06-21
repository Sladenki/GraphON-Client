import { useEffect, useState } from 'react';

// Глобальный счетчик ссылок на модальный контейнер
let modalRefCount = 0;

export const useModalManager = () => {
  const [modalContainer, setModalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Создаем или находим контейнер для модальных окон
    let container = document.getElementById('modal-root');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-root';
      container.style.position = 'relative';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    // Увеличиваем счетчик ссылок
    modalRefCount++;
    setModalContainer(container);

    // Cleanup при размонтировании
    return () => {
      // Уменьшаем счетчик ссылок
      modalRefCount--;
      
      // Удаляем контейнер только если он больше не используется
      if (modalRefCount === 0 && container && container.parentNode) {
        try {
          document.body.removeChild(container);
        } catch (error) {
          // Игнорируем ошибку если контейнер уже удален
          console.warn('Modal container already removed:', error);
        }
      }
    };
  }, []);

  return modalContainer;
}; 