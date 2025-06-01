import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import {defineConfig} from "eslint/config";


export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs,vue}"],

        plugins: {js},
        extends: ["js/recommended"],
        rules: {
            "vue/multi-word-component-names": "off"
        }
    },
    {
        files: ["**/*.{js,mjs,cjs,vue}"],
        languageOptions: {globals: globals.browser},
        rules: {
            "vue/multi-word-component-names": "off"
        }
    },
    pluginVue.configs["flat/essential"],
    {
        ignores: ["dist/**", "docs/**"], // Exclude dist and docs folders
    },
]);
