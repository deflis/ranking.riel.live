import {
	type QueryClient,
	type QueryFunction,
	useSuspenseQueries,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import DataLoader from "dataloader";
import { R18Fields, searchR18 } from "narou";

import { parseDate } from "../utils/date";

import { cacheMiddleware } from "../utils/cacheMiddleware";
import { fetchOptions } from "./custom/utils";
import type { NocDetail, NocItem } from "./types";

export const itemKey = (ncode: string) =>
	["item", ncode.toLowerCase(), "listing"] as const;
export const itemFetcher: QueryFunction<
	NocItem | null,
	ReturnType<typeof itemKey>
> = async ({ queryKey: [, ncode] }) =>
	(await itemLoader.load(ncode)) ?? null;

export const itemDetailKey = (ncode: string) =>
	["item", ncode.toLowerCase(), "detail"] as const;
export const itemDetailFetcher: QueryFunction<
	NocDetail | null,
	ReturnType<typeof itemDetailKey>
> = async ({ queryKey: [, ncode] }) =>
	(await itemDetailLoader.load(ncode)) ?? null;

export const useR18ItemForListing = (ncode: string) => {
	const { data, error } = useSuspenseQuery({
		queryKey: itemKey(ncode),
		queryFn: itemFetcher,
	});
	return { data, error };
};

export const useR18DetailForItem = (ncode: string) => {
	const { data, error } = useSuspenseQuery({
		queryKey: itemDetailKey(ncode),
		queryFn: itemDetailFetcher,
	});
	return { data, error };
};

export const prefetchR18Detail = async (
	queryClient: QueryClient,
	ncode: string,
) => {
	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: itemKey(ncode),
			queryFn: itemFetcher,
		}),
		queryClient.prefetchQuery({
			queryKey: itemDetailKey(ncode),
			queryFn: itemDetailFetcher,
		}),
	]);
};

export const useR18DetailForView = (ncode: string) => {
	const [listing, others] = useSuspenseQueries({
		queries: [
			{
				queryKey: itemKey(ncode),
				queryFn: itemFetcher,
			},
			{
				queryKey: itemDetailKey(ncode),
				queryFn: itemDetailFetcher,
			},
		],
	});
	return {
		item: listing.data,
		detail: others.data,
		error: listing.error || others.error,
	};
};

const itemLoader = new DataLoader<string, NocItem | undefined>(
	async (ncodes) => {
		const values = await itemLoaderServerFn({ data: { ncodes } });
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

const itemLoaderServerFn = createServerFn({ method: "GET" })
	.middleware([cacheMiddleware()])
	.inputValidator((data: { ncodes: readonly string[] }) => data)
	.handler(async ({ data: { ncodes } }) => {
		const { values } = await searchR18()
			.ncode(ncodes)
			.limit(ncodes.length)
			.fields([
				R18Fields.ncode,
				R18Fields.title,
				R18Fields.userid,
				R18Fields.writer,
				R18Fields.nocgenre,
				R18Fields.noveltype,
				R18Fields.end,
				R18Fields.general_firstup,
				R18Fields.length,
				R18Fields.general_all_no,
				R18Fields.novelupdated_at,
				R18Fields.general_lastup,
				R18Fields.keyword,
				R18Fields.story,
			])
			.execute({ fetchOptions });
		return values;
	});

const itemDetailLoaderServerFn = createServerFn({ method: "GET" })
	.middleware([cacheMiddleware()])
	.inputValidator((data: { ncodes: readonly string[] }) => data)
	.handler(async ({ data: { ncodes } }) => {
		const { values } = await searchR18()
			.ncode(ncodes)
			.limit(ncodes.length)
			.fields([
				R18Fields.ncode,
				R18Fields.all_hyoka_cnt,
				R18Fields.impression_cnt,
				R18Fields.review_cnt,
				R18Fields.fav_novel_cnt,
				R18Fields.all_point,
				R18Fields.global_point,
				R18Fields.daily_point,
				R18Fields.weekly_point,
				R18Fields.monthly_point,
				R18Fields.quarter_point,
				R18Fields.yearly_point,
			])
			.opt("weekly")
			.execute({ fetchOptions });
		return values;
	});

const itemDetailLoader = new DataLoader<string, NocDetail | undefined>(
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
