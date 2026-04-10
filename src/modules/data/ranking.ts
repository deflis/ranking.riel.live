import {
	type QueryFunction,
	useSuspenseQueries,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import {
	type NarouRankingResult,
	type RankingType as NarouRankingType,
	ranking,
} from "narou";

import { filterAtom, isUseFilterAtom } from "../atoms/filter";

import { fetchOptions } from "./custom/utils";
import { itemFetcher, itemKey } from "./item";

export const rankingKey = (type: NarouRankingType, date: string) =>
	["ranking", type, date] as const;
export const rankingFetcher: QueryFunction<
	NarouRankingResult[],
	ReturnType<typeof rankingKey>
> = async ({ queryKey: [, type, date] }) => {
	const requestDate = DateTime.fromISO(date, { zone: "Asia/Tokyo" });
	const now = DateTime.now().setZone("Asia/Tokyo");

	const isGenerated = now >= requestDate.startOf("day").plus({ hours: 12 });

	const dateValue = requestDate
		.setZone("UTC", { keepLocalTime: true })
		.toJSDate();

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

	if (!isUseFilter) {
		return { data };
	}

	const filteredItems = items
		.map((x) => x.data)
		.filter((data) => data != null && filter(data));

	const filteredNcodes = new Set(filteredItems.map((item) => item.ncode));

	return {
		data: data.filter((rank) => filteredNcodes.has(rank.ncode)),
	};
}

export default useRanking;
