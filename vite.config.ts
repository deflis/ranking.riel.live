import { cloudflare } from "@cloudflare/vite-plugin";
import babel from "@rolldown/plugin-babel";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { RankingType } from "./src/modules/interfaces/RankingType.ts";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({
			srcDirectory: "src",
			// 検索条件はブラウザーで処理するため、種別ごとの共通HTMLだけを生成する。
			pages: [
				"/custom",
				"/r18/ranking",
				...Object.values(RankingType).flatMap((type) => [
					`/custom/${type}`,
					`/r18/ranking/${type}`,
				]),
			].map((path) => ({ path })),
			// 作品詳細は静的シェルから起動し、通常ランキングのSSRは維持する。
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
