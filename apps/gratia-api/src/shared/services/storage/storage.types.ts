export interface IUploadOptions {
  contentType: string;
  metadata?: Record<string, string>;
}

export interface IUploadResult {
  path: string;
  publicUrl: string;
}

export interface IStorageProvider {
  upload(path: string, data: Buffer, options: IUploadOptions): Promise<IUploadResult>;
  delete(path: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  getPublicUrl(path: string): string;
}
