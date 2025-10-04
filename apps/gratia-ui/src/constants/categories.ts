export interface Category {
  value: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { value: "all", label: "All" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "home", label: "Home" },
];
