import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: [
                "favicon.svg",
                "robots.txt",
                "favicon.ico",
            ],
            manifest: {
                name: "Arogya Raksha",
                short_name: "Arogya",
                description: "Emergency health and appointment platform",
                theme_color: "#0f766e",
                background_color: "#ffffff",
                display: "standalone",
                start_url: "/?source=pwa",
                icons: [
                    {
                        src: "/pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "/pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                ],
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 6 * 1024 * 1024, // (optional) increase limit
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                globIgnores: ['**/zego-uikit-prebuilt-*.js'],  // ⛔ exclude large Zego file
            }
        }),
    ],
});
