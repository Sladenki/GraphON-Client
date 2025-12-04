"use client";

import { useState, useEffect } from "react";
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Chip, Textarea } from "@heroui/react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (doc: Record<string, unknown>) => Promise<void>;
  loading: boolean;
  collection: string;
};

export default function AddDocDialog({ isOpen, onClose, onInsert, loading, collection }: Props) {
  const [jsonText, setJsonText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [parsedDoc, setParsedDoc] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setJsonText("");
      setError(null);
      setParsedDoc(null);
    }
  }, [isOpen]);

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    setError(null);
    setParsedDoc(null);

    if (!value.trim()) {
      return;
    }

    try {
      const parsed = JSON.parse(value);
      
      // Валидация: должен быть объект, не массив
      if (Array.isArray(parsed)) {
        setError("Ожидается объект документа, а не массив. Для импорта массива используйте функцию импорта.");
        return;
      }

      if (typeof parsed !== 'object' || parsed === null) {
        setError("Ожидается объект документа");
        return;
      }

      // Преобразуем MongoDB Extended JSON формат
      const transformed = transformMongoExtendedJSON(parsed);
      setParsedDoc(transformed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Невалидный JSON");
    }
  };

  const handleInsert = async () => {
    if (!parsedDoc) {
      setError("Введите валидный JSON документ");
      return;
    }

    try {
      await onInsert(parsedDoc);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка при добавлении документа");
    }
  };

  const handleClose = () => {
    setJsonText("");
    setError(null);
    setParsedDoc(null);
    onClose();
  };

  // Пример документа для подсказки
  const exampleDoc = collection === "User" 
    ? `{
  "_id": {
    "$oid": "6870e8dd6e49885e954e4d25"
  },
  "role": "user",
  "firstName": "Иван",
  "lastName": "Иванов",
  "username": "ivanov123",
  "telegramId": "123456789",
  "graphSubsNum": 0,
  "postsNum": 0,
  "attentedEventsNum": 0,
  "isStudent": true,
  "universityGraphId": {
    "$oid": "67a499dd08ac3c0df94d6ab7"
  },
  "selectedGraphId": {
    "_id": {
      "$oid": "67a499dd08ac3c0df94d6ab7"
    },
    "name": "КГТУ"
  }
}`
    : `{
  "field1": "value1",
  "field2": 123,
  "field3": true
}`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl" scrollBehavior="inside">
      <ModalContent style={{ maxHeight: '90vh' }}>
        <ModalHeader className="flex flex-col gap-1">
          Добавить документ в коллекцию &quot;{collection}&quot;
        </ModalHeader>
        <ModalBody>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{
              padding: 12,
              backgroundColor: "#dbeafe",
              borderRadius: 8,
              fontSize: 13,
              color: "#1e40af"
            }}>
              <strong>Подсказка:</strong> Вставьте JSON документ ниже. Поддерживается MongoDB Extended JSON формат (_id, $oid, $date и т.д.)
            </div>

            <Textarea
              label="JSON документ"
              placeholder={exampleDoc}
              value={jsonText}
              onValueChange={handleJsonChange}
              minRows={15}
              maxRows={25}
              classNames={{
                input: "font-mono text-sm",
              }}
              isDisabled={loading}
            />

            {error && (
              <div style={{
                padding: 12,
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: 8,
                fontSize: 14,
              }}>
                <strong>Ошибка:</strong> {error}
              </div>
            )}

            {parsedDoc && !error && (
              <div style={{
                padding: 12,
                backgroundColor: "#dcfce7",
                borderRadius: 8,
              }}>
                <Chip color="success" size="sm">✓ JSON валиден и готов к добавлению</Chip>
                <div style={{ marginTop: 8, fontSize: 12, color: "#166534" }}>
                  Будет добавлен документ с {Object.keys(parsedDoc).length} полями
                </div>
              </div>
            )}

            <details style={{ fontSize: 13, color: "#6b7280" }}>
              <summary style={{ cursor: "pointer", fontWeight: 500, marginBottom: 8 }}>
                Пример документа для коллекции User
              </summary>
              <pre style={{
                padding: 12,
                backgroundColor: "#f3f4f6",
                borderRadius: 8,
                overflow: "auto",
                fontSize: 12,
                fontFamily: "monospace"
              }}>
                {exampleDoc}
              </pre>
            </details>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={handleClose} isDisabled={loading}>
            Отмена
          </Button>
          <Button 
            color="primary" 
            onPress={handleInsert} 
            isDisabled={!parsedDoc || !!error || loading}
            isLoading={loading}
          >
            {loading ? "Добавляю..." : "Добавить документ"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Функция для преобразования MongoDB Extended JSON в обычные типы
function transformMongoExtendedJSON(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Обработка $oid
  if (typeof obj === 'object' && '$oid' in obj) {
    return obj.$oid;
  }

  // Обработка _id с $oid
  if (typeof obj === 'object' && '_id' in obj && typeof obj._id === 'object' && '$oid' in obj._id) {
    return { ...transformMongoExtendedJSON({ ...obj, _id: undefined }), _id: obj._id.$oid };
  }

  // Обработка $date
  if (typeof obj === 'object' && '$date' in obj) {
    return new Date(obj.$date);
  }

  // Рекурсивная обработка объектов
  if (typeof obj === 'object' && !Array.isArray(obj)) {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = transformMongoExtendedJSON(value);
    }
    return result;
  }

  // Рекурсивная обработка массивов
  if (Array.isArray(obj)) {
    return obj.map(item => transformMongoExtendedJSON(item));
  }

  return obj;
}

