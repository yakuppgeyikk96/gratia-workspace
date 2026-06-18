export type CollectionType = "new" | "trending" | "sale" | "featured";

export interface Collection {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  collectionType: CollectionType;
  isActive: boolean;
  sortOrder: number;
  imageUrl: string | null;
}
