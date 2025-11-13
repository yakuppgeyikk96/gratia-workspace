export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  level: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryTreeNode {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  level: number;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
  children: CategoryTreeNode[];
}
