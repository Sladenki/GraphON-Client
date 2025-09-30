"use client";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
  loading?: boolean;
};

export default function ConfirmDialog({ open, title, description, confirmText = "Подтвердить", cancelText = "Отмена", onConfirm, onClose, danger, loading }: Props) {
  return (
    <Modal isOpen={open} onOpenChange={onClose} backdrop="blur">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>{title}</ModalHeader>
            <ModalBody>
              {description && <p>{description}</p>}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onPress={onClose} isDisabled={loading}>{cancelText}</Button>
              <Button color={danger ? "danger" : "primary"} onPress={onConfirm} isLoading={loading}>{confirmText}</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}


