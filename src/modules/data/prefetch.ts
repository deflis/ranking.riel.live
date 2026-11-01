import type { QueryClient } from "@tanstack/react-query";
import type { NarouRankingResult, RankingType } from "narou";

import type {
	CustomRankingParams,
	R18RankingParams,
} from "../interfaces/CustomRankingParams";
import { addDate, convertDate } from "../utils/date";
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
	date: Temporal.PlainDate,
	fallbackToPrevious: boolean,
) => {
	let normalizedDate = convertDate(date, type).toString();
	const fetchRanking = (date: string) =>
		queryClient.fetchQuery({
			queryKey: rankingKey(type, date),
			queryFn: rankingFetcher,
			staleTime: fallbackToPrevious ? 0 : Number.POSITIVE_INFINITY,
		});
	let ranking: NarouRankingResult[] | undefined;
	try {
		ranking = await fetchRanking(normalizedDate);
	} catch (error) {
		const message = error instanceof Error ? error.message : error;
		const isNotFound =
			message === "Error: Data not found." ||
			(typeof message === "string" && message.startsWith("HTTP 404:"));
		if (!fallbackToPrevious || !isNotFound) {
			throw error;
		}
	}
	if (fallbackToPrevious && !ranking?.length) {
		normalizedDate = addDate(convertDate(date, type), type, -1).toString();
		ranking = await fetchRanking(normalizedDate);
	}
	prefetchRankingDetail(
		queryClient,
		ranking?.slice(0, 10).map((x) => x.ncode) ?? [],
	);
	return normalizedDate;
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
