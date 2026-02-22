export interface IProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  categoryId: number;
  brandId: number | null;
  vendorId: number | null;
  price: string;
  discountedPrice: string | null;
  stock: number;
  attributes: Record<string, unknown>;
  images: string[];
  productGroupId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateProductRequest {
  name: string;
  slug: string;
  description?: string;
  sku: string;
  categoryId: number;
  brandId?: number;
  price: string;
  discountedPrice?: string;
  stock: number;
  attributes: Record<string, unknown>;
  productGroupId?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
}

export interface ICategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  level: number;
  isActive: boolean;
}

export interface IBrand {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  isActive: boolean;
}

export interface IAttributeDefinition {
  key: string;
  type: "string" | "number" | "boolean" | "enum";
  label: string;
  required: boolean;
  enumValues?: string[];
  unit?: string;
  min?: number;
  max?: number;
  defaultValue?: string | number | boolean;
  sortOrder: number;
}

export interface ICategoryAttributeTemplate {
  id: number;
  categoryId: number;
  attributeDefinitions: IAttributeDefinition[];
  createdAt: string;
  updatedAt: string;
}

