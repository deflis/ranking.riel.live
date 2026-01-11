import { Order, PickedNarouSearchResult } from "narou";

import { RankingType } from "../../interfaces/RankingType";

export function convertOrder(type: RankingType): Order {
  switch (type) {
    case RankingType.Daily:
      return Order.DailyPoint;
    case RankingType.Weekly:
      return Order.WeeklyPoint;
    case RankingType.Monthly:
      return Order.MonthlyPoint;
    case RankingType.Quarter:
      return Order.QuarterPoint;
    case RankingType.Yearly:
      return Order.YearlyPoint;
    case RankingType.All:
      return Order.HyokaDesc;
    case RankingType.UniqueUser:
      return Order.Weekly;
  }
}

export type RankingData = { ncode: string; rank: number; pt: number };

type SearchResult = PickedNarouSearchResult<
  | "ncode"
  | "daily_point"
  | "weekly_point"
  | "monthly_point"
  | "quarter_point"
  | "yearly_point"
  | "all_hyoka_cnt"
  | "weekly_unique"
>;

export function formatCustomRankingRaw(
  type: RankingType,
  searchResult: readonly SearchResult[],
  start = 0
): RankingData[] {
  return searchResult.map((value, index) => {
    return {
      ncode: value.ncode,
      rank: index + start + 1,
      pt: point(type, value),
    };
  });
}

function point(type: RankingType, value: SearchResult) {
  switch (type) {
    case RankingType.Daily:
      return value.daily_point;
    case RankingType.Weekly:
      return value.weekly_point;
    case RankingType.Monthly:
      return value.monthly_point;
    case RankingType.Quarter:
      return value.quarter_point;
    case RankingType.Yearly:
      return value.yearly_point;
    case RankingType.All:
      return value.all_hyoka_cnt;
    case RankingType.UniqueUser:
      return value.weekly_unique;
  }
}
export const fetchOptions = {
  headers: {
    "User-Agent": "RankingRielLive/1.0 (https://ranking.riel.live/)",
  },
} satisfies RequestInit;
