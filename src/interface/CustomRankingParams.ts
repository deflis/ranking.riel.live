import { RankingType } from './RankingType';

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