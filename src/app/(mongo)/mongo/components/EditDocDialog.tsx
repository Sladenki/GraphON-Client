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
  const UNIVERSITIES = useMemo(() => ([
    { id: '690bfec3f371d05b325be7ad', name: 'Калининград' },
    { id: '67a499dd08ac3c0df94d6ab7', name: 'КГТУ' },
    { id: '6896447465255a1c4ed48eaf', name: 'КБК' },
  ]), []);
  
  const DEFAULT_GRAPH_ID = '690bfec3f371d05b325be7ad'; // Калининград

  const hasSelectedGraphField = useMemo(() => Boolean(doc && typeof doc === 'object' && 'selectedGraphId' in (doc as any)), [doc]);
  const originalSelectedGraphId: string = useMemo(() => extractIdLoose((doc as any)?.selectedGraphId), [doc]);
  const [selectedGraphId, setSelectedGraphId] = useState<string>("");

  // Добавляем состояние для universityGraphId
  const hasUniversityGraphField = useMemo(() => Boolean(doc && typeof doc === 'object' && 'universityGraphId' in (doc as any)), [doc]);
  const originalUniversityGraphId: string = useMemo(() => extractIdLoose((doc as any)?.universityGraphId), [doc]);
  const [universityGraphId, setUniversityGraphId] = useState<string>("");

  // Добавляем состояние для _id
  const originalDocId: string = useMemo(() => extractIdLoose((doc as any)?._id), [doc]);
  const [docId, setDocId] = useState<string>("");

  const original = useMemo(() => {
    const obj: Record<string, unknown> = {};
    if (doc && typeof doc === 'object') {
      for (const [k, v] of Object.entries(doc)) {
        if (k === '_id' || k === 'selectedGraphId' || k === 'universityGraphId') continue;
        obj[k] = v as unknown;
      }
    }
    return obj;
  }, [doc]);

  useEffect(() => {
    const next: Row[] = Object.entries(original).map(([k, v]) => ({ key: k, valueText: safeStringify(v), isNew: false, error: null }));
    setRows(next);
    if (hasSelectedGraphField) {
      setSelectedGraphId(originalSelectedGraphId || DEFAULT_GRAPH_ID);
    } else {
      setSelectedGraphId(DEFAULT_GRAPH_ID);
    }
    // Инициализируем universityGraphId
    if (hasUniversityGraphField) {
      setUniversityGraphId(originalUniversityGraphId || DEFAULT_GRAPH_ID);
    } else {
      setUniversityGraphId(DEFAULT_GRAPH_ID);
    }
    // Инициализируем docId
    setDocId(originalDocId || "");
  }, [original, open, hasSelectedGraphField, originalSelectedGraphId, hasUniversityGraphField, originalUniversityGraphId, originalDocId]);

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

    // Обработка _id
    const currentDocId = docId.trim();
    if (currentDocId && currentDocId !== originalDocId) {
      // _id изменен - добавляем в $set
      setObj['_id'] = currentDocId;
    }

    // Обработка selectedGraphId
    const currentSelectedGraphId = selectedGraphId || "";
    
    if (hasSelectedGraphField) {
      // Поле существует в документе
      if (currentSelectedGraphId !== (originalSelectedGraphId || "")) {
        if (currentSelectedGraphId && currentSelectedGraphId !== "") {
          setObj['selectedGraphId'] = currentSelectedGraphId;
        } else {
          // Поле очищено - удаляем из документа
          unsetObj['selectedGraphId'] = "";
        }
      }
    } else {
      // Поле не существует в документе
      // Добавляем только если выбрано значение отличное от дефолтного
      if (currentSelectedGraphId && currentSelectedGraphId !== "" && currentSelectedGraphId !== DEFAULT_GRAPH_ID) {
        setObj['selectedGraphId'] = currentSelectedGraphId;
      }
      // Если значение = DEFAULT, поле не добавляем в документ
    }

    // Обработка universityGraphId
    const currentUniversityGraphId = universityGraphId || "";
    
    if (hasUniversityGraphField) {
      // Поле существует в документе
      if (currentUniversityGraphId !== (originalUniversityGraphId || "")) {
        if (currentUniversityGraphId && currentUniversityGraphId !== "") {
          setObj['universityGraphId'] = currentUniversityGraphId;
        } else {
          // Поле очищено - удаляем из документа
          unsetObj['universityGraphId'] = "";
        }
      }
    } else {
      // Поле не существует в документе
      // Добавляем только если выбрано значение отличное от дефолтного
      if (currentUniversityGraphId && currentUniversityGraphId !== "" && currentUniversityGraphId !== DEFAULT_GRAPH_ID) {
        setObj['universityGraphId'] = currentUniversityGraphId;
      }
      // Если значение = DEFAULT, поле не добавляем в документ
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
    <Modal isOpen={open} onOpenChange={onClose} size="xl" backdrop="blur" scrollBehavior="inside">
      <ModalContent style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        {() => (
          <>
            <ModalHeader style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderBottom: '1px solid #e5e7eb' }}>Редактирование документа</ModalHeader>
            <ModalBody style={{ flex: '1 1 auto', overflow: 'auto' }}>
              <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>
                Значения вводите как валидный JSON (строки в кавычках, числа без). 
                <span style={{ color: '#ef4444', fontWeight: 600 }}> Изменение _id может привести к созданию нового документа!</span>
              </div>
              
              {/* Поле для редактирования _id */}
              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 8, alignItems: 'center', marginBottom: 12, padding: '8px', background: '#fef2f2', borderRadius: 8, border: '1px solid #fecaca' }}>
                <div style={{ color: '#dc2626', fontSize: 12, fontWeight: 600 }}>_id</div>
                <Input
                  value={docId}
                  onValueChange={(v) => setDocId(v)}
                  placeholder="ID документа"
                  variant="bordered"
                  size="sm"
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-red-300 bg-white"
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>Университет (selectedGraphId)</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={selectedGraphId}
                    onChange={(e) => setSelectedGraphId(e.target.value)}
                    style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 8px', flex: 1 }}
                  >
                    {!selectedGraphId && <option value="">— Не выбрано —</option>}
                    {(!UNIVERSITIES.find(u => u.id === selectedGraphId) && selectedGraphId) && (
                      <option value={selectedGraphId}>{selectedGraphId}</option>
                    )}
                    {UNIVERSITIES.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  {selectedGraphId && (
                    <Chip variant="flat">{UNIVERSITIES.find(u => u.id === selectedGraphId)?.name || selectedGraphId}</Chip>
                  )}
                </div>
                {hasSelectedGraphField && (
                  <Button 
                    size="sm" 
                    variant="flat" 
                    color="danger" 
                    onPress={() => setSelectedGraphId("")}
                  >
                    Удалить поле
                  </Button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>Университет (universityGraphId)</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={universityGraphId}
                    onChange={(e) => setUniversityGraphId(e.target.value)}
                    style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: '6px 8px', flex: 1 }}
                  >
                    {!universityGraphId && <option value="">— Не выбрано —</option>}
                    {(!UNIVERSITIES.find(u => u.id === universityGraphId) && universityGraphId) && (
                      <option value={universityGraphId}>{universityGraphId}</option>
                    )}
                    {UNIVERSITIES.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                  {universityGraphId && (
                    <Chip variant="flat">{UNIVERSITIES.find(u => u.id === universityGraphId)?.name || universityGraphId}</Chip>
                  )}
                </div>
                {hasUniversityGraphField && (
                  <Button 
                    size="sm" 
                    variant="flat" 
                    color="danger" 
                    onPress={() => setUniversityGraphId("")}
                  >
                    Удалить поле
                  </Button>
                )}
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
            <ModalFooter style={{ position: 'sticky', bottom: 0, background: '#fff', borderTop: '1px solid #e5e7eb', zIndex: 1 }}>
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

function extractIdLoose(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value._id === 'string') return value._id;
    if (value._id && typeof value._id === 'object' && typeof value._id.$oid === 'string') return value._id.$oid;
    if (typeof value.$oid === 'string') return value.$oid;
  }
  try { return String(value); } catch { return ''; }
}


