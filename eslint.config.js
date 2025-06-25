import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import {defineConfig} from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";


export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,vue,ts,tsx}"],

        plugins: {js},
        extends: ["js/recommended"],
        rules: {
            "vue/multi-word-component-names": "off"
        }
    },
    {
        files: ["**/*.{js,mjs,cjs,vue,ts,tsx}"],
        languageOptions: {globals: globals.browser},
        rules: {
            "vue/multi-word-component-names": "off"
        }
    },
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            "@typescript-eslint": typescriptEslint
        },
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                project: "./tsconfig.json",
                ecmaVersion: "latest",
                sourceType: "module"
            }
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": "off"
        }
    },
    pluginVue.configs["flat/essential"],
    {
        ignores: ["dist/**", "docs/**"], // Exclude dist and docs folders
    },
]);
