import { RankingType } from "narou/src/index.browser";

export type RankingHistories = {
  [type in RankingType]: RankingHistoryItem[];
};

export interface RankingHistoryItem {
  date: string;
  pt: number;
  rank: number;
}
