import { DateTime } from "luxon";
import { QueryClient } from "react-query";
import { rankingKey, rankingFetcher } from "./queries/ranking";
import { RankingType } from "narou/src/params";
import { convertDate } from "../utils/date";
import { NarouRankingResult } from "narou/src/narou-ranking-results";
import { itemFetcher, itemKey } from "./queries/item";

export const prefetchRanking = async (
  queryClient: QueryClient,
  type: RankingType,
  date: DateTime
) => {
  await queryClient.prefetchQuery(
    rankingKey(type, convertDate(date, type)),
    rankingFetcher
  );
  const ranking = queryClient.getQueryData<NarouRankingResult[]>(
    rankingKey(type, convertDate(date, type))
  );
  await prefetchDetail(
    queryClient,
    ranking?.slice(0, 10).map((x) => x.ncode) ?? []
  );
};

export const prefetchDetail = async (
  queryClient: QueryClient,
  ncodes: string[]
) => {
  await Promise.all(
    ncodes.map(async (ncode) =>
      queryClient.prefetchQuery(itemKey(ncode), itemFetcher)
    )
  );
};
