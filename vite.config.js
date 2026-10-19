import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

// Multi-page build: landing page plus the legal pages at /terms/ and /privacy/, and /contact/.
export default defineConfig({
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        main: page("./index.html"),
        terms: page("./terms/index.html"),
        privacy: page("./privacy/index.html"),
        contact: page("./contact/index.html"),
      },
    },
  },
});
