import {
	type QueryFunction,
	useQueries,
	useQuery,
} from "@tanstack/react-query";
import DataLoader from "dataloader";
import { DateTime } from "luxon";
import {
	Fields,
	type RankingHistoryResult,
	RankingType,
	rankingHistory,
	search,
} from "narou";
import { createServerFn } from '@tanstack/react-start';

import { parseDate } from "../utils/date";

import { fetchOptions } from "./custom/utils";
import type { Detail, Item, RankingHistories } from "./types";
import { cacheMiddleware } from "../utils/cacheMiddleware";

export const itemKey = (ncode: string) =>
	["item", ncode.toLowerCase(), "listing"] as const;
export const itemFetcher: QueryFunction<
	Item | undefined,
	ReturnType<typeof itemKey>
> = async ({ queryKey: [, ncode] }) => await itemLoader.load(ncode);

export const itemDetailKey = (ncode: string) =>
	["item", ncode.toLowerCase(), "detail"] as const;
export const itemDetailFetcher: QueryFunction<
	Detail | undefined,
	ReturnType<typeof itemDetailKey>
> = async ({ queryKey: [, ncode] }) => await itemDetailLoader.load(ncode);

export const itemRankingHistoryKey = (ncode: string) =>
	["item", ncode.toLowerCase(), "ranking"] as const;
export const itemRankingHistoryFetcher: QueryFunction<
	RankingHistories,
	ReturnType<typeof itemRankingHistoryKey>
> = async ({ queryKey: [, ncode] }) => {
	const history = await itemRankingHistoryServerFn({ data: { ncode } });
	return formatRankingHistory(history);
};

export const useItemForListing = (ncode: string) => {
	const { data, isPending, error } = useQuery({
		queryKey: itemKey(ncode),
		queryFn: itemFetcher,
	});
	return { data, isPending, error };
};

export const useDetailForView = (ncode: string) => {
	const [listing, others, ranking] = useQueries({
		queries: [
			{
				queryKey: itemKey(ncode),
				queryFn: itemFetcher,
			},
			{
				queryKey: itemDetailKey(ncode),
				queryFn: itemDetailFetcher,
			},
			{
				queryKey: itemRankingHistoryKey(ncode),
				queryFn: itemRankingHistoryFetcher,
			},
		],
	});
	return {
		item: listing.data,
		detail: others.data,
		ranking: ranking.data,
		isPending: listing.isPending || listing.isPending || ranking.isPending,
		error: listing.error || others.error || ranking.error,
	};
};

const itemLoaderServerFn = createServerFn({ method: 'GET' })
  .middleware([cacheMiddleware()])
  .inputValidator((data: {ncodes: readonly string[]}) => data)
  .handler(async ({data: {ncodes}}) => {
		const { values} = await search()
			.ncode(ncodes)
			.limit(ncodes.length)
			.fields([
				Fields.ncode,
				Fields.title,
				Fields.userid,
				Fields.writer,
				Fields.genre,
				Fields.noveltype,
				Fields.end,
				Fields.general_firstup,
				Fields.length,
				Fields.general_all_no,
				Fields.novelupdated_at,
				Fields.general_lastup,
				Fields.keyword,
				Fields.story,
			])
			.execute({ fetchOptions });
      return values;
    });

const itemLoader = new DataLoader<string, Item | undefined>(
	async (ncodes) => {
		const values = await itemLoaderServerFn({data: {ncodes}});
		return ncodes
			.map((x) => x.toLowerCase())
			.map((ncode) =>
				values
					.map(
						({
							general_firstup,
							general_lastup,
							novelupdated_at,
							...others
						}) => ({
							general_firstup: parseDate(general_firstup),
							general_lastup: parseDate(general_lastup),
							novelupdated_at: parseDate(novelupdated_at),
							...others,
						}),
					)
					.find((x) => x.ncode.toLowerCase() === ncode),
			);
	},
	{
		cache: false,
		maxBatchSize: 500,
	},
);

const itemDetailLoaderServerFn = createServerFn({ method: 'GET' })
  .middleware([cacheMiddleware()])
	.inputValidator((data: { ncodes: readonly string[] }) => data)
	.handler(async ({ data: { ncodes } }) => {
		const { values } = await search()
			.ncode(ncodes)
			.limit(ncodes.length)
			.fields([
				Fields.ncode,
				Fields.all_hyoka_cnt,
				Fields.impression_cnt,
				Fields.review_cnt,
				Fields.fav_novel_cnt,
				Fields.all_point,
				Fields.global_point,
				Fields.daily_point,
				Fields.weekly_point,
				Fields.monthly_point,
				Fields.quarter_point,
				Fields.yearly_point,
			])
			.opt("weekly")
			.execute({ fetchOptions });
		return values;
	});

const itemRankingHistoryServerFn = createServerFn({ method: 'GET' })
  .middleware([cacheMiddleware()])
	.inputValidator((data: { ncode: string }) => data)
	.handler(async ({ data: { ncode } }) => {
		return await rankingHistory(ncode, { fetchOptions });
	});

const itemDetailLoader = new DataLoader<string, Detail | undefined>(
	async (ncodes) => {
		const values = await itemDetailLoaderServerFn({ data: { ncodes } });
		return ncodes
			.map((x) => x.toLowerCase())
			.map((ncode) => values.find((x) => x.ncode.toLowerCase() === ncode));
	},
	{
		cache: false,
		maxBatchSize: 500,
	},
);

const rankingTypes = [
	RankingType.Daily,
	RankingType.Weekly,
	RankingType.Monthly,
	RankingType.Quarterly,
] as const;

const formatRankingHistory = (history: RankingHistoryResult[]) => {
	const rankingData = Object.create(null) as RankingHistories;
	for (const type of rankingTypes) {
		rankingData[type] = history
			.filter((x) => x.type === type)
			.map(({ date, pt, rank }) => ({
				date: DateTime.fromJSDate(date, { zone: "Asia/Tokyo" }),
				pt,
				rank,
			}));
	}
	return rankingData;
};
