"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Input, Textarea, Select, SelectItem, Spinner, Chip } from "@heroui/react";
import { toast } from "sonner";
import { useMongoCollections } from "./useMongoCollections";
import { useMongoFind } from "./useMongoFind";
import { safeParseJson } from "./json";
import type { MongoDocument } from "./types";

const DB_NAME = "test"; // всегда используем test по требованию

export default function MongoPage() {
  const { data: collections, loading: collectionsLoading, error: collectionsError, refetch } = useMongoCollections(DB_NAME);
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  const [queryText, setQueryText] = useState<string>("{}");
  const [sortText, setSortText] = useState<string>("{}");
  const [projectionText, setProjectionText] = useState<string>("{}");
  const [limit, setLimit] = useState<number>(20);
  const [skip, setSkip] = useState<number>(0);

  const { data: docs, loading: searching, error: resultsError, durationMs, find } = useMongoFind(DB_NAME);

  const canSearch = useMemo(() => Boolean(selectedCollection), [selectedCollection]);

  useEffect(() => {
    if (!selectedCollection && collections && collections.length) {
      setSelectedCollection(collections[0]);
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

    const body = {
      query: queryParsed.value || {},
      options: {
        limit: Number.isFinite(limit) && limit > 0 ? limit : 20,
        skip: Number.isFinite(skip) && skip >= 0 ? skip : 0,
        sort: sortParsed.value || {},
        projection: projectionParsed.value || {},
      },
    };

    find(selectedCollection, body.query, body.options);
  }, [limit, projectionText, queryText, selectedCollection, skip, sortText]);

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
                {collections.map((name) => (
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
                {collectionsLoading ? "Загрузка..." : "Нет данных"}
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
              {(collections ?? []).map((c) => (
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
            {docs && <Chip color="success" variant="flat">docs: {docs.length}</Chip>}
            {resultsError && <Chip color="danger" variant="flat">{resultsError}</Chip>}
          </div>

          <div style={{ border: "1px solid var(--border-color, #e5e7eb)", borderRadius: 8, padding: 12, minHeight: 160 }}>
            {searching ? (
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

