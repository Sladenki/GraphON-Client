"use client";

import { Button } from "@heroui/react";
import type { MongoCollectionInfo } from "../utils/types";

type Props = {
  dbName: string;
  collections: MongoCollectionInfo[] | null | undefined;
  loading: boolean;
  selectedCollection: string;
  onSelect: (name: string) => void;
  onExportJson?: () => void;
  onExportNdjson?: () => void;
  onImportJson?: () => void;
  onAddDoc?: () => void;
  canExport?: boolean;
  canImport?: boolean;
  canAddDoc?: boolean;
};

export default function CollectionsSidebar({ dbName, collections, loading, selectedCollection, onSelect, onExportJson, onExportNdjson, onImportJson, onAddDoc, canExport, canImport, canAddDoc }: Props) {
  const handleCollectionClick = (name: string) => {
    onSelect(name);
  };

  return (
    <aside className="flex flex-col gap-3 min-w-0" style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
      <h3 className="text-lg font-semibold m-0">Коллекции (DB: {dbName})</h3>
      <div className="border border-default-200 rounded-lg p-2 max-h-[360px] overflow-auto bg-content1" style={{ 
        border: "1px solid var(--border-color, #e5e7eb)", 
        borderRadius: 8, 
        padding: 8, 
        maxHeight: 360, 
        overflow: "auto",
        backgroundColor: "var(--block-color, #fafafa)"
      }}>
        {collections?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {collections.map((c) => (
              <Button
                key={c.name}
                variant={selectedCollection === c.name ? "solid" : "light"}
                color={selectedCollection === c.name ? "primary" : "default"}
                onPress={() => handleCollectionClick(c.name)}
                size="sm"
                fullWidth
                className="justify-start text-left cursor-pointer"
                style={{ 
                  justifyContent: "flex-start",
                  textAlign: "left",
                  cursor: "pointer"
                }}
              >
                {c.name}{c.type && c.type !== 'collection' ? ` (${c.type})` : ''}
              </Button>
            ))}
          </div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 14, padding: 8 }}>
            {loading ? "Загрузка..." : "Нет данных"}
          </div>
        )}
      </div>
      {(onExportJson || onExportNdjson || onImportJson || onAddDoc) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {onAddDoc && (
            <Button 
              variant="solid" 
              color="primary" 
              onPress={onAddDoc} 
              isDisabled={!canAddDoc}
              fullWidth
            >
              ➕ Добавить документ
            </Button>
          )}
          {onImportJson && (
            <Button 
              variant="solid" 
              color="success" 
              onPress={onImportJson} 
              isDisabled={!canImport}
              fullWidth
            >
              📁 Загрузить JSON
            </Button>
          )}
          {(onExportJson || onExportNdjson) && (
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
              {onExportJson && (
                <Button variant="flat" onPress={onExportJson} isDisabled={canExport === false}>Скачать JSON</Button>
              )}
              {onExportNdjson && (
                <Button variant="flat" onPress={onExportNdjson} isDisabled={canExport === false}>Скачать NDJSON</Button>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}


