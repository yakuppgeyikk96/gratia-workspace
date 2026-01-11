import { AppError, ErrorCode } from "../../shared/errors/base.errors";
import { Collection } from "../../db/schema/collection.schema";
import { COLLECTION_MESSAGES } from "./collection.constants";
import {
  createCollection,
  findActiveCollections,
  findAllCollections,
  findCollectionById,
  findCollectionBySlug,
  findCollectionsByType,
} from "./collection.repository";
import type { CreateCollectionDto } from "./collection.validations";

export const createCollectionService = async (
  data: CreateCollectionDto
): Promise<Collection> => {
  const existingCollection = await findCollectionBySlug(data.slug);

  if (existingCollection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_SLUG_ALREADY_EXISTS,
      ErrorCode.DUPLICATE_ENTRY
    );
  }

  const collection = await createCollection({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    collectionType: data.collectionType,
    isActive: data.isActive ?? true,
    sortOrder: data.sortOrder ?? 0,
    imageUrl: data.imageUrl || null,
  });

  if (!collection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_CREATION_FAILED,
      ErrorCode.INTERNAL_SERVER_ERROR
    );
  }

  return collection;
};

export const getAllCollectionsService = async (): Promise<Collection[]> => {
  return await findAllCollections();
};

export const getActiveCollectionsService = async (): Promise<Collection[]> => {
  return await findActiveCollections();
};

export const getCollectionByIdService = async (
  id: number
): Promise<Collection> => {
  const collection = await findCollectionById(id);

  if (!collection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return collection;
};

export const getCollectionBySlugService = async (
  slug: string
): Promise<Collection> => {
  const collection = await findCollectionBySlug(slug);

  if (!collection) {
    throw new AppError(
      COLLECTION_MESSAGES.COLLECTION_NOT_FOUND,
      ErrorCode.NOT_FOUND
    );
  }

  return collection;
};

export const getCollectionsByTypeService = async (
  type: "new" | "trending" | "sale" | "featured"
): Promise<Collection[]> => {
  return await findCollectionsByType(type);
};
