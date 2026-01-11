import { Category } from "../../db/schema/category.schema";

/**
 * Category tree node interface for hierarchical category display
 * Extends Category with children array for tree structure
 */
export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}
