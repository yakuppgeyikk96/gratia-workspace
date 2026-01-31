/**
 * Global common attributes that should be shown in filters for all categories.
 *
 * These attributes are typically used for variant selection (color, size)
 * and are common across most product types.
 */

export interface CommonAttributeDefinition {
  key: string;
  label: string;
  type: "enum" | "string" | "number" | "boolean";
  isGlobal: boolean;
  sortOrder: number;
}

/**
 * Common attributes shown in all category filters
 */
export const COMMON_ATTRIBUTES: Record<string, CommonAttributeDefinition> = {
  color: {
    key: "color",
    label: "Color",
    type: "enum",
    isGlobal: true,
    sortOrder: 1,
  },
  size: {
    key: "size",
    label: "Beden",
    type: "enum",
    isGlobal: true,
    sortOrder: 2,
  },
  material: {
    key: "material",
    label: "Materyal",
    type: "enum",
    isGlobal: true,
    sortOrder: 3,
  },
};

/**
 * Get the list of common attribute keys
 */
export const getCommonAttributeKeys = (): string[] => {
  return Object.keys(COMMON_ATTRIBUTES);
};

/**
 * Check if an attribute key is a common attribute
 */
export const isCommonAttribute = (key: string): boolean => {
  return key in COMMON_ATTRIBUTES;
};

/**
 * Get sort order for an attribute (common attributes first)
 */
export const getAttributeSortOrder = (key: string): number => {
  if (key in COMMON_ATTRIBUTES) {
    return COMMON_ATTRIBUTES[key]?.sortOrder ?? 0;
  }
  // Non-common attributes get a high sort order (shown after common)
  return 1000;
};

/**
 * Get label for an attribute (uses common attribute label if available)
 */
export const getAttributeLabel = (key: string): string => {
  if (key in COMMON_ATTRIBUTES) {
    return COMMON_ATTRIBUTES[key]?.label ?? "";
  }
  // Format key as label for non-common attributes
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
};
