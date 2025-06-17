import { useEffect, useState } from 'react';

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
    
    setModalContainer(container);

    // Cleanup при размонтировании
    return () => {
      if (container && container.children.length === 0) {
        document.body.removeChild(container);
      }
    };
  }, []);

  return modalContainer;
}; 