"use client";

import { Button } from "@heroui/react";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

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

export default function ConfirmDialog({ 
  open, 
  title, 
  description, 
  confirmText = "Подтвердить", 
  cancelText = "Отмена", 
  onConfirm, 
  onClose, 
  danger, 
  loading 
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const content = (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--background-color, #ffffff)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: 'var(--main-text, #333)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s',
            opacity: loading ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          ×
        </button>

        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 600 }}>
          {title}
        </h2>

        {description && (
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--main-text, #333)' }}>
            {description}
          </p>
        )}

        <div style={{ 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'flex-end' 
        }}>
          <Button 
            variant="flat" 
            onPress={onClose} 
            isDisabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            color={danger ? "danger" : "primary"} 
            onPress={onConfirm} 
            isLoading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
