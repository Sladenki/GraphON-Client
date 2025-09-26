"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea, Select, SelectItem, Spinner, Chip } from "@heroui/react";
import { toast } from "sonner";

type MongoDocument = Record<string, unknown>;

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api').replace(/\/+$/, '');
const DB_NAME = "test"; // всегда используем test по требованию

type FetchState<T> = {
  loading: boolean;
  error: string | null;
  data: T | null;
};

function safeParseJson<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  if (text.trim() === "") return { ok: true, value: {} as unknown as T };
  try {
    const value = JSON.parse(text);
    return { ok: true, value };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export default function MongoPage() {
  const [collectionsState, setCollectionsState] = useState<FetchState<string[]>>({ loading: false, error: null, data: null });
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  const [queryText, setQueryText] = useState<string>("{}");
  const [sortText, setSortText] = useState<string>("{}");
  const [projectionText, setProjectionText] = useState<string>("{}");
  const [limit, setLimit] = useState<number>(20);
  const [skip, setSkip] = useState<number>(0);

  const [searching, setSearching] = useState<boolean>(false);
  const [searchDurationMs, setSearchDurationMs] = useState<number | null>(null);
  const [resultsState, setResultsState] = useState<FetchState<MongoDocument[]>>({ loading: false, error: null, data: null });

  const canSearch = useMemo(() => Boolean(selectedCollection), [selectedCollection]);

  const fetchCollections = useCallback(async () => {
    setCollectionsState({ loading: true, error: null, data: collectionsState.data });
    try {
      const res = await fetch(`${API_BASE}/mongo/collections/${DB_NAME}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json: unknown = await res.json();
      const names: string[] = Array.isArray(json)
        ? json
            .map((item) => {
              if (typeof item === "string") return item;
              if (item && typeof item === "object" && "name" in item) return String((item as any).name);
              return null;
            })
            .filter((x): x is string => Boolean(x))
        : [];
      setCollectionsState({ loading: false, error: null, data: names });
      if (names && names.length && !selectedCollection) {
        setSelectedCollection(names[0]);
      }
    } catch (e) {
      const msg = (e as Error).message;
      setCollectionsState({ loading: false, error: msg, data: null });
      toast.error(`Не удалось получить коллекции: ${msg}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

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

    const body = {
      query: queryParsed.value || {},
      options: {
        limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
        skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,
        sort: sortParsed.value || {},
        projection: projectionParsed.value || {},
      },
    };

    setSearching(true);
    setResultsState({ loading: true, error: null, data: null });
    const started = performance.now();
    try {
      const res = await fetch(`${API_BASE}/mongo/find/${DB_NAME}/${encodeURIComponent(selectedCollection)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const finished = performance.now();
      setSearchDurationMs(finished - started);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
      }
      const docs: MongoDocument[] = await res.json();
      setResultsState({ loading: false, error: null, data: docs });
    } catch (e) {
      const msg = (e as Error).message;
      setResultsState({ loading: false, error: msg, data: null });
      toast.error(`Ошибка запроса: ${msg}`);
    } finally {
      setSearching(false);
    }
  }, [limit, projectionText, queryText, selectedCollection, skip, sortText]);

  const handleNextPage = useCallback(() => {
    setSkip((s) => s + Math.max(1, limit));
  }, [limit]);

  const handlePrevPage = useCallback(() => {
    setSkip((s) => Math.max(0, s - Math.max(1, limit)));
  }, [limit]);

  const prettyResults = useMemo(() => {
    if (!resultsState.data) return "";
    try {
      return JSON.stringify(resultsState.data, null, 2);
    } catch {
      return "";
    }
  }, [resultsState.data]);

  return (
    <main style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Mongo</h1>
        {collectionsState.loading && <Spinner size="sm" />}
        {collectionsState.error && <Chip color="danger" variant="flat">Ошибка загрузки коллекций</Chip>}
        {searching && <Chip color="primary" variant="flat">Выполняю запрос...</Chip>}
        {typeof searchDurationMs === "number" && !searching && (
          <Chip variant="flat">{Math.round(searchDurationMs)} ms</Chip>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Button size="sm" onPress={fetchCollections} isDisabled={collectionsState.loading}>
            Обновить коллекции
          </Button>
        </div>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Коллекции (DB: {DB_NAME})</h3>
          <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 8, maxHeight: 360, overflow: "auto" }}>
            {collectionsState.data?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {collectionsState.data.map((name) => (
                  <Button
                    key={name}
                    variant={selectedCollection === name ? "solid" : "light"}
                    color={selectedCollection === name ? "primary" : "default"}
                    onPress={() => setSelectedCollection(name)}
                    size="sm"
                  >
                    {name}
                  </Button>
                ))}
              </div>
            ) : (
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                {collectionsState.loading ? "Загрузка..." : "Нет данных"}
              </div>
            )}
          </div>
        </aside>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Select
              label="Коллекция"
              selectedKeys={selectedCollection ? [selectedCollection] : []}
              onSelectionChange={(keys) => {
                const val = Array.from(keys)[0] as string | undefined;
                setSelectedCollection(val ?? "");
              }}
              placeholder="Выберите коллекцию"
            >
              {(collectionsState.data ?? []).map((c) => (
                <SelectItem key={c}>
                  {c}
                </SelectItem>
              ))}
            </Select>

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
            {resultsState.data && <Chip color="success" variant="flat">docs: {resultsState.data.length}</Chip>}
            {resultsState.error && <Chip color="danger" variant="flat">{resultsState.error}</Chip>}
          </div>

          <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 12, minHeight: 160 }}>
            {resultsState.loading ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Spinner size="sm" /> Загрузка...
              </div>
            ) : (
              <pre style={{ margin: 0, maxHeight: 420, overflow: "auto" }}>
                <code>{prettyResults}</code>
              </pre>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

