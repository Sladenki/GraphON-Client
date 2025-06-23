import { useEffect, useState, useCallback } from 'react';

// Глобальный счетчик ссылок на модальный контейнер
let modalRefCount = 0;

interface ModalManagerState {
  isAnyModalOpen: boolean;
  openModals: Set<string>;
}

// Глобальное состояние для отслеживания открытых modal окон
const globalState: ModalManagerState = {
  isAnyModalOpen: false,
  openModals: new Set(),
};

const listeners: Array<(state: ModalManagerState) => void> = [];

// Функции для управления глобальным состоянием
const notifyListeners = () => {
  listeners.forEach(listener => listener({ ...globalState }));
};

const addModal = (modalId: string) => {
  globalState.openModals.add(modalId);
  globalState.isAnyModalOpen = globalState.openModals.size > 0;
  notifyListeners();
};

const removeModal = (modalId: string) => {
  globalState.openModals.delete(modalId);
  globalState.isAnyModalOpen = globalState.openModals.size > 0;
  notifyListeners();
};

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

// Хук для отслеживания состояния modal окон
export const useModalState = () => {
  const [state, setState] = useState(globalState);

  useEffect(() => {
    const listener = (newState: ModalManagerState) => {
      setState(newState);
    };
    
    listeners.push(listener);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  const registerModal = useCallback((modalId: string) => {
    addModal(modalId);
    return () => removeModal(modalId);
  }, []);

  return {
    isAnyModalOpen: state.isAnyModalOpen,
    openModals: state.openModals,
    registerModal,
  };
};

// Экспортируем функцию для проверки состояния modal окон (для других компонентов)
export const getModalState = () => globalState; 