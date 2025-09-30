export type SortSpec = Record<string, 1 | -1>;
export type ProjectionSpec = Record<string, 0 | 1>;

export interface BuildExportParamsInput {
  query?: Record<string, unknown> | null;
  sort?: SortSpec | null;
  projection?: ProjectionSpec | null;
  limit?: number | null;
}

export function buildExportParams({ query, sort, projection, limit }: BuildExportParamsInput): URLSearchParams {
  const params = new URLSearchParams();
  // Keep current behavior: default format is json; caller may still specify output format separately
  params.set('format', 'json');

  if (query && Object.keys(query).length > 0) {
    params.set('query', JSON.stringify(query));
  }
  if (sort && Object.keys(sort).length > 0) {
    params.set('sort', JSON.stringify(sort));
  }
  if (projection && Object.keys(projection).length > 0) {
    params.set('projection', JSON.stringify(projection));
  }
  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    params.set('limit', String(limit));
  }

  return params;
}


