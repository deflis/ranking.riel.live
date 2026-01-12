import type { PickedNarouSearchResult, RankingType } from "narou";

type ResultConvertDate<T, TDateProps extends keyof T> = Omit<T, TDateProps> & {
	[key in TDateProps]: string;
};

export type Item = ResultConvertDate<
	PickedNarouSearchResult<
		| "ncode"
		| "title"
		| "userid"
		| "writer"
		| "genre"
		| "noveltype"
		| "end"
		| "general_firstup"
		| "length"
		| "general_all_no"
		| "novelupdated_at"
		| "general_lastup"
		| "keyword"
		| "story"
	>,
	"general_firstup" | "general_lastup" | "novelupdated_at"
>;

export type Detail = PickedNarouSearchResult<
	| "all_hyoka_cnt"
	| "impression_cnt"
	| "review_cnt"
	| "fav_novel_cnt"
	| "all_point"
	| "global_point"
	| "daily_point"
	| "weekly_point"
	| "monthly_point"
	| "quarter_point"
	| "yearly_point"
	| "weekly_unique"
>;

export type ItemDetail = Detail & Item;

export type NocItem = ResultConvertDate<
	PickedNarouSearchResult<
		| "ncode"
		| "title"
		| "userid"
		| "writer"
		| "nocgenre"
		| "noveltype"
		| "end"
		| "general_firstup"
		| "length"
		| "general_all_no"
		| "novelupdated_at"
		| "general_lastup"
		| "keyword"
		| "story"
	>,
	"general_firstup" | "general_lastup" | "novelupdated_at"
>;

export type NocDetail = PickedNarouSearchResult<
	| "all_hyoka_cnt"
	| "impression_cnt"
	| "review_cnt"
	| "fav_novel_cnt"
	| "all_point"
	| "global_point"
	| "daily_point"
	| "weekly_point"
	| "monthly_point"
	| "quarter_point"
	| "yearly_point"
	| "weekly_unique"
>;

export type NocItemDetail = NocDetail & NocItem;

export type RankingHistories = {
	[type in RankingType]: RankingHistoryItem[];
};

export interface RankingHistoryItem {
	date: string;
	pt: number;
	rank: number;
}
