import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { RankingType } from "./src/modules/interfaces/RankingType";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tailwindcss(),
		tanstackStart({
			srcDirectory: "src",
			// 検索条件はブラウザーで処理するため、種別ごとの共通HTMLだけを生成する。
			pages: [
				"/custom",
				...Object.values(RankingType).map((type) => `/custom/${type}`),
			].map((path) => ({ path })),
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
