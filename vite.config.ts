import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		tanstackStart({
			srcDirectory: "src",
			// 作品詳細だけを静的なシェルから起動し、ランキングのSSRは維持する。
			spa: {
				enabled: true,
				// 通常ページのプリレンダリングと区別し、詳細の書き換え規則も避ける。
				maskPath: "/about?spa-shell",
			},
			prerender: {
				enabled: true,
				crawlLinks: false,
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
