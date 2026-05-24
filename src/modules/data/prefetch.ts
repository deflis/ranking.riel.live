import type { QueryClient } from "@tanstack/react-query";
import type { DateTime } from "luxon";
import type { RankingType } from "narou";

import type {
	CustomRankingParams,
	R18RankingParams,
} from "../interfaces/CustomRankingParams";
import { convertDate } from "../utils/date";

import { getCustomRankingQueryFn } from "./custom";
import {
	itemDetailFetcher,
	itemDetailKey,
	itemFetcher,
	itemKey,
	itemRankingHistoryFetcher,
	itemRankingHistoryKey,
} from "./item";
import {
	itemDetailFetcher as r18ItemDetailFetcher,
	itemDetailKey as r18ItemDetailKey,
	itemFetcher as r18ItemFetcher,
	itemKey as r18ItemKey,
} from "./r18item";
import { getR18RankingQueryFn } from "./r18ranking";
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
	prefetchRankingDetail(
		queryClient,
		ranking?.slice(0, 10).map((x) => x.ncode) ?? [],
	);
	// ランキングのprefetchでは値を返す必要がない
};

export const prefetchRankingDetail = (
	queryClient: QueryClient,
	ncodes: string[],
) => {
	ncodes.map((ncode) =>
		queryClient.ensureQueryData({
			queryKey: itemKey(ncode),
			queryFn: itemFetcher,
		}),
	);
};

export const prefetchCustomRanking = async (
	queryClient: QueryClient,
	params: CustomRankingParams,
	page: number,
) => {
	const ranking = await queryClient.ensureQueryData({
		queryKey: [params, page],
		queryFn: getCustomRankingQueryFn(queryClient),
	});
	prefetchRankingDetail(queryClient, ranking?.map((x) => x.ncode) ?? []);
	// ランキングのprefetchでは値を返す必要がない
};

export const prefetchDetail = async (
	queryClient: QueryClient,
	ncode: string,
) => {
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
	return listing;
};

export const prefetchR18Ranking = async (
	queryClient: QueryClient,
	params: R18RankingParams,
	page: number,
) => {
	const ranking = await queryClient.ensureQueryData({
		queryKey: [params, page],
		queryFn: getR18RankingQueryFn(queryClient),
	});
	prefetchR18RankingDetail(
		queryClient,
		ranking?.slice(0, 10).map((x) => x.ncode) ?? [],
	);
	// ランキングのprefetchでは値を返す必要がない
};

export const prefetchR18RankingDetail = (
	queryClient: QueryClient,
	ncodes: string[],
) => {
	ncodes.map((ncode) =>
		queryClient.ensureQueryData({
			queryKey: r18ItemKey(ncode),
			queryFn: r18ItemFetcher,
		}),
	);
};

export const prefetchR18Detail = (queryClient: QueryClient, ncode: string) => {
	const listing = queryClient.ensureQueryData({
		queryKey: r18ItemKey(ncode),
		queryFn: r18ItemFetcher,
	});
	queryClient.ensureQueryData({
		queryKey: r18ItemDetailKey(ncode),
		queryFn: r18ItemDetailFetcher,
	});
	return listing;
};
