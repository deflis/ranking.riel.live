import { DateTime } from "luxon";
import { RankingType as NarouRankingType } from "narou";

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
