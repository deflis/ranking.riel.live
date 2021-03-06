import {
  addDays,
  addMonths,
  formatISO,
  getDay,
  setDay,
  startOfMonth,
} from "date-fns";
import { RankingResult } from "narou";
import useSWR from "swr";

import { RankingType } from "../interface/RankingType";
import { fetcher } from "../util/fetcher";

export function formatDate(date: Date, type: RankingType): string {
  return formatISO(convertDate(date, type), { representation: "date" });
}

export function convertDate(date: Date, type: RankingType): Date {
  switch (type) {
    case RankingType.Daily:
    default:
      return date;
    case RankingType.Weekly:
      return addDays(setDay(date, 2), getDay(date) < 2 ? -7 : 0);
    case RankingType.Monthly:
    case RankingType.Quarter:
      return startOfMonth(date);
  }
}

export function addDate(date: Date, type: RankingType, amount: number): Date {
  switch (type) {
    case RankingType.Daily:
    default:
      return addDays(date, amount);
    case RankingType.Weekly:
      return addDays(date, amount * 7);
    case RankingType.Monthly:
    case RankingType.Quarter:
      return addMonths(date, amount);
  }
}

export function useRanking(type: RankingType, date: Date) {
  const { data, error } = useSWR<RankingResult[]>(
    `/_api/ranking/${type}/${formatDate(date, type)}`,
    fetcher
  );
  const loading = !data;
  const ranking = data ?? [];
  if (error) {
    throw error;
  }

  return { ranking, loading };
}

export default useRanking;
