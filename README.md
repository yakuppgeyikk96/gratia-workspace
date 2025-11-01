# Gratia E-Commerce Platform

A modern e-commerce application built with Next.js 14, featuring a monorepo architecture powered by Turborepo.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📦 Project Structure

This is a monorepo containing:

```
gratia-workspace/
├── apps/
│   └── gratia-ui/          # Main Next.js application
├── packages/
│   ├── ui/                 # Shared UI component library
│   ├── eslint-config/      # Shared ESLint configurations
│   └── typescript-config/  # Shared TypeScript configurations
```

## ✨ Features

### Currently Implemented

- ✅ **Authentication System**
  - User registration
  - Email verification
  - Login/Logout functionality
  - Protected routes

- ✅ **Product Catalog**
  - Browse products by category
  - Browse products by collection
  - Product listing with cards
  - Responsive product grid

- ✅ **Navigation & Layout**
  - Multi-tier header (Top, Main, Bottom)
  - Responsive category navigation
  - Dynamic overflow menu for categories
  - Search functionality

- ✅ **UI Component Library**
  - Button, Badge, Dropdown components
  - Form components (Input, Checkbox, FormField)
  - Toast notifications
  - Icon system

### 🚧 In Progress

- ⚠️ **Mobile Responsive Design**
  - Bottom navigation bar implemented
  - Header responsive behavior in development
  - Full mobile optimization in progress

- 🔜 **Upcoming Features**
  - Product detail pages
  - Shopping cart
  - Checkout flow
  - User profile management
  - Order history
  - Wishlist functionality

## 🛠️ Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** SCSS Modules
- **UI Components:** Custom component library + Radix UI
- **Build Tool:** Turborepo
- **Package Manager:** pnpm

## 📱 Responsive Breakpoints

```scss
$breakpoint-xs: 480px;
$breakpoint-sm: 640px; // Mobile
$breakpoint-md: 768px; // Tablet
$breakpoint-lg: 1024px; // Desktop
$breakpoint-xl: 1280px; // Large Desktop
$breakpoint-2xl: 1536px; // Extra Large
```

## 🧪 Development

### Run specific package

```bash
# Run only the main UI app
pnpm dev --filter=gratia-ui

# Build the UI component library
pnpm build --filter=@gratia/ui
```

### Project Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev:ui           # Start only the main UI app

# Build
pnpm build            # Build all packages and apps
pnpm build:ui         # Build only the main UI app

# Linting
pnpm lint             # Run ESLint on all packages
```

## 🎨 UI Component Library

The project includes a custom UI component library (`@gratia/ui`) with:

- **Layout:** Container, Flex, Divider
- **Forms:** Input, Checkbox, FormField, OneTimePassword
- **Actions:** Button, IconButton, Dropdown
- **Feedback:** Badge, Toast, LoadingSpinner
- **Icons:** Custom SVG icon system

## 📝 Environment Variables

Create a `.env.local` file in `apps/gratia-ui/`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=your_api_url

# Add other environment variables as needed
```

## 🤝 Contributing

This is an active development project. Features and implementations are subject to change.

## 📄 License

[Add your license here]

## 🔗 Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Turborepo Documentation](https://turborepo.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
