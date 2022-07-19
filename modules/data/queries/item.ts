import { QueryFunction, useQueries, useQuery } from "react-query";
import DataLoader from "dataloader";
import {
  PickedNarouSearchResult,
  Fields,
  search,
  rankingHistory,
  RankingHistoryResult,
} from "narou/src/index.browser";

export type ItemResult = PickedNarouSearchResult<
  | "ncode"
  | "title"
  | "userid"
  | "writer"
  | "genre"
  | "noveltype"
  | "end"
  | "general_firstup"
  | "length"
  | "general_all_no"
  | "novelupdated_at"
  | "general_lastup"
  | "keyword"
  | "story"
>;

type DetailResult = PickedNarouSearchResult<
  | "all_hyoka_cnt"
  | "impression_cnt"
  | "review_cnt"
  | "fav_novel_cnt"
  | "all_point"
  | "global_point"
  | "daily_point"
  | "weekly_point"
  | "monthly_point"
  | "quarter_point"
  | "yearly_point"
  | "weekly_unique"
>;

export type ItemDetailResult = DetailResult & ItemResult;

export type Ncode = string;

export const itemKey = (ncode: Ncode) =>
  ["item", ncode.toLowerCase(), "listing"] as const;
export const itemFetcher: QueryFunction<
  ItemResult | undefined,
  ReturnType<typeof itemKey>
> = async ({ queryKey: [, ncode] }) => await itemLoader.load(ncode);

export const itemDetailKey = (ncode: Ncode) =>
  ["item", ncode.toLowerCase(), "detail"] as const;
export const itemDetailFetcher: QueryFunction<
  DetailResult | undefined,
  ReturnType<typeof itemDetailKey>
> = async ({ queryKey: [, ncode] }) => await itemDetailLoader.load(ncode);

export const itemRankingHistoryKey = (ncode: Ncode) =>
  ["item", ncode.toLowerCase(), "ranking"] as const;
export const itemRankingHistoryFetcher: QueryFunction<
  RankingHistoryResult[],
  ReturnType<typeof itemRankingHistoryKey>
> = async ({ queryKey: [, ncode] }) => await rankingHistory(ncode);

export const useItemForListing = (ncode: Ncode) => {
  const { data, isLoading, error } = useQuery({
    queryKey: itemKey(ncode),
    queryFn: itemFetcher,
  });
  return { data, isLoading, error };
};

export const useDetailForView = (ncode: Ncode) => {
  const [listing, others, ranking] = useQueries([
    {
      queryKey: itemKey(ncode),
      queryFn: itemFetcher,
    },
    {
      queryKey: itemDetailKey(ncode),
      queryFn: itemDetailFetcher,
    },
    {
      queryKey: itemRankingHistoryKey(ncode),
      queryFn: itemRankingHistoryFetcher,
    },
  ]);
  return {
    item:
      listing.data && others.data
        ? ({ ...listing.data, ...others.data } as ItemDetailResult | undefined)
        : undefined,
    ranking: ranking.data,
    isLoading: listing.isLoading || listing.isLoading || ranking.isLoading,
    error: listing.error || others.error || ranking.error,
  };
};

const itemLoader = new DataLoader<Ncode, ItemResult | undefined>(
  async (ncodes) => {
    const { values } = await search()
      .ncode(ncodes as string[])
      .limit(ncodes.length)
      .fields([
        Fields.ncode,
        Fields.title,
        Fields.userid,
        Fields.writer,
        Fields.genre,
        Fields.noveltype,
        Fields.end,
        Fields.general_firstup,
        Fields.length,
        Fields.general_all_no,
        Fields.novelupdated_at,
        Fields.general_lastup,
        Fields.keyword,
        Fields.story,
      ])
      .execute();
    return ncodes
      .map((x) => x.toLowerCase())
      .map((ncode) => values.find((x) => x.ncode.toLowerCase() === ncode));
  },
  {
    cache: false,
    maxBatchSize: 500,
  }
);

const itemDetailLoader = new DataLoader<Ncode, DetailResult | undefined>(
  async (ncodes) => {
    const { values } = await search()
      .ncode(ncodes as string[])
      .limit(ncodes.length)
      .fields([
        Fields.ncode,
        Fields.all_hyoka_cnt,
        Fields.impression_cnt,
        Fields.review_cnt,
        Fields.fav_novel_cnt,
        Fields.all_point,
        Fields.global_point,
        Fields.daily_point,
        Fields.weekly_point,
        Fields.monthly_point,
        Fields.quarter_point,
        Fields.yearly_point,
      ])
      .opt("weekly")
      .execute();
    return ncodes
      .map((x) => x.toLowerCase())
      .map((ncode) => values.find((x) => x.ncode.toLowerCase() === ncode));
  },
  {
    cache: false,
    maxBatchSize: 500,
  }
);
