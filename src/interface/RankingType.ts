export enum RankingType {
  Daily = "d",
  Weekly = "w",
  Monthly = "m",
  Quarter = "q",
  Yearly = "y",
  All = "a"
}

export const RankingTypeName = new Map([
  [RankingType.Daily, "日間"],
  [RankingType.Weekly, "週間"],
  [RankingType.Monthly, "月間"],
  [RankingType.Quarter, "四半期"],
  [RankingType.Yearly, "年間"],
  [RankingType.All, "全期間"]
]);
