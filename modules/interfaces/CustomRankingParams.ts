import { Genre, R18Site } from "narou/src/index.browser";
import { RankingType } from "./RankingType";
import { Except } from "type-fest";
import { DateTime } from "luxon";

export interface CustomRankingParams {
  keyword?: string;
  notKeyword?: string;
  byTitle: boolean;
  byStory: boolean;
  genres: Genre[];
  min?: number;
  max?: number;
  firstUpdate?: string;
  rensai: boolean;
  kanketsu: boolean;
  tanpen: boolean;
  rankingType: RankingType;
}

export type R18RankingParams = Except<CustomRankingParams, "genres"> & {
  sites: R18Site[];
};
