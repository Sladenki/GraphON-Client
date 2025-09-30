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


export type MongoCollectionInfo = {
  name: string;
  type: string; // 'collection' | 'view' | etc
  count?: number;
  sizeBytes?: number;
  storageBytes?: number;
  totalIndexBytes?: number;
};


