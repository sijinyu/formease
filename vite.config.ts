import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const sharedResolve = {
  alias: {
    "@": resolve(__dirname, "src"),
  },
};

// Content script는 IIFE로 단일 파일 번들링 (ESM import 불가)
const contentConfig: UserConfig = {
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, "src/content/index.tsx"),
      name: "FormEaseContent",
      formats: ["iife"],
      fileName: () => "content.js",
    },
    rollupOptions: {
      output: {
        extend: true,
      },
    },
  },
  resolve: sharedResolve,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
};

// Popup + Background는 기존대로 ESM 빌드
const mainConfig: UserConfig = {
  plugins: [
    react(),
    {
      name: "build-content-css",
      async writeBundle() {
        try {
          const css = readFileSync(resolve(__dirname, "dist/assets/popup.css"), "utf-8");
          mkdirSync(resolve(__dirname, "dist/assets"), { recursive: true });
          writeFileSync(resolve(__dirname, "dist/assets/content.css"), css);
        } catch {
          // 첫 빌드시 파일이 없을 수 있음
        }
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
        background: resolve(__dirname, "src/background/index.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  resolve: sharedResolve,
};

const target = process.env.BUILD_TARGET;

export default defineConfig(target === "content" ? contentConfig : mainConfig);
