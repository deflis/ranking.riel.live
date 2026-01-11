import { type QueryFunction, useQueries, useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import {
  type NarouRankingResult,
  type RankingType as NarouRankingType,
  ranking,
} from "narou";

import { filterAtom, isUseFilterAtom } from "../atoms/filter";

import { itemFetcher, itemKey } from "./item";

export const rankingKey = (type: NarouRankingType, date: DateTime) =>
  ["ranking", type, date.toISODate() ?? ""] as const;
export const rankingFetcher: QueryFunction<
  NarouRankingResult[],
  ReturnType<typeof rankingKey>
> = async ({ queryKey: [, type, date] }) =>
    await ranking().date(DateTime.fromISO(date).toJSDate()).type(type).execute();

export function useRanking(type: NarouRankingType, date: DateTime) {
  const { data, isLoading: isLoadingQuery } = useQuery({
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
  const isLoading = isLoadingQuery || items.some((x) => x.isLoading);
  const filteredItems = items
    .filter((x) => x.data && filter(x.data))
    // biome-ignore lint/style/noNonNullAssertion: filterによってデータは必ず含まれる
    .map((x) => x.data!);

  return {
    data:
      data?.filter(
        (rank) =>
          !isUseFilter ||
          filteredItems.some((item) => item.ncode === rank.ncode)
      ) ?? [],
    isLoading,
  };
}

export default useRanking;
