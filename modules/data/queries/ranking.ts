import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { DateTime } from "luxon";
import {
  NarouNovelJsonp,
  ranking,
  RankingType as NarouRankingType,
} from "narou";
import { useQueries, useQuery } from "react-query";
import { filterAtom, isUseFilterAtom } from "../../atoms/filter";
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

  const isUseFilter = useAtomValue(isUseFilterAtom);
  const items = useQueries(
    isUseFilter
      ? data.map((v) => ({
          queryKey: detailKey(v.ncode),
          queryFn: detailFetcher,
          enabled: isUseFilter,
        }))
      : []
  );
  useHydrateAtoms([[filterAtom, (x) => x]] as const);
  const filter = useAtomValue(filterAtom);
  const isLoading = isLoadingQuery || items.some((x) => x.isLoading);
  if (!isLoading && isUseFilter) {
    const filteredItems = filter(items.map((x) => x.data));
    return {
      data: data.filter((rank) =>
        filteredItems.some((item) => item.ncode === rank.ncode)
      ),
      isLoading,
    };
  }

  return { data: data ?? [], isLoading };
}

export default useRanking;
