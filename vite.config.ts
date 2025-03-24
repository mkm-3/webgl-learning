import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "~/": `${__dirname}/src/`, // path.join(__dirname, "src/") でも可
    },
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
