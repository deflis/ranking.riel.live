import { R18Site } from "narou/src/index.browser";
import { RankingType } from "./RankingType";
import { Except } from "type-fest";

export interface CustomRankingParams {
  keyword?: string;
  notKeyword?: string;
  byTitle: boolean;
  byStory: boolean;
  genres: number[];
  min?: number;
  max?: number;
  firstUpdate?: Date;
  rensai: boolean;
  kanketsu: boolean;
  tanpen: boolean;
  rankingType: RankingType;
}

export type R18RankingParams = Except<CustomRankingParams, "genres"> & {
  sites: R18Site[];
};
