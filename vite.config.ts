import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/xmlbuilder2") ||
            id.includes("node_modules/@oozcitak")
          ) {
            return "drawio-builder";
          }

          if (id.includes("node_modules/fast-xml-parser")) {
            return "drawio-parser";
          }

          if (id.includes("node_modules/@dnd-kit")) {
            return "dnd-kit";
          }

          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/zustand") ||
            id.includes("node_modules/zod")
          ) {
            return "vendor";
          }
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
  },
});
