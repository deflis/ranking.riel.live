import { QueryClient } from "@tanstack/react-query";

import "../../utils/temporal";
import { RankingType } from "narou";
import { afterEach, describe, expect, it, vi } from "vitest";

import { itemFetcher } from "../item";
import { prefetchRanking } from "../prefetch";
import { rankingFetcher, rankingKey } from "../ranking";

vi.mock("../ranking", async (importOriginal) => ({
	...(await importOriginal<typeof import("../ranking")>()),
	rankingFetcher: vi.fn(),
}));

vi.mock("../item", async (importOriginal) => ({
	...(await importOriginal<typeof import("../item")>()),
	itemFetcher: vi.fn().mockResolvedValue(null),
}));

afterEach(() => {
	vi.clearAllMocks();
	vi.mocked(rankingFetcher).mockReset();
});

describe("prefetchRanking", () => {
	const date = Temporal.PlainDate.from("2026-11-03");
	const ranking = [{ ncode: "n1", rank: 1, pt: 100 }];
	const createClient = () =>
		new QueryClient({
			defaultOptions: {
				queries: { retry: false, gcTime: 0, staleTime: 10 * 60 * 1000 },
			},
		});

	it("当日のデータがあれば当日のランキングを表示する", async () => {
		vi.mocked(rankingFetcher).mockResolvedValue(ranking);
		const client = createClient();

		expect(await prefetchRanking(client, RankingType.Daily, date, true)).toBe(
			"2026-11-03",
		);
		expect(rankingFetcher).toHaveBeenCalledTimes(1);
		expect(itemFetcher).toHaveBeenCalledTimes(1);
	});

	it.each([
		[],
		"Error: Data not found.",
		new Error("Error: Data not found."),
		new Error("HTTP 404: Not Found"),
		new Error("HTTP 403: Forbidden"),
		new Error("JSONP callback was not called"),
	])(
		"当日のデータがない場合は前日のランキングを取得する (%s)",
		async (response) => {
			const fetcher = vi.mocked(rankingFetcher);
			if (Array.isArray(response)) {
				fetcher.mockResolvedValueOnce(response);
			} else {
				fetcher.mockRejectedValueOnce(response);
			}
			fetcher.mockResolvedValueOnce(ranking);
			const client = createClient();

			expect(await prefetchRanking(client, RankingType.Daily, date, true)).toBe(
				"2026-11-02",
			);
			expect(
				client.getQueryData(rankingKey(RankingType.Daily, "2026-11-02")),
			).toEqual(ranking);
			expect(fetcher).toHaveBeenCalledTimes(2);
			expect(itemFetcher).toHaveBeenCalledTimes(1);
		},
	);

	it("過去の日付では前日に切り替えない", async () => {
		vi.mocked(rankingFetcher).mockRejectedValue("Error: Data not found.");
		await expect(
			prefetchRanking(createClient(), RankingType.Daily, date, false),
		).rejects.toBe("Error: Data not found.");
		expect(rankingFetcher).toHaveBeenCalledTimes(1);
	});

	it("当日の日付を明示指定した場合も前日に切り替えない", async () => {
		vi.mocked(rankingFetcher).mockResolvedValue([]);
		expect(
			await prefetchRanking(createClient(), RankingType.Daily, date, false),
		).toBe("2026-11-03");
		expect(rankingFetcher).toHaveBeenCalledTimes(1);
	});

	it("日付指定時の403は前日に切り替えず通知する", async () => {
		vi.mocked(rankingFetcher).mockRejectedValue(
			new Error("HTTP 403: Forbidden"),
		);
		await expect(
			prefetchRanking(createClient(), RankingType.Daily, date, false),
		).rejects.toThrow("HTTP 403: Forbidden");
		expect(rankingFetcher).toHaveBeenCalledTimes(1);
	});

	it("前日も403ならエラーを通知してそれ以上さかのぼらない", async () => {
		vi.mocked(rankingFetcher).mockRejectedValue(
			new Error("HTTP 403: Forbidden"),
		);
		await expect(
			prefetchRanking(createClient(), RankingType.Daily, date, true),
		).rejects.toThrow("HTTP 403: Forbidden");
		expect(rankingFetcher).toHaveBeenCalledTimes(2);
	});

	it("当日分が公開されたら再取得で当日のランキングに戻る", async () => {
		vi.mocked(rankingFetcher)
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce(ranking)
			.mockResolvedValueOnce(ranking);
		const client = createClient();
		expect(await prefetchRanking(client, RankingType.Daily, date, true)).toBe(
			"2026-11-02",
		);
		expect(await prefetchRanking(client, RankingType.Daily, date, true)).toBe(
			"2026-11-03",
		);
		expect(rankingFetcher).toHaveBeenCalledTimes(3);
	});

	it("通信障害では前日に切り替えない", async () => {
		vi.mocked(rankingFetcher).mockRejectedValue(new Error("Network error"));
		await expect(
			prefetchRanking(createClient(), RankingType.Daily, date, true),
		).rejects.toThrow("Network error");
		expect(rankingFetcher).toHaveBeenCalledTimes(1);
	});

	it("前日もない場合はそれ以上さかのぼらない", async () => {
		vi.mocked(rankingFetcher).mockResolvedValue([]);
		expect(
			await prefetchRanking(createClient(), RankingType.Daily, date, true),
		).toBe("2026-11-02");
		expect(rankingFetcher).toHaveBeenCalledTimes(2);
	});

	it.each([
		[RankingType.Weekly, "2026-10-27"],
		[RankingType.Monthly, "2026-10-01"],
		[RankingType.Quarterly, "2026-10-01"],
	])("%sでは前の集計期間に切り替える", async (type, expected) => {
		vi.mocked(rankingFetcher)
			.mockResolvedValueOnce([])
			.mockResolvedValueOnce(ranking);
		expect(await prefetchRanking(createClient(), type, date, true)).toBe(
			expected,
		);
	});
});
