/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Default é node (testes das functions); testes de componente declaram
    // `// @vitest-environment jsdom` no topo do arquivo.
    environment: "node",
    setupFiles: ["./src/test-setup.ts"],
  },
});
