import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      { find: /\.(vs|fs)$/, replacement: "$&?raw" },
      { find: "~/", replacement: `${__dirname}/src/` },
    ],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".fs": "text",
        ".vs": "text",
      },
    },
  },
});
