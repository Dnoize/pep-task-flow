import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Balloon Tasks",
        short_name: "Balloon Tasks",
        description: "Gérez vos tâches avec motivation 🎈",
        theme_color: "#60A5FA",
        background_color: "#F8FAFC",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "https://storage.googleapis.com/gpt-engineer-file-uploads/aXwIvldIbpPfLRdfXkpoO2pXrCs1/uploads/1759149460794-logTodo.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "https://storage.googleapis.com/gpt-engineer-file-uploads/aXwIvldIbpPfLRdfXkpoO2pXrCs1/uploads/1759149460794-logTodo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/storage\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "external-images",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
