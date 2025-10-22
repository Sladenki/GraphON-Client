import { useEffect, useState } from 'react';

let modalRefCount = 0;
let modalContainer: HTMLElement | null = null;

// Функция для проверки состояния модальных окон
export const getModalState = () => {
  return {
    isAnyModalOpen: modalRefCount > 0
  };
};

export const useModalManager = () => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Создаем контейнер только один раз
    if (!modalContainer) {
      modalContainer = document.createElement('div');
      modalContainer.id = 'modal-root';
      modalContainer.style.position = 'relative';
      modalContainer.style.zIndex = '9999';
      document.body.appendChild(modalContainer);
    }
    
    modalRefCount++;
    setContainer(modalContainer);

    return () => {
      modalRefCount--;
      
      // Удаляем контейнер только когда он больше не используется
      if (modalRefCount === 0 && modalContainer?.parentNode) {
        document.body.removeChild(modalContainer);
        modalContainer = null;
      }
    };
  }, []);

  return container;
};
