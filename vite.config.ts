import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
// @ts-ignore - manifest.json is a valid JSON file
import manifestSource from "./src/chrome-extension/manifest.json";

// https://vitejs.dev/config/
export default defineConfig({
  // 使用相对路径，适配 Chrome 扩展
  base: "./",
  plugins: [
    react(),
    crx({
      manifest: manifestSource,
      contentScripts: {
        injectCss: true,
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
  build: {
    // 确保资源路径使用相对路径
    assetsDir: "assets",
    rollupOptions: {
      // 多入口配置 - popup 和 options 页面
      input: {
        "src/chrome-extension/popup/index": "./src/chrome-extension/popup/index.html",
        "src/chrome-extension/options/index": "./src/chrome-extension/options/index.html",
      },
      output: {
        // 使用相对路径
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: (chunkInfo) => {
          // 对于 HTML 入口点，保持原始路径结构
          if (chunkInfo.name?.includes("src/chrome-extension")) {
            return "[name].js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
});
