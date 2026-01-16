import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
	plugins: [
		wasm(),
		tailwindcss(),
		tanstackRouter({ target: "solid", autoCodeSplitting: true }),
		solid(),
	],

	worker: {
		format: "es",
		plugins: () => [wasm()],
	},
});
