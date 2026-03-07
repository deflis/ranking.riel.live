import {
	type QueryFunction,
	useSuspenseQueries,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import {
	type NarouRankingResult,
	type RankingType as NarouRankingType,
	ranking,
} from "narou";

import { filterAtom, isUseFilterAtom } from "../atoms/filter";

import { setCacheHeaders } from "../utils/cacheMiddleware";
import { fetchOptions } from "./custom/utils";
import { itemFetcher, itemKey } from "./item";

export const rankingKey = (type: NarouRankingType, date: string) =>
	["ranking", type, date] as const;
export const rankingFetcher: QueryFunction<
	NarouRankingResult[],
	ReturnType<typeof rankingKey>
> = async ({ queryKey: [, type, date] }) =>
	(await rankingServerFn({ type, date })) ?? [];

const rankingServerFn = createIsomorphicFn().server(
	async ({ type, date }: { type: NarouRankingType; date: string }) => {
		// 過去のランキングは全く変わらないはずなので長めにキャッシュする
		setCacheHeaders({
			maxAge: 60 * 60 * 24 * 30, // 30 日
			sMaxAge: 60 * 60 * 24 * 30, // 30 日
		});
		const dateValue = DateTime.fromISO(date, { zone: "Asia/Tokyo" })
			.setZone("UTC", { keepLocalTime: true })
			.toJSDate();
		return await ranking().date(dateValue).type(type).execute({
			fetchOptions, // TTLは伸ばしていないが、未生成のランキングのエラーをキャッシュするのは避けたい
		});
	},
);

export function useRanking(type: NarouRankingType, date: string) {
	const { data } = useSuspenseQuery({
		queryKey: rankingKey(type, date),
		queryFn: rankingFetcher,
		staleTime: Number.POSITIVE_INFINITY, // ランキングデータは不変なはず
	});

	const isUseFilter = useAtomValue(isUseFilterAtom);
	const items = useSuspenseQueries({
		queries: isUseFilter
			? data.map((v) => ({
					queryKey: itemKey(v.ncode),
					queryFn: itemFetcher,
				}))
			: [],
	});

	const filter = useAtomValue(filterAtom);
	const filteredItems = items
		.map((x) => x.data)
		.filter((data) => data != null && (!isUseFilter || filter(data)));

	return {
		data: data.filter(
			(rank) =>
				!isUseFilter ||
				(filteredItems.some(
					(item) => item != null && item.ncode === rank.ncode,
				) ??
					false),
		),
	};
}

export default useRanking;
