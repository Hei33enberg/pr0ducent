import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";

function manualChunks(id: string) {
  if (!id.includes("node_modules")) return;
  if (id.includes("recharts")) return "vendor-recharts";
  if (id.includes("framer-motion")) return "vendor-motion";
  if (
    id.includes("node_modules/react-dom/") ||
    id.includes("node_modules/react-router") ||
    id.includes("node_modules/react/") ||
    id.includes("node_modules/scheduler/")
  ) {
    return "vendor-react";
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), imagetools(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
}));
