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
    // Externalize better-sqlite3 for SSR - it's a native module that shouldn't be bundled
    noExternal: [],
  },
  optimizeDeps: {
    exclude: ["better-sqlite3"],
  },
});
