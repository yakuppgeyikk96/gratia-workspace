import { Storage } from "@google-cloud/storage";
import type { IStorageProvider, IUploadOptions, IUploadResult } from "./storage.types";

export class GCSStorageProvider implements IStorageProvider {
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly emulatorHost: string | undefined;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME ?? "gratia-dev";
    this.emulatorHost = process.env.STORAGE_EMULATOR_HOST;

    // SDK auto-detects STORAGE_EMULATOR_HOST for fake-gcs-server
    // In production, Cloud Run service account auth is used automatically
    this.storage = new Storage();

    this.ensureBucket().catch((err: unknown) => {
      console.error("Failed to ensure GCS bucket exists:", err);
    });
  }

  async upload(path: string, data: Buffer, options: IUploadOptions): Promise<IUploadResult> {
    const file = this.storage.bucket(this.bucketName).file(path);

    await file.save(data, {
      contentType: options.contentType,
      ...(options.metadata !== undefined && { metadata: options.metadata }),
      resumable: false,
    });

    return {
      path,
      publicUrl: this.getPublicUrl(path),
    };
  }

  async delete(path: string): Promise<void> {
    await this.storage
      .bucket(this.bucketName)
      .file(path)
      .delete({ ignoreNotFound: true });
  }

  async exists(path: string): Promise<boolean> {
    const [exists] = await this.storage.bucket(this.bucketName).file(path).exists();
    return exists;
  }

  getPublicUrl(path: string): string {
    if (this.emulatorHost) {
      const encodedPath = encodeURIComponent(path);
      return `${this.emulatorHost}/storage/v1/b/${this.bucketName}/o/${encodedPath}?alt=media`;
    }

    return `https://storage.googleapis.com/${this.bucketName}/${path}`;
  }

  private async ensureBucket(): Promise<void> {
    const [exists] = await this.storage.bucket(this.bucketName).exists();
    if (!exists) {
      await this.storage.createBucket(this.bucketName);
      console.log(`Created GCS bucket: ${this.bucketName}`);
    }
  }
}
