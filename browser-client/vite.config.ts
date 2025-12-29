import { defineConfig } from "vite";
import { resolve } from "path";
import { analyzer } from "vite-bundle-analyzer"

export default defineConfig({
	plugins: [
		//analyzer()
	],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "MyLibrary",
      fileName: (format) => `browser-client.${format}.js`
    },
    minify: "esbuild", // or "terser" for better compression
    sourcemap: true,
	 rollupOptions: {
		external: ["react", "react-dom", "react-dom/server", "react-dom/client", "react-dom/server.browser", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
		},
	 },
  }
});
