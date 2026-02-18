---
name: create-component
description: Create a new React component in the Gratia UI app following project patterns with SCSS Modules, TypeScript, and optional tests.
disable-model-invocation: true
argument-hint: <domain/ComponentName>
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Create Component

Create a new React component. The argument should be a path like `features/product/ProductBadge` or `common/Tooltip`.

## Steps

1. Parse `$ARGUMENTS` to determine:
   - Component path: `apps/gratia-ui/src/components/$ARGUMENTS/`
   - Component name: last segment (PascalCase)

2. Read an existing component for reference. Good examples:
   - `apps/gratia-ui/src/components/features/product/ProductCard/`
   - `apps/gratia-ui/src/components/common/`

3. Create the component files:

### `index.tsx` — Client Component (needs hooks/events)

```tsx
"use client";

import styles from "./<ComponentName>.module.scss";

interface <ComponentName>Props {
  // props
}

export default function <ComponentName>({}: <ComponentName>Props) {
  return (
    <div className={styles.container}>
      {/* content */}
    </div>
  );
}
```

### `index.tsx` — Server Component (data display only)

```tsx
import styles from "./<ComponentName>.module.scss";

interface <ComponentName>Props {
  // props
}

export default function <ComponentName>({}: <ComponentName>Props) {
  return (
    <div className={styles.container}>
      {/* content */}
    </div>
  );
}
```

### `<ComponentName>.module.scss`

```scss
.container {
  // styles
}
```

### `<ComponentName>.test.tsx` (create if asked)

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import <ComponentName> from "./index";

describe("<ComponentName>", () => {
  it("should render correctly", () => {
    render(<<ComponentName> />);
    // expect(screen.getByText("text")).toBeInTheDocument();
  });
});
```

## Conventions

- **Default export** for all components
- **SCSS Modules only** — never inline styles or Tailwind
- Import shared components from `@gratia/ui/components/<Name>`
- Use `classnames` for conditional classes: `import cx from "classnames";`
- Add `"use client"` only if the component uses hooks, event handlers, or browser APIs
- Props interface in the same file unless shared across components
- Prefer semantic HTML elements (`<section>`, `<article>`, `<nav>`, `<button>`)
