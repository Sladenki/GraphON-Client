"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Chip } from "@heroui/react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
  loading: boolean;
  collection: string;
};

export default function ImportDialog({ isOpen, onClose, onImport, loading, collection }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.json')) {
        setError('Пожалуйста, выберите JSON файл');
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Размер файла не должен превышать 10MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      await onImport(selectedFile);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при импорте');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isOpen || !mounted) return null;

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
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        style={{
          backgroundColor: 'var(--background-color, #ffffff)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'var(--main-text, #333)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          ×
        </button>

        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', fontWeight: 600 }}>
          Импорт данных в коллекцию &quot;{collection}&quot;
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
              Выберите JSON файл для импорта. Файл должен содержать массив объектов.
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>
              Поддерживается MongoDB Extended JSON формат (_id, $oid, $date и т.д.)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              style={{
                display: "block",
                width: "100%",
                padding: 8,
                border: "1px solid var(--border-color, #e5e7eb)",
                borderRadius: 8,
                cursor: "pointer",
              }}
              disabled={loading}
            />
          </div>

          {selectedFile && (
            <div style={{ 
              padding: 12, 
              backgroundColor: "var(--bg-secondary, #f3f4f6)", 
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{selectedFile.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                  {formatFileSize(selectedFile.size)}
                </div>
              </div>
              <Chip color="success" size="sm">Готов к импорту</Chip>
            </div>
          )}

          {error && (
            <div style={{
              padding: 12,
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              borderRadius: 8,
              fontSize: 14,
            }}>
              {error}
            </div>
          )}

          <div style={{
            padding: 12,
            backgroundColor: "#dbeafe",
            borderRadius: 8,
            fontSize: 12,
            color: "#1e40af"
          }}>
            <strong>Примечание:</strong> Импорт добавит документы в коллекцию. 
            Если документ с таким _id уже существует, он будет пропущен.
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 12, 
          justifyContent: 'flex-end', 
          marginTop: 24 
        }}>
          <Button 
            color="danger" 
            variant="light" 
            onPress={handleClose} 
            isDisabled={loading}
          >
            Отмена
          </Button>
          <Button 
            color="primary" 
            onPress={handleImport} 
            isDisabled={!selectedFile || loading}
            isLoading={loading}
          >
            {loading ? "Импортирую..." : "Импортировать"}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
