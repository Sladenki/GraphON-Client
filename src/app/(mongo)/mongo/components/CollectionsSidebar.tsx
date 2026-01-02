"use client";

import { Button } from "@heroui/react";
import type { MongoCollectionInfo } from "../utils/types";
import { useMemo } from "react";
import { User, Heart, Users, Calendar, Network, MoreHorizontal } from "lucide-react";

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

// Определение групп коллекций
const COLLECTION_GROUPS = [
  {
    title: "Пользователь",
    collections: ["User", "user_activities", "app_downloads", "notifications"],
    icon: User,
    color: "#8A7AB8",
  },
  {
    title: "Интересы пользователя",
    collections: ["Interest", "UserInterest"],
    icon: Heart,
    color: "#F87171",
  },
  {
    title: "Друзья",
    collections: ["relationships"],
    icon: Users,
    color: "#60A5FA",
  },
  {
    title: "События",
    collections: ["Event", "EventRegs", "Schedule", "CompanyRequest"],
    icon: Calendar,
    color: "#34D399",
  },
  {
    title: "Графы",
    collections: ["Graph", "GraphSubs"],
    icon: Network,
    color: "#A78BFA",
  },
  {
    title: "Прочее",
    collections: ["request_connected_graph"],
    icon: MoreHorizontal,
    color: "#9CA3AF",
  },
];

export default function CollectionsSidebar({ dbName, collections, loading, selectedCollection, onSelect, onExportJson, onExportNdjson, onImportJson, onAddDoc, canExport, canImport, canAddDoc }: Props) {
  const handleCollectionClick = (name: string) => {
    onSelect(name);
  };

  // Группировка и сортировка коллекций
  const groupedCollections = useMemo(() => {
    if (!collections) return [];

    // Создаем map для быстрого поиска (case-insensitive)
    const collectionMap = new Map<string, MongoCollectionInfo>();
    collections.forEach(c => {
      collectionMap.set(c.name.toLowerCase(), c);
    });

    const grouped: Array<{ title: string; items: MongoCollectionInfo[] }> = [];
    const processed = new Set<string>();

    // Добавляем коллекции по группам в заданном порядке
    COLLECTION_GROUPS.forEach(group => {
      const items: MongoCollectionInfo[] = [];
      // Сохраняем порядок из group.collections
      group.collections.forEach(collectionName => {
        const key = collectionName.toLowerCase();
        const collection = collectionMap.get(key);
        if (collection) {
          items.push(collection);
          processed.add(key);
        }
      });
      if (items.length > 0) {
        grouped.push({ title: group.title, items });
      }
    });

    // Добавляем оставшиеся коллекции в "Прочее"
    const remaining: MongoCollectionInfo[] = [];
    collections.forEach(c => {
      const key = c.name.toLowerCase();
      if (!processed.has(key)) {
        remaining.push(c);
      }
    });

    if (remaining.length > 0) {
      // Сортируем оставшиеся коллекции по алфавиту
      remaining.sort((a, b) => a.name.localeCompare(b.name));
      // Проверяем, есть ли уже группа "Прочее"
      const otherGroup = grouped.find(g => g.title === "Прочее");
      if (otherGroup) {
        otherGroup.items.push(...remaining);
        // Сортируем все элементы в группе "Прочее"
        otherGroup.items.sort((a, b) => {
          const aIndex = COLLECTION_GROUPS.find(g => g.title === "Прочее")?.collections.indexOf(a.name) ?? -1;
          const bIndex = COLLECTION_GROUPS.find(g => g.title === "Прочее")?.collections.indexOf(b.name) ?? -1;
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
      } else {
        grouped.push({ title: "Прочее", items: remaining });
      }
    }

    return grouped;
  }, [collections]);

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
        {groupedCollections.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {groupedCollections.map((group, groupIndex) => {
              const groupConfig = COLLECTION_GROUPS.find(g => g.title === group.title);
              const Icon = groupConfig?.icon || MoreHorizontal;
              const color = groupConfig?.color || "#9CA3AF";
              
              return (
                <div key={groupIndex} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ 
                    fontSize: 12, 
                    fontWeight: 600, 
                    color: color,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    padding: "6px 8px",
                    marginTop: groupIndex > 0 ? 4 : 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 6,
                    backgroundColor: `${color}15`,
                  }}>
                    <Icon size={14} strokeWidth={2.5} />
                    <span>{group.title}</span>
                  </div>
                {group.items.map((c) => (
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
              );
            })}
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


