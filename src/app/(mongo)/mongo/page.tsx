"use client";

import React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea, Spinner, Chip } from "@heroui/react";
import { toast } from "sonner";
import { useMongoCollections } from "./hooks/useMongoCollections";
import { useMongoFind } from "./hooks/useMongoFind";
import { useMongoDocOps } from "./hooks/useMongoDocOps";
import ConfirmDialog from "./components/ConfirmDialog";
import { safeParseJson, extractId } from "./utils/json";
import CollectionStatsPanel from "./components/CollectionStatsPanel";
import JsonPretty from "./components/JsonPretty";
import type { MongoDocument, MongoCollectionInfo } from "./utils/types";

const DB_NAME = "test"; // всегда используем test по требованию
const KGTU_GRAPH_ID = "67a499dd08ac3c0df94d6ab7";
const KBK_GRAPH_ID = "6896447465255a1c4ed48eaf";

export default function MongoPage() {
  const { data: collections, loading: collectionsLoading, error: collectionsError, refetch } = useMongoCollections(DB_NAME);
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  const [queryText, setQueryText] = useState<string>("{}");
  const [sortText, setSortText] = useState<string>("{}");
  const [projectionText, setProjectionText] = useState<string>("{}");
  const [limit, setLimit] = useState<number>(20);
  const [skip, setSkip] = useState<number>(0);

  const { data: docs, loading: searching, error: resultsError, durationMs, find } = useMongoFind(DB_NAME);
  const { loading: docMutating, patch, remove } = useMongoDocOps(DB_NAME);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState<{ mode: 'delete' | 'patch'; id: string; payload?: string } | null>(null);
  const [searchText, setSearchText] = useState<string>("");

  const canSearch = useMemo(() => Boolean(selectedCollection), [selectedCollection]);

  useEffect(() => {
    if (!selectedCollection && collections && collections.length) {
      setSelectedCollection(collections[0]?.name || "");
    }
  }, [collections, selectedCollection]);

  const handleFind = useCallback(async () => {
    if (!selectedCollection) return;

    const queryParsed = safeParseJson<Record<string, unknown>>(queryText);
    if (!queryParsed.ok) {
      toast.error(`Ошибка в JSON запроса: ${queryParsed.error}`);
      return;
    }

    const sortParsed = safeParseJson<Record<string, 1 | -1>>(sortText);
    if (!sortParsed.ok) {
      toast.error(`Ошибка в JSON сортировки: ${sortParsed.error}`);
      return;
    }

    const projectionParsed = safeParseJson<Record<string, 0 | 1>>(projectionText);
    if (!projectionParsed.ok) {
      toast.error(`Ошибка в JSON проекции: ${projectionParsed.error}`);
      return;
    }

    const baseQuery = queryParsed.value || {};
    const trimmed = searchText.trim();
    const searchQuery = trimmed
      ? { $or: [
          { lastName: { $regex: trimmed, $options: 'i' } },
          { firstName: { $regex: trimmed, $options: 'i' } },
          { username: { $regex: trimmed, $options: 'i' } },
        ] }
      : null;

    const finalQuery = searchQuery
      ? (Object.keys(baseQuery).length ? { $and: [baseQuery, searchQuery] } : searchQuery)
      : baseQuery;

    const body = {
      query: finalQuery,
      options: {
        limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
        skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,
        sort: sortParsed.value || {},
        projection: projectionParsed.value || {},
      },
    };

    find(selectedCollection, body.query, body.options);
  }, [limit, projectionText, queryText, searchText, selectedCollection, skip, sortText]);

  const handleNextPage = useCallback(() => {
    setSkip((s) => s + Math.max(1, limit));
  }, [limit]);

  const handlePrevPage = useCallback(() => {
    setSkip((s) => Math.max(0, s - Math.max(1, limit)));
  }, [limit]);

  const prettyResults = useMemo(() => {
    if (!docs) return "";
    try {
      return JSON.stringify(docs, null, 2);
    } catch {
      return "";
    }
  }, [docs]);

  // formatting helpers moved to utils/format and used by CollectionStatsPanel

  const selectedInfo = useMemo(() => {
    return (collections ?? []).find((c) => c.name === selectedCollection) || null;
  }, [collections, selectedCollection]);

  const userCollectionName = useMemo(() => {
    const names = (collections ?? []).map((c) => c.name);
    if (names.includes('User')) return 'User';
    if (names.includes('Users')) return 'Users';
    return '';
  }, [collections]);

  const runQuickUserQuery = useCallback((query: Record<string, unknown>) => {
    const name = userCollectionName;
    if (!name) return;
    setSelectedCollection(name);
    setQueryText(JSON.stringify(query, null, 2));
    setSortText("{}");
    setProjectionText("{}");
    setSkip(0);
    setTimeout(() => {
      // используем текущие контролы поиска, чтобы не дублировать логику
      (async () => { await handleFind(); })();
    }, 0);
  }, [handleFind, userCollectionName]);

  const handleAskDelete = useCallback((id: string) => {
    setConfirmPayload({ mode: 'delete', id });
    setConfirmOpen(true);
  }, []);

  const handleAskPatch = useCallback((id: string) => {
    setConfirmPayload({ mode: 'patch', id, payload: '{}' });
    setConfirmOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!confirmPayload || !selectedCollection) return;
    if (confirmPayload.mode === 'delete') {
      await remove(selectedCollection, confirmPayload.id);
      setConfirmOpen(false);
      // refresh current page
      handleFind();
    } else if (confirmPayload.mode === 'patch') {
      const parsed = safeParseJson<Record<string, unknown>>(confirmPayload.payload || '{}');
      if (!parsed.ok) {
        toast.error(`Ошибка JSON: ${parsed.error}`);
        return;
      }
      await patch(selectedCollection, confirmPayload.id, parsed.value);
      setConfirmOpen(false);
      handleFind();
    }
  }, [confirmPayload, handleFind, patch, remove, selectedCollection]);

  return (
    <main style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Mongo</h1>
        {collectionsLoading && <Spinner size="sm" />}
        {collectionsError && <Chip color="danger" variant="flat">Ошибка загрузки коллекций</Chip>}
        {searching && <Chip color="primary" variant="flat">Выполняю запрос...</Chip>}
        {typeof durationMs === "number" && !searching && (
          <Chip variant="flat">{Math.round(durationMs)} ms</Chip>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button size="sm" onPress={refetch} isDisabled={collectionsLoading}>
            Обновить коллекции
          </Button>
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Коллекции (DB: {DB_NAME})</h3>
          <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 8, maxHeight: 360, overflow: "auto" }}>
            {collections?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {collections.map((c) => (
                  <Button
                    key={c.name}
                    variant={selectedCollection === c.name ? "solid" : "light"}
                    color={selectedCollection === c.name ? "primary" : "default"}
                    onPress={() => setSelectedCollection(c.name)}
                    size="sm"
                  >
                    <span>{c.name}{c.type && c.type !== 'collection' ? ` (${c.type})` : ''}</span>
                  </Button>
                ))}
              </div>
            ) : (
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                {collectionsLoading ? "Загрузка..." : "Нет данных"}
              </div>
            )}
          </div>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <Input
              label="Поиск (lastName, firstName, username)"
              value={searchText}
              onValueChange={setSearchText}
              placeholder="Введите строку для поиска"
              onKeyDown={(e) => { if ((e as any).key === 'Enter') { e.preventDefault(); handleFind(); } }}
            />
          </div>

          {userCollectionName && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Chip variant="flat">Быстрые запросы: {userCollectionName}</Chip>
              <Button size="sm" variant="flat" onPress={() => runQuickUserQuery({ selectedGraphId: { $oid: KGTU_GRAPH_ID } })}>Пользователи КГТУ</Button>
              <Button size="sm" variant="flat" onPress={() => runQuickUserQuery({ selectedGraphId: { $oid: KBK_GRAPH_ID } })}>Пользователи КБК</Button>
              <Button size="sm" variant="flat" onPress={() => runQuickUserQuery({ $or: [ { username: null }, { username: { $exists: false } } ] })}>username = null</Button>
              <Button size="sm" variant="flat" onPress={() => runQuickUserQuery({ $or: [ { firstName: { $regex: searchText.trim(), $options: 'i' } }, { lastName: { $regex: searchText.trim(), $options: 'i' } }, { username: { $regex: searchText.trim(), $options: 'i' } } ] })} isDisabled={!searchText.trim()}>Быстрый поиск</Button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Input
              type="number"
              label="Limit"
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v) || 0)}
              min={1}
            />
            <Input
              type="number"
              label="Skip"
              value={String(skip)}
              onValueChange={(v) => setSkip(Math.max(0, Number(v) || 0))}
              min={0}
            />

            <div style={{ display: "flex", gap: 8, alignItems: "end", justifyContent: "flex-end" }}>
              <Button color="default" variant="flat" onPress={() => { setQueryText("{}"); setSortText("{}"); setProjectionText("{}"); setLimit(20); setSkip(0); }}>
                Сбросить
              </Button>
              <Button color="primary" onPress={handleFind} isDisabled={!canSearch || searching}>
                Найти
              </Button>
            </div>
          </div>

          {selectedInfo && (
            <CollectionStatsPanel info={selectedInfo} />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Textarea
              label="Query JSON"
              minRows={6}
              value={queryText}
              onValueChange={setQueryText}
              placeholder='{"_id":"652f7f6a2c9f8d44f0c1a123"}'
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Textarea
                label="Sort JSON"
                minRows={6}
                value={sortText}
                onValueChange={setSortText}
                placeholder='{"createdAt": -1}'
              />
              <Textarea
                label="Projection JSON"
                minRows={6}
                value={projectionText}
                onValueChange={setProjectionText}
                placeholder='{"password": 0}'
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="flat" onPress={handlePrevPage} isDisabled={skip === 0 || searching}>Prev</Button>
            <Button variant="flat" onPress={handleNextPage} isDisabled={searching}>Next</Button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Chip variant="bordered">skip: {skip}</Chip>
            <Chip variant="bordered">limit: {limit}</Chip>
            {docs && <Chip color="success" variant="flat">docs: {docs.length}</Chip>}
            {resultsError && <Chip color="danger" variant="flat">{resultsError}</Chip>}
          </div>

          <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 12, minHeight: 160 }}>
            {searching ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Spinner size="sm" /> Загрузка...
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, maxHeight: 420, overflow: "auto" }}>
                {(docs ?? []).map((doc, i) => {
                  const id = extractId((doc as any)?._id) || String((doc as any)?._id || '');
                  return (
                    <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <strong style={{ flex: 1 }}>#{i + 1} {id && `— ${id}`}</strong>
                        {id && <Button size="sm" variant="flat" onPress={() => handleAskPatch(id)}>Изменить</Button>}
                        {id && <Button size="sm" color="danger" variant="flat" onPress={() => handleAskDelete(id)}>Удалить</Button>}
                      </div>
                      <JsonPretty value={doc} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <ConfirmDialog
            open={confirmOpen}
            title={confirmPayload?.mode === 'delete' ? 'Подтверждение удаления' : 'Подтверждение изменения'}
            description={confirmPayload?.mode === 'delete' ? 'Вы уверены, что хотите удалить документ? Это действие необратимо.' : 'Укажите JSON с полями для обновления. Можно использовать операторы $set, $unset и т.п.'}
            confirmText={confirmPayload?.mode === 'delete' ? 'Удалить' : 'Изменить'}
            danger={confirmPayload?.mode === 'delete'}
            loading={docMutating}
            onConfirm={handleConfirm}
            onClose={() => setConfirmOpen(false)}
          />
        </div>
      </section>
    </main>
  );
}

