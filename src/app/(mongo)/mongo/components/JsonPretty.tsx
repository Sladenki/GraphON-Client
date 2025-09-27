"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Button, Chip } from "@heroui/react";

type Props = {
  value: unknown;
};

export default function JsonPretty({ value }: Props) {
  const [wrap, setWrap] = useState<boolean>(false);
  const text = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      try { return String(value); } catch { return ""; }
    }
  }, [value]);

  const lines = useMemo(() => text.split("\n"), [text]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }, [text]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Chip variant="flat">{lines.length} lines</Chip>
        <Button size="sm" variant="flat" onPress={() => setWrap((w) => !w)}>{wrap ? 'Без переноса' : 'Перенос строк'}</Button>
        <Button size="sm" variant="flat" onPress={handleCopy}>Копировать</Button>
      </div>
      <div style={{
        border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'auto',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: 12,
        lineHeight: 1.5,
      }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx}>
                <td style={{
                  userSelect: 'none',
                  textAlign: 'right',
                  verticalAlign: 'top',
                  padding: '2px 8px',
                  color: '#9ca3af',
                  borderRight: '1px solid #e5e7eb',
                  width: 1,
                  whiteSpace: 'nowrap',
                }}>{idx + 1}</td>
                <td style={{
                  padding: '2px 8px',
                  whiteSpace: wrap ? 'pre-wrap' : 'pre',
                  wordBreak: wrap ? 'break-word' : 'normal',
                }}>
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


