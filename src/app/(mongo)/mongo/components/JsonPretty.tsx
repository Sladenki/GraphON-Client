"use client";

import React, { useMemo, useState } from "react";

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

  const highlightLine = (line: string) => {
    const nodes: React.ReactNode[] = [];
    const isDigit = (ch: string) => /[0-9]/.test(ch);
    const isWhitespace = (ch: string) => ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n';
    let i = 0;
    while (i < line.length) {
      const ch = line[i];

      // String (with escape support)
      if (ch === '"') {
        let j = i + 1;
        let escaped = false;
        while (j < line.length) {
          const cj = line[j];
          if (escaped) {
            escaped = false;
          } else if (cj === '\\') {
            escaped = true;
          } else if (cj === '"') {
            break;
          }
          j++;
        }
        const token = line.slice(i, Math.min(j + 1, line.length));
        // Determine if this string is a key (followed by optional spaces and ':')
        let k = j + 1;
        while (k < line.length && isWhitespace(line[k])) k++;
        const isKey = k < line.length && line[k] === ':';
        nodes.push(
          <span key={i} style={{ color: isKey ? '#6d28d9' : '#047857' }}>{token}</span>
        );
        i = Math.min(j + 1, line.length);
        continue;
      }

      // ObjectId('...') like tokens
      if (line.startsWith('ObjectId', i)) {
        let j = i + 'ObjectId'.length;
        while (j < line.length && line[j] !== ')') j++;
        if (j < line.length) j++;
        const token = line.slice(i, j);
        nodes.push(<span key={i} style={{ color: '#b91c1c' }}>{token}</span>);
        i = j;
        continue;
      }

      // Numbers
      if (ch === '-' || isDigit(ch)) {
        const numMatch = line.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/);
        if (numMatch) {
          const token = numMatch[0];
          nodes.push(<span key={i} style={{ color: '#1d4ed8' }}>{token}</span>);
          i += token.length;
          continue;
        }
      }

      // Booleans
      if (line.startsWith('true', i) || line.startsWith('false', i)) {
        const token = line.startsWith('true', i) ? 'true' : 'false';
        nodes.push(<span key={i} style={{ color: '#b45309' }}>{token}</span>);
        i += token.length;
        continue;
      }

      // null
      if (line.startsWith('null', i)) {
        nodes.push(<span key={i} style={{ color: '#374151' }}>null</span>);
        i += 4;
        continue;
      }

      // Punctuation
      if ('{}[]:,'.includes(ch)) {
        nodes.push(<span key={i} style={{ color: '#111827' }}>{ch}</span>);
        i++;
        continue;
      }

      // Default char
      nodes.push(<span key={i}>{ch}</span>);
      i++;
    }
    return nodes;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                  color: '#6b7280',
                  borderRight: '1px solid #e5e7eb',
                  width: 1,
                  whiteSpace: 'nowrap',
                }}>{idx + 1}</td>
                <td style={{
                  padding: '2px 8px',
                  whiteSpace: wrap ? 'pre-wrap' : 'pre',
                  wordBreak: wrap ? 'break-word' : 'normal',
                }}>
                  {highlightLine(line)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


