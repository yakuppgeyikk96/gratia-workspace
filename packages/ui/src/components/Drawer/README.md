# Drawer Component

A mobile-friendly drawer component with nested navigation support, animations, and keyboard accessibility.

## Features

- ✅ **Left/Right positioning** - Open from either side
- ✅ **Nested navigation** - Unlimited depth with tree structure
- ✅ **Smooth animations** - Slide in/out with overlay fade
- ✅ **Keyboard support** - ESC to close or go back
- ✅ **Mobile optimized** - Touch-friendly with proper sizing
- ✅ **Flexible content** - Icons, badges, custom click handlers
- ✅ **Auto-close** - Closes when item without children is clicked

## Usage

### Basic Example

```tsx
import { Drawer, DrawerItem } from "@gratia/ui/components";
import { Button } from "@gratia/ui/components";

const menuItems: DrawerItem[] = [
  {
    id: "home",
    label: "Home",
    icon: <IconHome />,
    href: "/",
  },
  {
    id: "profile",
    label: "Profile",
    icon: <IconPerson />,
    href: "/profile",
  },
];

function App() {
  return (
    <Drawer
      trigger={<Button>Open Menu</Button>}
      items={menuItems}
      title="Main Menu"
      position="left"
    />
  );
}
```

### With Nested Items

```tsx
const nestedItems: DrawerItem[] = [
  {
    id: "products",
    label: "Products",
    icon: <IconShoppingBag />,
    children: [
      {
        id: "new",
        label: "New Arrivals",
        href: "/products/new",
      },
      {
        id: "categories",
        label: "Categories",
        children: [
          {
            id: "men",
            label: "Men",
            href: "/categories/men",
          },
          {
            id: "women",
            label: "Women",
            href: "/categories/women",
          },
        ],
      },
    ],
  },
];
```

### With Custom Click Handlers

```tsx
const settingsItems: DrawerItem[] = [
  {
    id: "language",
    label: "Language",
    icon: "🌍",
    onClick: () => {
      // Custom logic
      console.log("Language settings");
    },
  },
  {
    id: "theme",
    label: "Theme",
    icon: "🎨",
    onClick: () => {
      // Toggle theme
      toggleTheme();
    },
  },
];
```

### With Badges

```tsx
const itemsWithBadges: DrawerItem[] = [
  {
    id: "cart",
    label: "Shopping Cart",
    icon: <IconCart />,
    badge: 5, // Shows badge with count
    href: "/cart",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <IconBell />,
    badge: 12,
    href: "/notifications",
  },
];
```

### Bottom Bar Integration Example

```tsx
import { Drawer, DrawerItem } from "@gratia/ui/components";
import { IconPerson } from "@gratia/ui/icons";

const profileItems: DrawerItem[] = [
  {
    id: "preferences",
    label: "Preferences",
    children: [
      {
        id: "language",
        label: "Language",
        icon: "🌍",
        onClick: () => openLanguageModal(),
      },
      {
        id: "currency",
        label: "Currency",
        icon: "💰",
        onClick: () => openCurrencyModal(),
      },
    ],
  },
  {
    id: "orders",
    label: "My Orders",
    icon: "📦",
    href: "/profile/orders",
  },
  {
    id: "logout",
    label: "Logout",
    icon: "🚪",
    onClick: () => handleLogout(),
  },
];

function BottomBar() {
  return (
    <nav>
      {/* Other nav items */}
      <Drawer
        trigger={<IconPerson />}
        items={profileItems}
        title="Profile"
        position="right"
      />
    </nav>
  );
}
```

## Props

### DrawerProps

| Prop       | Type                | Default  | Description                   |
| ---------- | ------------------- | -------- | ----------------------------- |
| `trigger`  | `ReactNode`         | required | Element that opens the drawer |
| `items`    | `DrawerItem[]`      | required | Array of menu items           |
| `title`    | `string`            | "Menu"   | Drawer header title           |
| `position` | `"left" \| "right"` | "left"   | Side from which drawer opens  |
| `onClose`  | `() => void`        | -        | Callback when drawer closes   |

### DrawerItem

| Prop       | Type           | Description                                |
| ---------- | -------------- | ------------------------------------------ |
| `id`       | `string`       | Unique identifier (required)               |
| `label`    | `string`       | Display text (required)                    |
| `icon`     | `ReactNode`    | Icon or emoji                              |
| `onClick`  | `() => void`   | Custom click handler (only if no children) |
| `children` | `DrawerItem[]` | Nested items (creates sub-menu)            |
| `badge`    | `number`       | Badge count                                |
| `disabled` | `boolean`      | Disables the item                          |

## Behavior Rules

1. **With children**: Item opens sub-menu, custom `onClick` is ignored
2. **Without children**: Item executes `onClick` and closes drawer
3. **Back navigation**: ESC key goes back one level, or closes if at root
4. **Overlay click**: Closes the drawer completely
5. **Body scroll**: Disabled when drawer is open

## Keyboard Shortcuts

- `ESC` - Go back one level (or close if at root)
- Click outside - Close drawer

## Styling

The component uses SCSS modules and respects your theme variables:

- `$bg-color` - Drawer background
- `$text-primary-color` - Text color
- `$border-light` - Divider color
- `$bg-secondary-color` - Hover state

## Accessibility

- ✅ Keyboard navigation
- ✅ ARIA labels on buttons
- ✅ Focus management
- ✅ Screen reader friendly

## Mobile Optimization

- Width: `320px` (max `85vw`)
- Touch-friendly target sizes
- Smooth slide animations
- Prevents body scroll when open
