import { RankingType } from "narou";

export type RankingHistories = {
  [type in RankingType]: RankingHistoryItem[];
};

export interface RankingHistoryItem {
  date: string;
  pt: number;
  rank: number;
}
