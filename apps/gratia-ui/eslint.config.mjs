import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Barrel imports pull every component (and its CSS) into the importing
      // route's bundle. Always import from the component's own path.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@gratia/ui",
              message:
                "Import from '@gratia/ui/components/<Name>' or '@gratia/ui/icons/<Name>' instead of the package barrel.",
            },
            {
              name: "@gratia/ui/components",
              message:
                "Import from '@gratia/ui/components/<Name>' instead of the components barrel.",
            },
          ],
        },
      ],
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
