export type MongoDocument = Record<string, unknown>;

export type FetchState<T> = {
  loading: boolean;
  error: string | null;
  data: T | null;
};

export type MongoFindOptions = {
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
  projection?: Record<string, 0 | 1>;
};


