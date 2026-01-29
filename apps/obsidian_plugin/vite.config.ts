/*
import { defineConfig } from "vite";
import builtins from "builtin-modules";
import path from "path";

export default defineConfig({
  plugins: [],
  cssCodeSplit: false,
  lib: {
    entry: path.resolve(__dirname, "index.tsx"),
    name: "main",
    fileName: () => "main.js",
    formats: ["cjs"], // CommonJS format for Obsidian
  },
  build: {
    minify: false,
    outDir: "./apps/obsidian_plugin/dist",
    rollupOptions: {
      external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins,
      ],
      input: {
        main: "./apps/obsidian_plugin/index.tsx",
      },
      output: {
        entryFileNames: "main.js",
      },
    },
  },
});
*/

import { UserConfig, defineConfig } from "vite";
import path from "path";
import builtins from "builtin-modules";

export default defineConfig(async ({ mode }) => {
  const { resolve } = path;
  const prod = mode === "production";

  return {
    plugins: [],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    root: resolve(__dirname, "../.."),
    build: {
      lib: {
        //entry: resolve(__dirname, "index.tsx"),
        entry: resolve(__dirname, "index.tsx"),
        name: "main",
        fileName: () => "main.js",
        formats: ["cjs"],
      },
      minify: false,
      sourcemap: prod ? false : "inline",
      cssCodeSplit: false,
      emptyOutDir: false,
      outDir: "./apps/obsidian_plugin",
      rollupOptions: {
        input: {
          main: resolve(__dirname, "index.tsx"),
        },
        output: {
          manualChunks: undefined,
          inlineDynamicImports: true,
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
        },
        external: [
          "obsidian",
          "electron",
          "@codemirror/autocomplete",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/highlight",
          "@lezer/lr",
          ...builtins,
        ],
      },
    },
  } as UserConfig;
});
