import {
	type QueryFunction,
	useSuspenseQueries,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import {
	type NarouRankingResult,
	type RankingType as NarouRankingType,
	ranking,
} from "narou";

import { nowInTokyo } from "@/modules/utils/temporal";

import { filterAtom, isUseFilterAtom } from "../atoms/filter";
import { fetchOptions } from "./custom/utils";
import { itemFetcher, itemKey } from "./item";
import type { Item } from "./types";

export const rankingKey = (type: NarouRankingType, date: string) =>
	["ranking", type, date] as const;
export const rankingFetcher: QueryFunction<
	NarouRankingResult[],
	ReturnType<typeof rankingKey>
> = async ({ queryKey: [, type, date] }) => {
	const requestDate = Temporal.PlainDate.from(date);
	const noon = requestDate.toZonedDateTime({
		timeZone: "Asia/Tokyo",
		plainTime: "12:00",
	});
	const isGenerated = Temporal.ZonedDateTime.compare(nowInTokyo(), noon) >= 0;
	const dateValue = new Date(`${requestDate}T00:00:00Z`);

	return await ranking()
		.date(dateValue)
		.type(type)
		.execute({
			fetchOptions: {
				...fetchOptions,
				cf: {
					cacheTtlByStatus: {
						"200-299": isGenerated ? 60 * 60 * 24 * 30 : 60 * 5, // 生成済みなら30日、未生成(当日等)なら5分
						404: 1,
						"500-599": 0,
					},
					cacheEverything: true,
				},
			},
		});
};

export function filterRankingData<T extends { ncode: string }>(
	data: T[],
	items: { data: Item | undefined | null }[],
	isUseFilter: boolean,
	filter: (item: Item) => boolean,
): T[] {
	if (!isUseFilter) {
		return data;
	}

	const itemMap = new Map<string, Item>();
	for (const { data: item } of items) {
		if (item != null) {
			itemMap.set(item.ncode.toLowerCase(), item);
		}
	}

	return data.filter((rank) => {
		const item = itemMap.get(rank.ncode.toLowerCase());
		return item != null && filter(item);
	});
}

export function useRanking(type: NarouRankingType, date: string) {
	const { data } = useSuspenseQuery({
		queryKey: rankingKey(type, date),
		queryFn: rankingFetcher,
		staleTime: Number.POSITIVE_INFINITY, // ランキングデータは不変なはず
	});

	const isUseFilter = useAtomValue(isUseFilterAtom);
	const filter = useAtomValue(filterAtom);
	const items = useSuspenseQueries({
		queries: isUseFilter
			? data.map((v) => ({
					queryKey: itemKey(v.ncode),
					queryFn: itemFetcher,
				}))
			: [],
	});

	return {
		data: filterRankingData(data, items, isUseFilter, filter),
	};
}

export default useRanking;
