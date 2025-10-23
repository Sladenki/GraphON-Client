import { useEffect, useState } from 'react';

let openModalCount = 0; // Количество реально открытых модалок
let modalContainer: HTMLElement | null = null;

// Функция для проверки состояния модальных окон
export const getModalState = () => {
  return {
    isAnyModalOpen: openModalCount > 0,
  };
};

// Управление счетчиком открытых модалок
export const incrementModalOpenCount = () => {
  openModalCount = Math.max(0, openModalCount) + 1;
};

export const decrementModalOpenCount = () => {
  openModalCount = Math.max(0, openModalCount - 1);
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
    
    setContainer(modalContainer);
  }, []);

  return container;
};
