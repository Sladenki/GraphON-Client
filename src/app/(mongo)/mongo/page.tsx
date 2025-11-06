"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea, Spinner, Chip, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger } from "@heroui/react";
import { toast } from "sonner";
import { useMongoCollections } from "./hooks/useMongoCollections";
import { useMongoFind } from "./hooks/useMongoFind";
import { useMongoDocOps } from "./hooks/useMongoDocOps";
import ConfirmDialog from "./components/ConfirmDialog";
import { safeParseJson, extractId } from "./utils/json";
import JsonPretty from "./components/JsonPretty";
import EditDocDialog from "./components/EditDocDialog";
import { useMongoExport } from "./hooks/useMongoExport";
import { buildExportParams } from "./utils/export";
import CollectionsSidebar from "./components/CollectionsSidebar";
import { formatBytes, formatNumber } from "./utils/format";

const DB_NAME = process.env.NEXT_PUBLIC_MONGO_DB_NAME || "test";
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
  const [editOpen, setEditOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<Record<string, unknown> | null>(null);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [showEditors, setShowEditors] = useState<boolean>(false);

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

  

  const { exportCollection } = useMongoExport(DB_NAME);

  const handleExport = useCallback(async (fmt: 'json' | 'ndjson') => {
    if (!selectedCollection) { toast.error('Выберите коллекцию'); return; }

    const qp = safeParseJson<Record<string, unknown>>(queryText);
    if (!qp.ok) { toast.error(`Ошибка в JSON запроса: ${qp.error}`); return; }
    const sp = safeParseJson<Record<string, 1 | -1>>(sortText);
    if (!sp.ok) { toast.error(`Ошибка в JSON сортировки: ${sp.error}`); return; }
    const pp = safeParseJson<Record<string, 0 | 1>>(projectionText);
    if (!pp.ok) { toast.error(`Ошибка в JSON проекции: ${pp.error}`); return; }

    const baseQuery = qp.value || {};
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

    const params = buildExportParams({
      query: finalQuery,
      sort: sp.value || {},
      projection: pp.value || {},
      limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    });

    await exportCollection(selectedCollection, params, fmt);
  }, [exportCollection, selectedCollection, queryText, sortText, projectionText, searchText, limit]);

  const handleAskDelete = useCallback((id: string) => {
    setConfirmPayload({ mode: 'delete', id });
    setConfirmOpen(true);
  }, []);

  const handleAskPatch = useCallback((id: string) => {
    const doc = (docs ?? []).find((d) => extractId((d as any)?._id) === id || String((d as any)?._id || '') === id) as Record<string, unknown> | undefined;
    setEditDoc(doc || null);
    setEditDocId(id);
    setEditOpen(true);
  }, [docs]);

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
        {selectedInfo && (
          <>
            {typeof selectedInfo.count === 'number' && <Chip variant="bordered">docs: {formatNumber(selectedInfo.count)}</Chip>}
            {typeof selectedInfo.sizeBytes === 'number' && <Chip variant="bordered">data: {formatBytes(selectedInfo.sizeBytes)}</Chip>}
            {typeof selectedInfo.storageBytes === 'number' && <Chip variant="bordered">storage: {formatBytes(selectedInfo.storageBytes)}</Chip>}
            {typeof selectedInfo.totalIndexBytes === 'number' && <Chip variant="bordered">indexes: {formatBytes(selectedInfo.totalIndexBytes)}</Chip>}
          </>
        )}
        {docs && <Chip color="success" variant="flat">результаты: {docs.length}</Chip>}
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
        <CollectionsSidebar
          dbName={DB_NAME}
          collections={collections}
          loading={collectionsLoading}
          selectedCollection={selectedCollection}
          onSelect={setSelectedCollection}
          onExportJson={() => handleExport('json')}
          onExportNdjson={() => handleExport('ndjson')}
          canExport={canSearch}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "end" }}>
            <div style={{ flex: 1 }}>
              <Input
                label="Поиск (lastName, firstName, username)"
                value={searchText}
                onValueChange={setSearchText}
                placeholder="Введите строку для поиска"
                onKeyDown={(e) => { if ((e as any).key === 'Enter') { e.preventDefault(); handleFind(); } }}
              />
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="flat">Быстрые запросы</Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Быстрые запросы">
                <DropdownItem key="byUsername" onPress={() => runQuickUserQuery({ username: { $regex: searchText.trim(), $options: 'i' } })}>Пользователь: username ~</DropdownItem>
                <DropdownItem key="byFio" onPress={() => runQuickUserQuery({ $or: [ { lastName: { $regex: searchText.trim(), $options: 'i' } }, { firstName: { $regex: searchText.trim(), $options: 'i' } } ] })}>Пользователь: ФИО ~</DropdownItem>
                <DropdownItem key="byGraphKGTU" onPress={() => runQuickUserQuery({ graphSubs: { $elemMatch: { graphId: KGTU_GRAPH_ID } } })}>Подписчики КГТУ</DropdownItem>
                <DropdownItem key="byGraphKBK" onPress={() => runQuickUserQuery({ graphSubs: { $elemMatch: { graphId: KBK_GRAPH_ID } } })}>Подписчики КБК</DropdownItem>
                <DropdownItem key="recent" onPress={() => runQuickUserQuery({})}>Все пользователи</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "auto auto 1fr", gap: 12, alignItems: "end" }}>
            <Input
              type="number"
              label="Limit"
              value={String(limit)}
              onValueChange={(v) => setLimit(Number(v) || 0)}
              min={1}
              style={{ width: "120px" }}
            />
            <Input
              type="number"
              label="Skip"
              value={String(skip)}
              onValueChange={(v) => setSkip(Math.max(0, Number(v) || 0))}
              min={0}
              style={{ width: "120px" }}
            />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Button color="default" variant="flat" onPress={() => { setQueryText("{}"); setSortText("{}"); setProjectionText("{}"); setLimit(20); setSkip(0); setSearchText(""); }}>
                Сбросить
              </Button>
              <Button color="primary" onPress={handleFind} isDisabled={!canSearch || searching}>
                Найти
              </Button>
              <Button variant="flat" onPress={() => setShowEditors((v) => !v)}>
                {showEditors ? 'Скрыть JSON' : 'Показать JSON'}
              </Button>
            </div>
          </div>

          {showEditors && (
            <div>
              <Textarea
                label="Query JSON"
                minRows={6}
                value={queryText}
                onValueChange={setQueryText}
                placeholder='{"_id":"652f7f6a2c9f8d44f0c1a123"}'
              />
            </div>
          )}

          <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 12, minHeight: 160 }}>
            {searching ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Spinner size="sm" /> Загрузка...
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, maxHeight: '70vh', overflow: "auto" }}>
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
          <EditDocDialog
            open={editOpen}
            doc={editDoc}
            loading={docMutating}
            onClose={() => setEditOpen(false)}
            onSave={async (payload) => {
              if (!selectedCollection || !editDocId) return;
              await patch(selectedCollection, editDocId, payload);
              setEditOpen(false);
              handleFind();
            }}
          />
        </div>
      </section>
    </main>
  );
}

