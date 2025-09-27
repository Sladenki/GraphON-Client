"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Chip } from "@heroui/react";

type Row = {
  key: string;
  valueText: string;
  isNew?: boolean;
  error?: string | null;
};

type Props = {
  open: boolean;
  doc: Record<string, unknown> | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => void;
};

export default function EditDocDialog({ open, doc, loading, onClose, onSave }: Props) {
  const [rows, setRows] = useState<Row[]>([]);

  const original = useMemo(() => {
    const obj: Record<string, unknown> = {};
    if (doc && typeof doc === 'object') {
      for (const [k, v] of Object.entries(doc)) {
        if (k === '_id') continue;
        obj[k] = v as unknown;
      }
    }
    return obj;
  }, [doc]);

  useEffect(() => {
    const next: Row[] = Object.entries(original).map(([k, v]) => ({ key: k, valueText: safeStringify(v), isNew: false, error: null }));
    setRows(next);
  }, [original, open]);

  const handleChangeKey = (idx: number, key: string) => {
    setRows((r) => r.map((row, i) => i === idx ? { ...row, key } : row));
  };

  const handleChangeValue = (idx: number, valueText: string) => {
    setRows((r) => r.map((row, i) => i === idx ? { ...row, valueText, error: null } : row));
  };

  const handleRemoveRow = (idx: number) => {
    setRows((r) => r.filter((_, i) => i !== idx));
  };

  const handleAddRow = () => {
    setRows((r) => [...r, { key: "", valueText: "", isNew: true, error: null }]);
  };

  const parseValue = (text: string): { ok: true; value: unknown } | { ok: false; error: string } => {
    try {
      // Require valid JSON for safety
      const parsed = JSON.parse(text);
      return { ok: true, value: parsed };
    } catch (e) {
      return { ok: false, error: 'Невалидный JSON' };
    }
  };

  const computePayload = (): { ok: true; payload: Record<string, unknown> } | { ok: false; error: string } => {
    const keySet = new Set<string>();
    const setObj: Record<string, unknown> = {};
    const unsetObj: Record<string, ""> = {};

    for (const row of rows) {
      const key = row.key.trim();
      if (!key) return { ok: false, error: 'Пустой ключ недопустим' };
      if (keySet.has(key)) return { ok: false, error: `Дублирующийся ключ: ${key}` };
      keySet.add(key);

      const parsed = parseValue(row.valueText);
      if (!parsed.ok) return { ok: false, error: `Поле ${key}: ${parsed.error}` };
      const newVal = parsed.value;
      const oldVal = original[key];
      const changed = !deepEqual(oldVal, newVal);
      if (changed) setObj[key] = newVal;
    }

    for (const key of Object.keys(original)) {
      if (!keySet.has(key)) unsetObj[key] = "";
    }

    const hasSet = Object.keys(setObj).length > 0;
    const hasUnset = Object.keys(unsetObj).length > 0;
    if (!hasSet && !hasUnset) return { ok: false, error: 'Изменений не обнаружено' };
    const payload: Record<string, unknown> = hasSet && hasUnset
      ? { $set: setObj, $unset: unsetObj }
      : hasSet
        ? { $set: setObj }
        : { $unset: unsetObj };
    return { ok: true, payload };
  };

  const handleSave = () => {
    const res = computePayload();
    if (!res.ok) {
      alert(res.error);
      return;
    }
    onSave(res.payload);
  };

  return (
    <Modal isOpen={open} onOpenChange={onClose} size="xl" backdrop="blur" scrollBehavior="outside">
      <ModalContent>
        {() => (
          <>
            <ModalHeader>Редактирование документа</ModalHeader>
            <ModalBody>
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>
                Значения вводите как валидный JSON (строки в кавычках, числа без). Изменение <b>_id</b> недоступно.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rows.map((row, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 8, alignItems: 'start' }}>
                    <Input label="Поле" value={row.key} onValueChange={(v) => handleChangeKey(idx, v)} isDisabled={!row.isNew} placeholder="ключ" />
                    <Textarea label="Значение (JSON)" minRows={2} value={row.valueText} onValueChange={(v) => handleChangeValue(idx, v)} placeholder='"Иван" | 123 | true | null | {"a":1}' />
                    <Button size="sm" variant="flat" color="danger" onPress={() => handleRemoveRow(idx)}>Удалить</Button>
                  </div>
                ))}
                <div>
                  <Button size="sm" variant="flat" onPress={handleAddRow}>Добавить поле</Button>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Chip color="warning" variant="flat">Сохранение изменит данные. Действие необратимо.</Chip>
              <Button variant="flat" onPress={onClose} isDisabled={loading}>Отмена</Button>
              <Button color="primary" onPress={handleSave} isLoading={loading}>Сохранить</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    try { return String(value); } catch { return ""; }
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return a === b;
  }
}


