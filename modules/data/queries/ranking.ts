import { useAtom, useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { DateTime } from "luxon";
import {
  NarouNovelJsonp,
  NarouSearchResult,
  ranking,
  RankingType as NarouRankingType,
} from "narou";
import { useQueries, useQuery } from "react-query";
import { filterAtom, forLogAtom, isUseFilterAtom } from "../../atoms/filter";
import { formatDate } from "../../utils/date";
import { detailFetcher, detailKey } from "./detail";

export const rankingKey = (type: NarouRankingType, date: DateTime) =>
  ["ranking", type, formatDate(date, type)] as const;

export function useRanking(type: NarouRankingType, date: DateTime) {
  const { data, isLoading: isLoadingQuery } = useQuery({
    queryKey: rankingKey(type, date),
    queryFn: () =>
      ranking(new NarouNovelJsonp()).date(date.toJSDate()).type(type).execute(),
  });

  useHydrateAtoms([
    [isUseFilterAtom, false],
    [filterAtom, (x: NarouSearchResult) => x],
  ] as const);

  const isUseFilter = useAtomValue(isUseFilterAtom);
  const items = useQueries(
    data?.map((v) => ({
      queryKey: detailKey(v.ncode),
      queryFn: detailFetcher,
      enabled: isUseFilter,
    })) ?? []
  );

  const filter = useAtomValue(filterAtom);
  const isLoading = isLoadingQuery || items.some((x) => x.isLoading);
  const filteredItems = items
    .filter((x) => x.data && filter(x.data))
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
