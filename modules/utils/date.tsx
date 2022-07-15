import { DateTime } from "luxon";
import { RankingType as NarouRankingType } from "narou/src/index.browser";

export function formatDate(date: DateTime, type: NarouRankingType): string {
  return convertDate(date, type).toISODate();
}

export function convertDate(date: DateTime, type: NarouRankingType): DateTime {
  switch (type) {
    case NarouRankingType.Daily:
    default:
      return date.startOf("day");
    case NarouRankingType.Weekly:
      const newDate = date.startOf("week").plus({ day: 1 });
      return newDate < date ? newDate : newDate.minus({ week: -1 });
    case NarouRankingType.Monthly:
    case NarouRankingType.Quarterly:
      return date.startOf("month");
  }
}

export function addDate(
  date: DateTime,
  type: NarouRankingType,
  amount: number
): DateTime {
  switch (type) {
    case NarouRankingType.Daily:
    default:
      return date.plus({ day: amount });
    case NarouRankingType.Weekly:
      return date.plus({ week: amount });
    case NarouRankingType.Monthly:
    case NarouRankingType.Quarterly:
      return date.plus({ month: amount });
  }
}
