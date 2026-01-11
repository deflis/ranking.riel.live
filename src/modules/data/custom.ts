import {
	type QueryClient,
	type QueryFunction,
	keepPreviousData,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import type { DateTime } from "luxon";
import {
	Fields,
	Genre,
	type NarouSearchResult,
	type NarouSearchResults,
	NovelTypeParam,
	type PickedNarouSearchResult,
	search,
} from "narou";
import { useCallback } from "react";
import { createServerFn } from "@tanstack/react-start";

import { parseDateRange } from "../atoms/filter";
import { allGenres } from "../enum/Genre";
import type { CustomRankingParams } from "../interfaces/CustomRankingParams";
import { RankingType } from "../interfaces/RankingType";
import { parse } from "../utils/NarouDateFormat";

import {
	type RankingData,
	convertOrder,
	formatCustomRankingRaw,
} from "./custom/utils";
import { fetchOptions } from "./custom/utils";
import { prefetchRankingDetail } from "./prefetch";
import { cacheMiddleware } from "../utils/cacheMiddleware";

const PAGE_ITEM_NUM = 10 as const;
const CHUNK_ITEM_NUM = 100 as const;

export const useCustomRanking = (params: CustomRankingParams, page: number) => {
	const queryClient = useQueryClient();

	const { isPending, data } = useQuery({
		queryKey: [params, page],
		queryFn: useCallback(getCustomRankingQueryFn(params, queryClient), [
			params,
		]),
		placeholderData: keepPreviousData,
	});
	return { isPending, data };
};

export const prefetchCustomRanking = async (
	queryClient: QueryClient,
	params: CustomRankingParams,
	page: number,
) => {
	await queryClient.prefetchQuery({
		queryKey: [params, page],
		queryFn: getCustomRankingQueryFn(params, queryClient),
	});
	const ranking = queryClient.getQueryData<RankingData[]>([params, page]);
	await prefetchRankingDetail(queryClient, ranking?.map((x) => x.ncode) ?? []);
};

const getCustomRankingQueryFn = (
	params: CustomRankingParams,
	queryClient: QueryClient,
): QueryFunction<RankingData[], readonly [CustomRankingParams, number]> => {
	const filterBuilder = new FilterBuilder();
	const firstUpdate = parseDateRange(params.firstUpdate);
	if (params.max) filterBuilder.setMaxNo(params.max);
	if (params.min) filterBuilder.setMinNo(params.min);
	if (firstUpdate) filterBuilder.setFirstUpdate(firstUpdate);
	if (!params.tanpen) filterBuilder.disableTanpen();
	if (!params.kanketsu) filterBuilder.disableKanketsu();
	if (!params.rensai) filterBuilder.disableRensai();
	const filter = filterBuilder.create();
	const fields = filterBuilder.fields();

	return async ({ queryKey: [params, page] }) => {
		const values: PickedNarouSearchResult<CustomRankingResultKeyNames>[] = [];
		let fetchPage = 0;
		while (values.length < page * CHUNK_ITEM_NUM) {
			const result = await queryClient.fetchQuery({
				queryKey: customRankingKey(params, fields, fetchPage),
				queryFn: customRankingFetcher,
			});
			const resultValues = result.values.filter(filter);
			values.push(...resultValues);
			fetchPage++;
			if (result.allcount < fetchPage * CHUNK_ITEM_NUM) {
				break;
			}
		}
		return formatCustomRankingRaw(params.rankingType, values).slice(
			(page - 1) * PAGE_ITEM_NUM,
			page * PAGE_ITEM_NUM,
		);
	};
};

type CustomRankingResultKeyNames =
	| "ncode"
	| "general_all_no"
	| "general_firstup"
	| "noveltype"
	| "end"
	| "daily_point"
	| "weekly_point"
	| "monthly_point"
	| "quarter_point"
	| "yearly_point"
	| "all_hyoka_cnt"
	| "weekly_unique";

const customRankingKey = (
	params: CustomRankingParams,
	fields: Fields[],
	page: number,
) => {
	const {
		rankingType,
		keyword,
		notKeyword,
		byTitle,
		byStory,
		rensai,
		kanketsu,
		tanpen,
		genres,
		firstUpdate,
	} = params;
	let novelTypeParam: NovelTypeParam | null = null;
	if (!tanpen) {
		novelTypeParam = NovelTypeParam.Rensai;
	}
	if (!rensai) {
		if (!tanpen) {
			novelTypeParam = NovelTypeParam.RensaiEnd;
		} else {
			novelTypeParam = NovelTypeParam.ShortAndRensai;
		}
	}
	if (!kanketsu) {
		if (!tanpen) {
			novelTypeParam = NovelTypeParam.RensaiNow;
		}
	}
	let newFields: Fields[] = [Fields.ncode];
	let optionalFields: "weekly"[] = [];
	switch (rankingType) {
		case RankingType.Daily:
			newFields = [Fields.ncode, Fields.daily_point];
			optionalFields = [];
			break;
		case RankingType.Weekly:
			newFields = [Fields.ncode, Fields.weekly_point];
			optionalFields = [];
			break;
		case RankingType.Monthly:
			newFields = [Fields.ncode, Fields.monthly_point];
			optionalFields = [];
			break;
		case RankingType.Quarter:
			newFields = [Fields.ncode, Fields.quarter_point];
			optionalFields = [];
			break;
		case RankingType.Yearly:
			newFields = [Fields.ncode, Fields.yearly_point];
			optionalFields = [];
			break;
		case RankingType.All:
			newFields = [Fields.ncode, Fields.all_hyoka_cnt];
			optionalFields = [];
			break;
		case RankingType.UniqueUser:
			newFields = [Fields.ncode];
			optionalFields = ["weekly"];
			break;
	}
	return [
		"custom",
		convertOrder(rankingType),
		keyword,
		notKeyword,
		byTitle,
		byStory,
		parseDateRange(firstUpdate)?.toISO(),
		genres.length === 0 ? allGenres : genres,
		novelTypeParam,
		[...fields, ...newFields] as const,
		optionalFields,
		page,
	] as const;
};
type CustomRankingKey = ReturnType<typeof customRankingKey>;

type NarouCustomRankingSearchResults = NarouSearchResults<
	NarouSearchResult,
	CustomRankingResultKeyNames
>;
type CustomRankingServerParams = {
	order: ReturnType<typeof convertOrder>;
	keyword: string | undefined;
	notKeyword: string | undefined;
	byTitle: boolean;
	byStory: boolean;
	firstUpdate?: string | null;
	genres: readonly Genre[];
	novelTypeParam: NovelTypeParam | null;
	fields: readonly Fields[];
	optionalFields: "weekly"[];
	page: number;
};
const customRankingServerFn = createServerFn({ method: "GET" })
  .middleware([cacheMiddleware()])
	.inputValidator((data: CustomRankingServerParams) => data)
	.handler(
		async ({
			data: {
				order,
				keyword,
				notKeyword,
				byTitle,
				byStory,
				firstUpdate,
				genres,
				novelTypeParam,
				fields,
				optionalFields,
				page,
			},
		}) => {
			const firstUpdateDate = firstUpdate ? new Date(firstUpdate) : null;
			const searchBuilder = search()
				.order(order)
				.page(page, CHUNK_ITEM_NUM)
				.fields([
					Fields.ncode,
					Fields.general_all_no,
					Fields.general_firstup,
					Fields.noveltype,
					Fields.end,
					Fields.daily_point,
					Fields.weekly_point,
					Fields.monthly_point,
					Fields.monthly_point,
					Fields.quarter_point,
					Fields.yearly_point,
					Fields.all_hyoka_cnt,
				])
				.opt("weekly");

			searchBuilder.fields(fields);
			searchBuilder.opt(optionalFields);

			if (genres.length > 0) {
				searchBuilder.genre(genres);
			}
			if (keyword) {
				searchBuilder.word(keyword).byKeyword(true);
			}
			if (notKeyword) {
				searchBuilder.notWord(notKeyword).byKeyword(true);
			}
			if (byTitle) {
				searchBuilder.byTitle(byTitle);
			}
			if (byStory) {
				searchBuilder.byOutline();
			}
			if (firstUpdateDate) {
				// firstUpdateが指定されているということは最終更新日はfirstUpdateよりも新しいので、lastUpdateにfirstUpdateを指定する
				searchBuilder.lastUpdate(firstUpdateDate, new Date());
			}
			if (novelTypeParam) {
				searchBuilder.type(novelTypeParam);
			}
			const result = await searchBuilder.execute({ fetchOptions });
			return {
				allcount: result.allcount,
				limit: result.limit,
				start: result.start,
				page: result.page,
				length: result.length,
				values: result.values,
			};
		},
	);
const customRankingFetcher: QueryFunction<
	NarouCustomRankingSearchResults,
	CustomRankingKey
> = async ({
	queryKey: [
		,
		order,
		keyword,
		notKeyword,
		byTitle,
		byStory,
		firstUpdate,
		genres,
		novelTypeParam,
		fields,
		optionalFields,
		page,
	],
}) => {
	return await customRankingServerFn({
		data: {
			order,
			keyword,
			notKeyword,
			byTitle,
			byStory,
			firstUpdate,
			genres,
			novelTypeParam,
			fields,
			optionalFields,
			page,
		},
	});
};
export class FilterBuilder<
	T extends PickedNarouSearchResult<
		"general_all_no" | "general_firstup" | "noveltype" | "end"
	>,
> {
	private maxNo?: number;
	private minNo?: number;
	private firstUpdate?: DateTime;
	private tanpen = true;
	private rensai = true;
	private kanketsu = true;

	private execute(item: T): boolean {
		if (this.maxNo && item.general_all_no > this.maxNo) {
			return false;
		}
		if (this.minNo && item.general_all_no < this.minNo) {
			return false;
		}
		if (this.firstUpdate) {
			const parsedDate = parse(item.general_firstup);
			if (parsedDate && parsedDate < this.firstUpdate) {
				return false;
			}
		}
		switch (item.noveltype) {
			case 1:
				switch (item.end) {
					case 1:
						return this.rensai;
					default:
					case 0:
						return this.kanketsu;
				}
			default:
			case 2:
				return this.tanpen;
		}
	}

	fields(): Fields[] {
		const fields = new Set<Fields>();
		if (this.maxNo || this.minNo) {
			fields.add(Fields.general_all_no);
		}
		if (this.firstUpdate) {
			fields.add(Fields.general_firstup);
		}
		if (this.rensai || this.kanketsu) {
			fields.add(Fields.noveltype);
			fields.add(Fields.end);
		}
		if (this.tanpen) {
			fields.add(Fields.noveltype);
		}
		return Array.from(fields);
	}

	setMaxNo(maxNo: number) {
		this.maxNo = maxNo;
	}
	setMinNo(minNo: number) {
		this.minNo = minNo;
	}
	setFirstUpdate(firstUpdate: DateTime) {
		this.firstUpdate = firstUpdate;
	}
	disableTanpen() {
		this.tanpen = false;
	}
	disableRensai() {
		this.rensai = false;
	}
	disableKanketsu() {
		this.kanketsu = false;
	}

	create(): (item: T) => boolean {
		return (item) => this.execute(item);
	}
}
