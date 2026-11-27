// File Location: shivanyams/eslint.config.mjs
// Reference Repositories: shivanya-sdk v1.0.0 (Master; shared UI lint conventions reference only); shivanya-auth (private, version not verified)
// Cleanup Status: Clean
// Cleanup Info: Audited Next.js Core Web Vitals and TypeScript flat-config composition; preserved generated/build output ignores and project CI exclusions.

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".ci/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
