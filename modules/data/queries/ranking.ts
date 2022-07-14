import { useAtomValue } from "jotai";
import { DateTime } from "luxon";
import {
  ranking,
  RankingType as NarouRankingType,
} from "narou/src/index.browser";
import { useQueries, useQuery } from "react-query";
import { filterAtom, isUseFilterAtom } from "../../atoms/filter";
import { formatDate } from "../../utils/date";
import { detailFetcher, detailKey } from "./detail";

export const rankingKey = (type: NarouRankingType, date: DateTime) =>
  ["ranking", type, formatDate(date, type)] as const;

export function useRanking(type: NarouRankingType, date: DateTime) {
  const { data, isLoading: isLoadingQuery } = useQuery({
    queryKey: rankingKey(type, date),
    queryFn: () => ranking().date(date.toJSDate()).type(type).execute(),
  });

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
