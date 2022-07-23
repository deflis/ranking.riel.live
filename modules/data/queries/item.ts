import { QueryFunction, useQueries, useQuery } from "react-query";
import DataLoader from "dataloader";
import {
  Fields,
  search,
  rankingHistory,
  RankingHistoryResult,
  RankingType,
} from "narou/src/index.browser";
import { DateTime } from "luxon";
import { Detail, ItemDetail, Item, RankingHistories } from "../types";

export const itemKey = (ncode: string) =>
  ["item", ncode.toLowerCase(), "listing"] as const;
export const itemFetcher: QueryFunction<
  Item | undefined,
  ReturnType<typeof itemKey>
> = async ({ queryKey: [, ncode] }) => await itemLoader.load(ncode);

export const itemDetailKey = (ncode: string) =>
  ["item", ncode.toLowerCase(), "detail"] as const;
export const itemDetailFetcher: QueryFunction<
  Detail | undefined,
  ReturnType<typeof itemDetailKey>
> = async ({ queryKey: [, ncode] }) => await itemDetailLoader.load(ncode);

export const itemRankingHistoryKey = (ncode: string) =>
  ["item", ncode.toLowerCase(), "ranking"] as const;
export const itemRankingHistoryFetcher: QueryFunction<
  RankingHistories,
  ReturnType<typeof itemRankingHistoryKey>
> = async ({ queryKey: [, ncode] }) =>
  formatRankingHistory(await rankingHistory(ncode));

export const useItemForListing = (ncode: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: itemKey(ncode),
    queryFn: itemFetcher,
  });
  return { data, isLoading, error };
};

export const useDetailForView = (ncode: string) => {
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
        ? ({ ...listing.data, ...others.data } as ItemDetail | undefined)
        : undefined,
    ranking: ranking.data,
    isLoading: listing.isLoading || listing.isLoading || ranking.isLoading,
    error: listing.error || others.error || ranking.error,
  };
};

const itemLoader = new DataLoader<string, Item | undefined>(
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
      .map((ncode) =>
        values
          .map(
            ({
              general_firstup,
              general_lastup,
              novelupdated_at,
              ...ohters
            }) => ({
              general_firstup: parse(general_firstup),
              general_lastup: parse(general_lastup),
              novelupdated_at: parse(novelupdated_at),
              ...ohters,
            })
          )
          .find((x) => x.ncode.toLowerCase() === ncode)
      );
  },
  {
    cache: false,
    maxBatchSize: 500,
  }
);

const itemDetailLoader = new DataLoader<string, Detail | undefined>(
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

const rankingTypes = [
  RankingType.Daily,
  RankingType.Weekly,
  RankingType.Monthly,
  RankingType.Quarterly,
] as const;

const formatRankingHistory = (history: RankingHistoryResult[]) => {
  const rankingData = Object.create(null) as RankingHistories;
  for (const type of rankingTypes) {
    rankingData[type] = history
      .filter((x) => x.type === type)
      .map(({ date, pt, rank }) => ({
        date: DateTime.fromJSDate(date),
        pt,
        rank,
      }));
  }
  return rankingData;
};

const NarouDateFormat = "yyyy-MM-dd hh:mm:ss";

const parse = (date: string) =>
  DateTime.fromFormat(date, NarouDateFormat, {
    zone: "Asia/Tokyo",
  });
