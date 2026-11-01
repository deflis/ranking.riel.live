import { gzipSync } from "node:zlib";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RankingType } from "../../interfaces/RankingType";
import { getCustomRankingQueryFn } from "../custom";
import { getR18RankingQueryFn } from "../r18ranking";

const defaultParams = {
	byTitle: false,
	byStory: false,
	genres: [],
	sites: [],
	rensai: true,
	kanketsu: true,
	tanpen: true,
	rankingType: RankingType.Daily,
};

function mockSearch() {
	return vi.spyOn(globalThis, "fetch").mockImplementation(
		async () =>
			new Response(
				gzipSync(
					JSON.stringify([
						{ allcount: 1 },
						{
							ncode: "N0001AA",
							daily_point: 100,
							length: 2000,
							noveltype: 1,
							end: 1,
							general_firstup: "2026-01-01 00:00:00",
						},
					]),
				),
			),
	);
}

afterEach(() => {
	vi.restoreAllMocks();
});

for (const isR18 of [false, true]) {
	describe(isR18
		? "R18ランキングの文字数条件"
		: "カスタムランキングの文字数条件", () => {
		it.each([
			{ minLength: 1000, maxLength: undefined, expected: "1000-" },
			{ minLength: undefined, maxLength: 3000, expected: "-3000" },
			{ minLength: 1000, maxLength: 3000, expected: "1000-3000" },
			{ minLength: 2000, maxLength: 2000, expected: "2000-2000" },
			{ minLength: 0, maxLength: undefined, expected: "0-" },
			{ minLength: undefined, maxLength: undefined, expected: null },
		])(
			"下限 $minLength、上限 $maxLength をAPIへ送信する",
			async ({ minLength, maxLength, expected }) => {
				const fetch = mockSearch();
				const client = new QueryClient();
				try {
					const params = { ...defaultParams, minLength, maxLength };
					const queryKey = [params, 1] as const;
					const result = isR18
						? await client.fetchQuery({
								queryKey,
								queryFn: getR18RankingQueryFn(client),
							})
						: await client.fetchQuery({
								queryKey,
								queryFn: getCustomRankingQueryFn(client),
							});
					expect(result).toEqual([{ ncode: "N0001AA", rank: 1, pt: 100 }]);
					expect(fetch).toHaveBeenCalledTimes(1);
					const url = new URL(String(fetch.mock.calls[0][0]));
					expect(url.searchParams.get("length")).toBe(expected);
				} finally {
					client.clear();
				}
			},
		);
	});
}

it("初回掲載日の絞り込みに開始日時から現在までの更新日時範囲を送信する", async () => {
	const now = new Date("2026-02-01T00:00:00+09:00");
	vi.spyOn(Date, "now").mockReturnValue(now.getTime());
	const fetch = mockSearch();
	const client = new QueryClient();
	try {
		await client.fetchQuery({
			queryKey: [{ ...defaultParams, firstUpdate: "2026-01-01" }, 1] as const,
			queryFn: getCustomRankingQueryFn(client),
		});
		const url = new URL(String(fetch.mock.calls[0][0]));
		const from = new Date("2026-01-01T00:00:00+09:00").getTime() / 1000;
		expect(url.searchParams.get("lastup")).toBe(
			`${from}-${now.getTime() / 1000}`,
		);
	} finally {
		client.clear();
	}
});
