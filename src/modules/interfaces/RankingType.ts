export const RankingType = {
	Daily: "d",
	Weekly: "w",
	Monthly: "m",
	Quarter: "q",
	Yearly: "y",
	All: "a",
	UniqueUser: "u",
} as const;
export type RankingType = (typeof RankingType)[keyof typeof RankingType];

export const RankingTypeName = {
	[RankingType.Daily]: "日間",
	[RankingType.Weekly]: "週間",
	[RankingType.Monthly]: "月間",
	[RankingType.Quarter]: "四半期",
	[RankingType.Yearly]: "年間",
	[RankingType.All]: "全期間",
	[RankingType.UniqueUser]: "週間ユニークユーザー数",
} as const;
