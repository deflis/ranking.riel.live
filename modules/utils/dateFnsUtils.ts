import {
  addDays,
  addMonths,
  formatISO,
  getDay,
  setDay,
  startOfMonth,
} from "date-fns";
import { RankingType as NarouRankingType } from "narou";

export function formatDate(date: Date, type: NarouRankingType): string {
  return formatISO(convertDate(date, type), { representation: "date" });
}

export function convertDate(date: Date, type: NarouRankingType): Date {
  switch (type) {
    case NarouRankingType.Daily:
    default:
      return date;
    case NarouRankingType.Weekly:
      return addDays(setDay(date, 2), getDay(date) < 2 ? -7 : 0);
    case NarouRankingType.Monthly:
    case NarouRankingType.Quarterly:
      return startOfMonth(date);
  }
}

export function addDate(
  date: Date,
  type: NarouRankingType,
  amount: number
): Date {
  switch (type) {
    case NarouRankingType.Daily:
    default:
      return addDays(date, amount);
    case NarouRankingType.Weekly:
      return addDays(date, amount * 7);
    case NarouRankingType.Monthly:
    case NarouRankingType.Quarterly:
      return addMonths(date, amount);
  }
}
