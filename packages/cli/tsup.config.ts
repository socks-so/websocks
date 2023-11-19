import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    format: ["cjs", "esm"],
    minify: true,
    entry: ["./src/index.ts"],
    splitting: true,
    sourcemap: false,
    clean: true,
    bundle: true,
    dts: true,
    minifyWhitespace: true,
  };
});
