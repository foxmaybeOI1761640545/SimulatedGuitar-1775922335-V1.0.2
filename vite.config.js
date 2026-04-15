import { defineConfig } from "vite";

export default defineConfig({
  // Use relative asset paths so GitHub Pages project site path changes
  // (for example V1.0.1 -> V1.0.2) do not break static asset loading.
  base: "./"
});
