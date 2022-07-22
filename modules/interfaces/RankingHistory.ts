import { RankingType } from "narou/src/index.browser";
import { DateTime } from "luxon";

export type RankingHistories = {
  [type in RankingType]: RankingHistoryItem[];
};

export interface RankingHistoryItem {
  date: DateTime;
  pt: number;
  rank: number;
}
