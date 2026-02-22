import { ISidebarItem } from "@/types";

export const SIDEBAR_ITEMS: ISidebarItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: "/",
    iconName: "LayoutDashboard",
  },
  {
    key: "products",
    label: "Products",
    href: "/products",
    iconName: "Package",
    children: [
      {
        key: "products-all",
        label: "All Products",
        href: "/products",
        iconName: "List",
      },
      {
        key: "products-create",
        label: "Create Product",
        href: "/products/create",
        iconName: "Plus",
      },
    ],
  },
];
