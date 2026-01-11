import { parse } from "valibot";
import type {
	CustomRankingParams,
	R18RankingParams,
} from "../interfaces/CustomRankingParams";
import { RankingType } from "../interfaces/RankingType";
import {
	CustomRankingSearchSchema,
	R18RankingSearchSchema,
} from "../validations/ranking";

/**
 * Validates and converts search parameters using Valibot schemas.
 * This can replace manual parsing logic.
 */
export const parseCustomRankingParams = (
	type: string | undefined,
	search: unknown,
): CustomRankingParams => {
	const rankingType = (type ?? RankingType.Daily) as RankingType;
	// Use safe parsing or standard parsing. Since we want to ensure valid types, parse is fine.
	// If validation fails, it throws. If that's acceptable, we proceed.
	// Given the previous code didn't really throw but used defaults, we might want to handle errors if strictly needed,
	// but the schema uses fallbacks so it should be robust.
	const result = parse(CustomRankingSearchSchema, search);

	// Map snake_case result to camelCase CustomRankingParams
	return {
		keyword: result.keyword,
		notKeyword: result.not_keyword,
		byTitle: result.by_title,
		byStory: result.by_story,
		genres: result.genres,
		min: result.min,
		max: result.max,
		firstUpdate: result.first_update,
		rensai: result.rensai,
		kanketsu: result.kanketsu,
		tanpen: result.tanpen,
		rankingType,
	};
};

export const parseR18RankingParams = (
	type: string | undefined,
	search: unknown,
): R18RankingParams => {
	const rankingType = (type ?? RankingType.Daily) as RankingType;
	const result = parse(R18RankingSearchSchema, search);

	return {
		keyword: result.keyword,
		notKeyword: result.not_keyword,
		byTitle: result.by_title,
		byStory: result.by_story,
		sites: result.sites,
		min: result.min,
		max: result.max,
		firstUpdate: result.first_update,
		rensai: result.rensai,
		kanketsu: result.kanketsu,
		tanpen: result.tanpen,
		rankingType,
	};
};
