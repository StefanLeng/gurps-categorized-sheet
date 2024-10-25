import typescriptEslint from "@typescript-eslint/eslint-plugin";
import jest from "eslint-plugin-jest";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["**/dist", "**/types"],
}, ...compat.extends(
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
    "plugin:prettier/recommended",
).map(config => ({
    ...config,
    files: ["**/*.ts", "**/*.tsx, **/*.js, **/*.cjs, **/*.mjs"],
})), {
    files: ["**/*.ts", "**/*.tsx, **/*.js, **/*.cjs, **/*.mjs"],

    plugins: {
        "@typescript-eslint": typescriptEslint,
        jest,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: 2020,
        sourceType: "module",

        parserOptions: {
            extraFileExtensions: [".cjs", ".mjs"],
            project: "./tsconfig.eslint.json",
        },
    },

    rules: {
        'prettier/prettier': [
            'error',
            {
              endOfLine: 'auto',
              tabWidth: 4,
            },
          ],
          "@typescript-eslint/no-var-requires": "off",
          "@typescript-eslint/no-explicit-any": "off",
          "@typescript-eslint/no-unused-vars": "off",
          "@typescript-eslint/no-unsafe-declaration-merging": "off",
    },
}, {
    files: ["./*.cjs"],

    rules: {
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/no-explizite-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
    },
}];