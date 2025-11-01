export interface NavigationLink {
  title: string;
  href: string;
}

export interface NavigationItem {
  type: "category" | "collection";
  name: string;
  slug: string;
}

export interface NavigationCategoryItem extends NavigationItem {
  type: "category";
}

export interface NavigationCollectionItem extends NavigationItem {
  type: "collection";
}

export interface NavigationResponse {
  collections: NavigationCollectionItem[];
  categories: NavigationCategoryItem[];
}

export interface BottomBarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  badge?: number;
}
