"use client";

import React from "react";
import { Chip } from "@heroui/react";
import type { MongoCollectionInfo } from "../utils/types";
import { formatBytes, formatNumber } from "../utils/format";

type Props = {
  info: MongoCollectionInfo;
};

export default function CollectionStatsPanel({ info }: Props) {
  return (
    <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <strong style={{ fontSize: 16 }}>{info.name}</strong>
        {info.type && info.type !== 'collection' && (
          <Chip size="sm" variant="flat">{info.type}</Chip>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 12 }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Документов</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatNumber(info.count) || '—'}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Данные</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatBytes(info.sizeBytes) || '—'}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Хранение</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatBytes(info.storageBytes) || '—'}</div>
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Индексы</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{formatBytes(info.totalIndexBytes) || '—'}</div>
        </div>
      </div>
    </div>
  );
}


