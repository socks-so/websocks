import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    format: ["cjs", "esm"],
    minify: true,
    entry: [
      "./src/index.ts",
      "./src/node/index.ts",
      "./src/react/index.tsx",
      "./src/standalone/index.ts",
    ],
    splitting: true,
    sourcemap: false,
    clean: true,
    bundle: true,
    dts: true,
    minifyWhitespace: true,
  };
});
