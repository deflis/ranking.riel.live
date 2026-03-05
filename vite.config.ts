import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const excludePaths = [
	"/custom/",
	"/detail/",
	"/ranking/d/",
	"/ranking/w/",
	"/ranking/m/",
	"/ranking/q/",
]

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		tanstackStart({
			srcDirectory: "src",
			prerender: {
				enabled: true,
        crawlLinks: true,
				filter: ({ path }) => !excludePaths.some(excludePath => path.startsWith(excludePath)),
			},
		}),
		react(),
		tsconfigPaths(),
	],

	environments: {
		ssr: {
			resolve: { conditions: ["workerd", "worker", "node", "default"] },
		},
	},
});
