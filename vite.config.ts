import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
				// トップページは最新ランキングへ転送するため、閲覧時に取得する。
				filter: ({ path }) => path !== "/",
			},
		}),
		react(),
		babel({ presets: [reactCompilerPreset()] }),
	],

	resolve: { tsconfigPaths: true },

	environments: {
		ssr: {
			resolve: { conditions: ["workerd", "worker", "node", "default"] },
		},
	},
});
