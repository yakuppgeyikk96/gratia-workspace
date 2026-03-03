import { Storage } from "@google-cloud/storage";
import type { IStorageProvider, IUploadOptions, IUploadResult } from "./storage.types";

export class GCSStorageProvider implements IStorageProvider {
  private readonly storage: Storage;
  private readonly bucketName: string;
  private readonly emulatorHost: string | undefined;
  private readonly publicHost: string | undefined;
  private bucketReady: Promise<void>;

  constructor() {
    this.bucketName = process.env.GCS_BUCKET_NAME ?? "gratia-dev";
    this.emulatorHost = process.env.STORAGE_EMULATOR_HOST;
    this.publicHost = process.env.STORAGE_PUBLIC_HOST;

    // In production, Cloud Run service account auth is used automatically.
    // For fake-gcs-server (emulator), a dummy projectId is required.
    this.storage = new Storage({
      ...(this.emulatorHost ? { projectId: "local-dev" } : {}),
    });

    this.bucketReady = this.ensureBucket().catch((err: unknown) => {
      console.error("Failed to ensure GCS bucket exists:", err);
    });
  }

  async upload(path: string, data: Buffer, options: IUploadOptions): Promise<IUploadResult> {
    await this.bucketReady;
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
    if (this.publicHost || this.emulatorHost) {
      const host = this.publicHost ?? this.emulatorHost;
      const encodedPath = encodeURIComponent(path);
      return `${host}/storage/v1/b/${this.bucketName}/o/${encodedPath}?alt=media`;
    }

    return `https://storage.googleapis.com/${this.bucketName}/${path}`;
  }

  private async ensureBucket(): Promise<void> {
    const [exists] = await this.storage.bucket(this.bucketName).exists();
    if (!exists) {
      if (this.emulatorHost) {
        // fake-gcs-server requires direct HTTP call to create buckets
        await fetch(`${this.emulatorHost}/storage/v1/b?project=local-dev`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: this.bucketName }),
        });
      } else {
        await this.storage.createBucket(this.bucketName);
      }
      console.log(`Created GCS bucket: ${this.bucketName}`);
    }
  }
}
