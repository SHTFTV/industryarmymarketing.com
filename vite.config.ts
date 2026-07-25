import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.split(path.sep).join("/");

          if (normalizedId.includes("/node_modules/")) {
            if (/[\\/]node_modules[\\/](react|react-dom|react-router-dom|react-helmet-async|@tanstack)[\\/]/.test(id)) {
              return "vendor-react";
            }

            if (normalizedId.includes("/node_modules/@radix-ui/") || normalizedId.includes("/node_modules/lucide-react/")) {
              return "vendor-ui";
            }

            if (
              normalizedId.includes("/node_modules/framer-motion/") ||
              normalizedId.includes("/node_modules/recharts/") ||
              normalizedId.includes("/node_modules/embla-carousel-react/")
            ) {
              return "vendor-visual";
            }

            if (normalizedId.includes("/node_modules/@supabase/") || normalizedId.includes("/node_modules/zod/")) {
              return "vendor-data";
            }

            if (
              normalizedId.includes("/node_modules/react-markdown/") ||
              normalizedId.includes("/node_modules/date-fns/") ||
              normalizedId.includes("/node_modules/jspdf/")
            ) {
              return "vendor-content";
            }

            return "vendor";
          }

          if (
            normalizedId.includes("/src/pages/Blog") ||
            normalizedId.includes("/src/data/blogPosts") ||
            normalizedId.includes("/src/components/AIIndexing")
          ) {
            return "page-blog";
          }

          if (normalizedId.includes("/src/pages/Service") || normalizedId.includes("/src/components/Services")) {
            return "page-services";
          }

          if (normalizedId.includes("/src/pages/SeoPackages") || normalizedId.includes("/src/components/Pricing")) {
            return "page-pricing";
          }

          return undefined;
        },
      },
    },
  },
}));
