import { QueryClient } from '@tanstack/react-query';
import { DateTime } from "luxon";
import { NarouRankingResult, RankingType } from "narou/browser";

import { convertDate } from "../utils/date";

import { itemDetailFetcher, itemDetailKey, itemFetcher, itemKey } from "./item";
import { rankingFetcher, rankingKey } from "./ranking";

export const prefetchRanking = async (
  queryClient: QueryClient,
  type: RankingType,
  date: DateTime
) => {
  await queryClient.prefetchQuery(
    {
      queryKey: rankingKey(type, convertDate(date, type)),
      queryFn: rankingFetcher,
    }
  );
  const ranking = queryClient.getQueryData<NarouRankingResult[]>(
    rankingKey(type, convertDate(date, type))
  );
  await prefetchRankingDetail(
    queryClient,
    ranking?.slice(0, 10).map((x) => x.ncode) ?? []
  );
};

export const prefetchRankingDetail = async (
  queryClient: QueryClient,
  ncodes: string[]
) => {
  await Promise.all(
    ncodes.map(async (ncode) =>
      queryClient.prefetchQuery({
        queryKey: itemKey(ncode),
        queryFn: itemFetcher,
      })
    )
  );
};

export const prefetchDetail = async (
  queryClient: QueryClient,
  ncode: string
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
