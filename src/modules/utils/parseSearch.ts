import { parse } from "valibot";
import type {
	CustomRankingParams,
	R18RankingParams,
} from "../interfaces/CustomRankingParams";
import { RankingType } from "../interfaces/RankingType";
import {
	type CustomRankingSearchInput,
	CustomRankingSearchSchema,
	type R18RankingSearchInput,
	R18RankingSearchSchema,
} from "../validations/ranking";

/**
 * Validates and converts search parameters using Valibot schemas.
 * This can replace manual parsing logic.
 */
export const parseCustomRankingParams = (
	type: string | undefined,
	search: CustomRankingSearchInput,
): CustomRankingParams => {
	const rankingType = (type ?? RankingType.Daily) as RankingType;
	const result = parse(CustomRankingSearchSchema, search);

	// Map snake_case result to camelCase CustomRankingParams
	// Using ! assertion or ?? default to satisfy TS if it thinks fallback might fail (it shouldn't).
	// Or maybe the inferred type of fallback() includes undefined in this version?
	// Let's use ?? to be safe and satisfy TS.
	return {
		keyword: result.keyword,
		notKeyword: result.not_keyword,
		byTitle: result.by_title ?? false,
		byStory: result.by_story ?? false,
		genres: result.genres ?? [],
		min: result.min,
		max: result.max,
		firstUpdate: result.first_update,
		rensai: result.rensai ?? true,
		kanketsu: result.kanketsu ?? true,
		tanpen: result.tanpen ?? true,
		rankingType,
	};
};

export const parseR18RankingParams = (
	type: string | undefined,
	search: R18RankingSearchInput,
): R18RankingParams => {
	const rankingType = (type ?? RankingType.Daily) as RankingType;
	const result = parse(R18RankingSearchSchema, search);

	return {
		keyword: result.keyword,
		notKeyword: result.not_keyword,
		byTitle: result.by_title ?? false,
		byStory: result.by_story ?? false,
		sites: result.sites ?? [],
		min: result.min,
		max: result.max,
		firstUpdate: result.first_update,
		rensai: result.rensai ?? true,
		kanketsu: result.kanketsu ?? true,
		tanpen: result.tanpen ?? true,
		rankingType,
	};
};
