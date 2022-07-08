// vite will only be used on development builds
// i can't figure out how to setup the production builds
// it seems like esbuild isn't too good at transpiling

import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
	define: {
		PRODUCTION: "false",
		DEBUG: "true",
	},
	plugins: [svelte()],
});
