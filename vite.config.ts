import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
  ssr: {
    noExternal: ["better-sqlite3"],
    resolve: {
      external: ["better-sqlite3"],
    },
  },
  optimizeDeps: {
    exclude: ["better-sqlite3"],
  },
});
