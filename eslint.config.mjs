import { fixupConfigRules, fixupPluginRules } from "@eslint/eslintrc";
import react from "eslint-plugin-react";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {},
});

export default [
  {
    ignores: [
      "**/node_modules",
      "**/.next",
      "**/out",
      "**/build",
      "**/dist",
    ],
  },
  ...fixupConfigRules([
    ...compat.extends("next/core-web-vitals", "next/typescript"),
  ]),
];
