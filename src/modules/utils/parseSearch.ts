import { type Genre, R18Site } from "narou";
import { allGenres } from "../enum/Genre";
import type {
	CustomRankingParams,
	R18RankingParams,
} from "../interfaces/CustomRankingParams";
import { RankingType } from "../interfaces/RankingType";

export const parseBoolean = (
	str: string | undefined,
	defaultValue: boolean,
): boolean => {
	const num = parseIntSafe(str);
	return num === undefined ? defaultValue : num !== 0;
};

export const parseIntSafe = (
	str: string | number | undefined,
): number | undefined => {
	if (str === undefined || str === "") {
		return undefined;
	}
	const num = Number.parseInt(String(str), 10);
	if (Number.isNaN(num)) {
		return undefined;
	}
	return num;
}

export const parseString = (
	str: string | number | undefined,
): string | undefined => {
	return str !== undefined ? String(str) : undefined;
};

const allSites = [
	R18Site.Nocturne,
	R18Site.MoonLight,
	R18Site.MoonLightBL,
	R18Site.Midnight,
];

export const parseGenres = (
	rawGenres: string | number | number[] | undefined,
): Genre[] => {
	if (Array.isArray(rawGenres)) {
		return rawGenres.filter((x) => allGenres.includes(x as Genre)) as Genre[];
	}
	return String(rawGenres ?? "")
		.split(",")
		.map((x) => Number.parseInt(x, 10) as Genre)
		.filter((x) => allGenres.includes(x));
};

export const parseSites = (
	rawSites: string | number | number[] | undefined,
): R18Site[] => {
	if (Array.isArray(rawSites)) {
		return rawSites.filter((x) => allSites.includes(x as R18Site)) as R18Site[];
	}
	return String(rawSites ?? "")
		.split(",")
		.map((x) => Number.parseInt(x, 10) as R18Site)
		.filter((x) => allSites.includes(x));
};

export const parseCustomRankingParams = (
	type: string | undefined,
	search: {
		keyword?: string;
		not_keyword?: string;
		by_title?: string;
		by_story?: string;
		genres?: string;
		min?: string;
		max?: string;
		first_update?: string;
		rensai?: string;
		kanketsu?: string;
		tanpen?: string;
	},
): CustomRankingParams => {
	const rankingType = (type ?? RankingType.Daily) as RankingType;
	return {
		keyword: parseString(search.keyword),
		notKeyword: parseString(search.not_keyword),
		byStory: parseBoolean(search.by_story, false),
		byTitle: parseBoolean(search.by_title, false),
		genres: parseGenres(search.genres),
		max: parseIntSafe(search.max),
		min: parseIntSafe(search.min),
		firstUpdate: search.first_update,
		rensai: parseBoolean(search.rensai, true),
		kanketsu: parseBoolean(search.kanketsu, true),
		tanpen: parseBoolean(search.tanpen, true),
		rankingType,
	};
};

export const parseR18RankingParams = (
	type: string | undefined,
	search: {
		keyword?: string;
		not_keyword?: string;
		by_title?: string;
		by_story?: string;
		sites?: string;
		min?: string;
		max?: string;
		first_update?: string;
		rensai?: string;
		kanketsu?: string;
		tanpen?: string;
	},
): R18RankingParams => {
	const rankingType = (type ?? RankingType.Daily) as RankingType;
	return {
		keyword: parseString(search.keyword),
		notKeyword: parseString(search.not_keyword),
		byStory: parseBoolean(search.by_story, false),
		byTitle: parseBoolean(search.by_title, false),
		sites: parseSites(search.sites),
		max: parseIntSafe(search.max),
		min: parseIntSafe(search.min),
		firstUpdate: search.first_update,
		rensai: parseBoolean(search.rensai, true),
		kanketsu: parseBoolean(search.kanketsu, true),
		tanpen: parseBoolean(search.tanpen, true),
		rankingType,
	};
};

function arrayFormat<T>(item: T[] | undefined): T | T[] | undefined {
	if (!item || item.length === 0) {
		return undefined;
	}
	if (item.length === 1) {
		return item[0];
	}
	return item;
}

function stringFormat(string: string | undefined): string | undefined {
	if (!string || string.length === 0) {
		return undefined;
	}
	return String(string);
}

function booleanFormat(value: boolean | undefined, defaultValue: boolean): number | undefined {
	if (value === undefined || value === defaultValue) {
		return undefined;
	}
	return value ? 1 : 0;
}

export const buildCustomRankingSearch = (
	params: Partial<Exclude<CustomRankingParams, "rankingType">>,
): Record<string, unknown> => {
	return {
		keyword: stringFormat(params.keyword),
		not_keyword: stringFormat(params.notKeyword),
		by_story: booleanFormat(params.byStory ?? false, false), // デフォルトfalse
		by_title: booleanFormat(params.byTitle ?? false, false), // デフォルトfalse
		genres: arrayFormat(params.genres),
		max: params.max ?? undefined,
		min: params.min ?? undefined,
		first_update: params.firstUpdate ?? undefined,
		rensai: booleanFormat(params.rensai ?? true, true), // デフォルトtrue
		kanketsu: booleanFormat(params.kanketsu ?? true, true), // デフォルトtrue
		tanpen: booleanFormat(params.tanpen ?? true, true), // デフォルトtrue
	};
};

export const buildR18RankingSearch = (
	params: Partial<Exclude<R18RankingParams, "rankingType">>,
): Record<string, unknown> => {
	return {
		keyword: stringFormat(params.keyword),
		not_keyword: stringFormat(params.notKeyword),
		by_story: booleanFormat(params.byStory ?? false, false), // デフォルトfalse
		by_title: booleanFormat(params.byTitle ?? false, false), // デフォルトfalse
		sites: arrayFormat(params.sites),
		max: params.max ?? undefined,
		min: params.min ?? undefined,
		first_update: params.firstUpdate ?? undefined,
		rensai: booleanFormat(params.rensai ?? true, true), // デフォルトtrue
		kanketsu: booleanFormat(params.kanketsu ?? true, true), // デフォルトtrue
		tanpen: booleanFormat(params.tanpen ?? true, true), // デフォルトtrue
	};
};
