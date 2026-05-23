import type { QueryClient } from "@tanstack/react-query";
import type { DateTime } from "luxon";
import type { NarouRankingResult, RankingType } from "narou";

import { convertDate } from "../utils/date";

import {
	itemDetailFetcher,
	itemDetailKey,
	itemFetcher,
	itemKey,
	itemRankingHistoryFetcher,
	itemRankingHistoryKey,
} from "./item";
import { rankingFetcher, rankingKey } from "./ranking";

export const prefetchRanking = async (
	queryClient: QueryClient,
	type: RankingType,
	date: DateTime,
) => {
	const normalizedDate = convertDate(date, type).toISODate();
	const ranking = await queryClient.ensureQueryData({
		queryKey: rankingKey(type, normalizedDate),
		queryFn: rankingFetcher,
	});
	await prefetchRankingDetail(
		queryClient,
		ranking?.slice(0, 10).map((x) => x.ncode) ?? [],
	);
};

export const prefetchRankingDetail = async (
	queryClient: QueryClient,
	ncodes: string[],
) => {
	await Promise.allSettled(
		ncodes.map(async (ncode) =>
			queryClient.ensureQueryData({
				queryKey: itemKey(ncode),
				queryFn: itemFetcher,
			}),
		),
	);
};

export const prefetchDetail = async (
	queryClient: QueryClient,
	ncode: string,
) => {
	// 詳細とランキング履歴を同時にプリフェッチする
	const listing = queryClient.ensureQueryData({
		queryKey: itemKey(ncode),
		queryFn: itemFetcher,
	});
	queryClient.ensureQueryData({
		queryKey: itemDetailKey(ncode),
		queryFn: itemDetailFetcher,
	});
	queryClient.ensureQueryData({
		queryKey: itemRankingHistoryKey(ncode),
		queryFn: itemRankingHistoryFetcher,
	});
	// タイトルだけ返す。タイトル取得だけであれば詳細やランキング履歴は不要なので、listingの完了を待ってから返す
	return (await listing)?.title ?? null;
};
