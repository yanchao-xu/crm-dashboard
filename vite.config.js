import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import vitePlugin from "./vitePlugin";

export default defineConfig({
  plugins: [
    react(),
    vitePlugin(),
    //
  ],
  //plugins: [react(), vitePlugin()],
  server: {
    cors: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    sourcemap: true,
    lib: {
      entry: "entry.js",
      formats: ["es"],
      fileName: "bundle",
    },
    assetsInlineLimit: Number.POSITIVE_INFINITY,
    manifest: true,
    rollupOptions: {
      output: {
        // disable code splitting even with dynamic imports
        manualChunks: () => "bundle.js",
      },
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
