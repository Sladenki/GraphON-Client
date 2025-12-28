'use client';

import React from 'react';
import PopUpWrapper from '@/components/global/PopUpWrapper/PopUpWrapper';
import { CreateEventForm } from '@/components/admin/CreateEventForm/CreateEventForm';
import { useAuth } from '@/providers/AuthProvider';
import styles from './CreateEventModal.module.scss';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSuggestion?: boolean; // Для "Предложить мероприятие"
}

export default function CreateEventModal({ isOpen, onClose, isSuggestion = false }: CreateEventModalProps) {
  const { user } = useAuth();

  const handleSuccess = () => {
    // Закрываем модальное окно после успешного создания с небольшой задержкой
    // чтобы пользователь успел увидеть уведомление об успехе
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <PopUpWrapper 
      isOpen={isOpen} 
      onClose={onClose}
      width="90%"
      height="auto"
      contentClassName={styles.modalContent}
    >
      <div className={styles.modalHeader}>
        <h2 className={styles.title}>
          {isSuggestion ? 'Предложить мероприятие' : 'Создать мероприятие'}
        </h2>
      </div>
      <div className={styles.modalBody}>
        <CreateEventForm 
          globalGraphId={user?.selectedGraphId || ''} 
          hideGraphDropdown={true}
          onSuccess={handleSuccess}
        />
      </div>
    </PopUpWrapper>
  );
}

