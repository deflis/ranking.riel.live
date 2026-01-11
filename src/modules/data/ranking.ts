import {
	type QueryFunction,
	useQueries,
	useQuery,
} from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import {
	type NarouRankingResult,
	type RankingType as NarouRankingType,
	ranking,
} from "narou";
import { createServerFn } from "@tanstack/react-start";

import { filterAtom, isUseFilterAtom } from "../atoms/filter";

import { fetchOptions } from "./custom/utils";
import { itemFetcher, itemKey } from "./item";
import { cacheMiddleware } from "../utils/cacheMiddleware";

export const rankingKey = (type: NarouRankingType, date: DateTime) =>
	["ranking", type, date.toISODate() ?? ""] as const;
export const rankingFetcher: QueryFunction<
	NarouRankingResult[],
	ReturnType<typeof rankingKey>
> = async ({ queryKey: [, type, date] }) =>
	await rankingServerFn({ data: { type, date } });

const rankingServerFn = createServerFn({ method: "GET" })
  .middleware([cacheMiddleware()])
	.inputValidator(
		(data: { type: NarouRankingType; date: string }) => data,
	)
	.handler(async ({ data: { type, date } }) => {
		return await ranking()
			.date(DateTime.fromISO(date).toJSDate())
			.type(type)
			.execute({ fetchOptions });
	});

export function useRanking(type: NarouRankingType, date: DateTime) {
	const { data, isPending: isPendingQuery } = useQuery({
		queryKey: rankingKey(type, date),
		queryFn: rankingFetcher,
		staleTime: Number.POSITIVE_INFINITY, // ランキングデータは不変なはず
	});

	const isUseFilter = useAtomValue(isUseFilterAtom);
	const items = useQueries({
		queries:
			data?.map((v) => ({
				queryKey: itemKey(v.ncode),
				queryFn: itemFetcher,
				enabled: isUseFilter,
			})) ?? [],
	});

	const filter = useAtomValue(filterAtom);
	const isPending = isPendingQuery || items.some((x) => x.isPending);
	const filteredItems = items
		.filter((x) => x.data && filter(x.data))
		// biome-ignore lint/style/noNonNullAssertion: filterによってデータは必ず含まれる
		.map((x) => x.data!);

	return {
		data:
			data?.filter(
				(rank) =>
					!isUseFilter ||
					filteredItems.some((item) => item.ncode === rank.ncode),
			) ?? [],
		isPending,
	};
}

export default useRanking;
