import type { IStorageProvider } from "./storage.types";

export type { IStorageProvider, IUploadOptions, IUploadResult } from "./storage.types";

export type StorageProviderType = "gcs";

function createStorageProvider(type: StorageProviderType = "gcs"): IStorageProvider {
  switch (type) {
    case "gcs": {
      const { GCSStorageProvider } = require("./gcs-storage.provider") as typeof import("./gcs-storage.provider");
      return new GCSStorageProvider();
    }
    default: {
      const _exhaustive: never = type;
      throw new Error(`Unknown storage provider: ${_exhaustive}`);
    }
  }
}

let instance: IStorageProvider | null = null;

export function getStorageProvider(): IStorageProvider {
  if (!instance) {
    const type = (process.env.STORAGE_PROVIDER as StorageProviderType | undefined) ?? "gcs";
    instance = createStorageProvider(type);
  }
  return instance;
}
