import React from 'react';
import { Button } from '@heroui/react';
import { Trash2, X } from 'lucide-react';
import PopUpWrapper from '../../../global/PopUpWrapper/PopUpWrapper';
import styles from './DeleteConfirmPopUp.module.scss';

interface DeleteConfirmPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
  isDeleting?: boolean;
}

const DeleteConfirmPopUp: React.FC<DeleteConfirmPopUpProps> = ({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  isDeleting = false
}) => {
  return (
    <PopUpWrapper 
      isOpen={isOpen} 
      onClose={onClose} 
      width={400} 
      height="auto"
      modalId="delete-confirm-popup"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Trash2 size={24} className={styles.deleteIcon} />
          </div>
          <h2 className={styles.title}>Подтвердите удаление</h2>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>
            Вы уверены, что хотите удалить мероприятие?
          </p>
          <p className={styles.eventName}>
            &quot;{eventName}&quot;
          </p>
          <p className={styles.warning}>
            Это действие нельзя отменить
          </p>
        </div>
        
        <div className={styles.actions}>
          <Button
            color="default"
            variant="flat"
            onPress={onClose}
            isDisabled={isDeleting}
            startContent={<X size={16} />}
            className={styles.cancelButton}
          >
            Отменить
          </Button>
          <Button
            color="danger"
            variant="solid"
            onPress={onConfirm}
            isLoading={isDeleting}
            startContent={!isDeleting ? <Trash2 size={16} /> : undefined}
            className={styles.confirmButton}
          >
            Удалить
          </Button>
        </div>
      </div>
    </PopUpWrapper>
  );
};

export default DeleteConfirmPopUp; 