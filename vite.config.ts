import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// singlefile: the production build is ONE self-contained index.html —
// deployable to any static host and identical to the published artifact.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
});
