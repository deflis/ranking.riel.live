import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RankingHistoryChart } from "./RankingHistoryChart";

const colors = {
	rank: "#2563eb",
	pt: "#e11d48",
	text: "#1f2937",
	bg: "white",
};

describe("ランキング履歴グラフのサーバー描画", () => {
	it("空の履歴は描画しないこと", () => {
		expect(
			renderToStaticMarkup(<RankingHistoryChart data={[]} colors={colors} />),
		).toBe("");
	});

	it("1件の履歴と0ポイントを不正な座標なしで描画できること", () => {
		const html = renderToStaticMarkup(
			<RankingHistoryChart
				data={[{ date: "2026-01-01", 順位: 1, ポイント: 0 }]}
				colors={colors}
			/>,
		);
		expect(html).toContain("順位とポイントの推移");
		expect(html).toContain("ランキング履歴の期間選択");
		expect(html).toContain("2026-01-01");
		expect(html).not.toMatch(/NaN|Infinity/);
	});

	it("欠測日をまたぐ線を分断し、順位とポイントをそれぞれ描画すること", () => {
		const html = renderToStaticMarkup(
			<RankingHistoryChart
				data={[
					{ date: "2026-01-01", 順位: 1, ポイント: 100 },
					{ date: "2026-01-02", 順位: 10, ポイント: 200 },
					{ date: "2026-01-03", 順位: null, ポイント: null },
					{ date: "2026-01-04", 順位: 100, ポイント: 0 },
					{ date: "2026-01-05", 順位: 300, ポイント: 50 },
				]}
				colors={colors}
			/>,
		);
		const mainChart = html.slice(0, html.indexOf("</svg>"));
		const paths = [...mainChart.matchAll(/<path\b[^>]*\bd="([^"]*)"[^>]*>/g)];
		for (const color of [colors.rank, colors.pt]) {
			const segments = paths.filter(([element]) =>
				element.includes(`stroke="${color}"`),
			);
			expect(segments.length).toBeGreaterThan(0);
			expect(
				segments.flatMap(([, path]) => path.match(/M/g) ?? []),
			).toHaveLength(2);
		}
		expect(html).not.toMatch(/NaN|Infinity/);
	});
});
