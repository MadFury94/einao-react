import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
    // Reuse the existing client's public assets (images, fonts, icons)
    publicDir: path.resolve(__dirname, "../client/public"),
    plugins: [
        cloudflare({ viteEnvironment: { name: "ssr" } }),
        reactRouter(),
        tsconfigPaths(),
    ],
});
