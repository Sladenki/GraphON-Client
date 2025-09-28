"use client";

import { Button } from "@heroui/react";
import type { MongoCollectionInfo } from "../utils/types";

type Props = {
  dbName: string;
  collections: MongoCollectionInfo[] | null | undefined;
  loading: boolean;
  selectedCollection: string;
  onSelect: (name: string) => void;
};

export default function CollectionsSidebar({ dbName, collections, loading, selectedCollection, onSelect }: Props) {
  return (
    <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ margin: 0 }}>Коллекции (DB: {dbName})</h3>
      <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 8, maxHeight: 360, overflow: "auto" }}>
        {collections?.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {collections.map((c) => (
              <Button
                key={c.name}
                variant={selectedCollection === c.name ? "solid" : "light"}
                color={selectedCollection === c.name ? "primary" : "default"}
                onPress={() => onSelect(c.name)}
                size="sm"
              >
                <span>{c.name}{c.type && c.type !== 'collection' ? ` (${c.type})` : ''}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div style={{ color: "#6b7280", fontSize: 14 }}>
            {loading ? "Загрузка..." : "Нет данных"}
          </div>
        )}
      </div>
    </aside>
  );
}


