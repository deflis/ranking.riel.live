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
	return str === undefined ? defaultValue : str !== "0";
};

export const parseIntSafe = (str: string | undefined): number | undefined => {
	return str !== undefined ? Number.parseInt(str, 10) : undefined;
};

const allSites = [
	R18Site.Nocturne,
	R18Site.MoonLight,
	R18Site.MoonLightBL,
	R18Site.Midnight,
];

export const parseGenres = (rawGenres: string | undefined): Genre[] => {
	return (rawGenres ?? "")
		.split(",")
		.map((x) => Number.parseInt(x, 10) as Genre)
		.filter((x) => allGenres.includes(x));
};

export const parseSites = (rawSites: string | undefined): R18Site[] => {
	return (rawSites ?? "")
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
		keyword: search.keyword,
		notKeyword: search.not_keyword,
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
		keyword: search.keyword,
		notKeyword: search.not_keyword,
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
