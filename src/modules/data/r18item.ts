import { QueryFunction, useQueries, useQuery } from "@tanstack/react-query";
import DataLoader from "dataloader";
import { searchR18, R18Fields } from "narou";

import { parseDate } from "../utils/date";

import { NocDetail, NocItem } from "./types";

export const itemKey = (ncode: string) =>
  ["item", ncode.toLowerCase(), "listing"] as const;
export const itemFetcher: QueryFunction<
  NocItem | undefined,
  ReturnType<typeof itemKey>
> = async ({ queryKey: [, ncode] }) => await itemLoader.load(ncode);

export const itemDetailKey = (ncode: string) =>
  ["item", ncode.toLowerCase(), "detail"] as const;
export const itemDetailFetcher: QueryFunction<
  NocDetail | undefined,
  ReturnType<typeof itemDetailKey>
> = async ({ queryKey: [, ncode] }) => await itemDetailLoader.load(ncode);

export const useR18ItemForListing = (ncode: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: itemKey(ncode),
    queryFn: itemFetcher,
  });
  return { data, isLoading, error };
};

export const useR18DetailForView = (ncode: string) => {
  const [listing, others] = useQueries({
    queries: [
      {
        queryKey: itemKey(ncode),
        queryFn: itemFetcher,
      },
      {
        queryKey: itemDetailKey(ncode),
        queryFn: itemDetailFetcher,
      },
    ],
  });
  return {
    item: listing.data,
    detail: others.data,
    isLoading: listing.isLoading || listing.isLoading,
    error: listing.error || others.error,
  };
};

const itemLoader = new DataLoader<string, NocItem | undefined>(
  async (ncodes) => {
    const { values } = await searchR18()
      .ncode(ncodes)
      .limit(ncodes.length)
      .fields([
        R18Fields.ncode,
        R18Fields.title,
        R18Fields.userid,
        R18Fields.writer,
        R18Fields.nocgenre,
        R18Fields.noveltype,
        R18Fields.end,
        R18Fields.general_firstup,
        R18Fields.length,
        R18Fields.general_all_no,
        R18Fields.novelupdated_at,
        R18Fields.general_lastup,
        R18Fields.keyword,
        R18Fields.story,
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
              ...others
            }) => ({
              general_firstup: parseDate(general_firstup),
              general_lastup: parseDate(general_lastup),
              novelupdated_at: parseDate(novelupdated_at),
              ...others,
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

const itemDetailLoader = new DataLoader<string, NocDetail | undefined>(
  async (ncodes) => {
    const { values } = await searchR18()
      .ncode(ncodes)
      .limit(ncodes.length)
      .fields([
        R18Fields.ncode,
        R18Fields.all_hyoka_cnt,
        R18Fields.impression_cnt,
        R18Fields.review_cnt,
        R18Fields.fav_novel_cnt,
        R18Fields.all_point,
        R18Fields.global_point,
        R18Fields.daily_point,
        R18Fields.weekly_point,
        R18Fields.monthly_point,
        R18Fields.quarter_point,
        R18Fields.yearly_point,
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
