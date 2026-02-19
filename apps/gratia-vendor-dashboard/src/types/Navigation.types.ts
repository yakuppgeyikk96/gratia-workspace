export interface ISidebarItem {
  key: string;
  label: string;
  href: string;
  iconName: string;
  children?: ISidebarItem[];
}
