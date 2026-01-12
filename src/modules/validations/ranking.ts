import { type Genre, R18Site } from "narou";
import {
	type InferInput,
	type InferOutput,
	array,
	boolean,
	fallback,
	literal,
	number,
	object,
	optional,
	pipe,
	string,
	transform,
	union,
} from "valibot";
import { allGenres } from "../enum/Genre";
import { RankingType } from "../interfaces/RankingType";

// Helper to convert input to string
const stringParams = pipe(
	union([string(), number()]),
	transform((input) => String(input)),
);

// Helper for boolean flags (handles "0", "1", 0, 1, boolean, "false", "true")
const booleanParams = pipe(
	union([string(), number(), boolean()]),
	transform((input) => {
		if (input === "0" || input === 0 || input === false || input === "false")
			return false;
		return true;
	}),
);

// Helper for numbers
const numberParams = pipe(
	union([string(), number()]),
	transform((input) => Number(input)),
	number(),
);

const safeNumberParams = pipe(
	union([string(), number()]),
	transform((input) => {
		const num = Number(input);
		return Number.isNaN(num) ? undefined : num;
	}),
);

// Genres parsing
const genresSchema = pipe(
	union([string(), number(), array(number())]), // accept string, single number, or array of numbers (idempotent)
	transform((input) => {
		if (Array.isArray(input)) return input as Genre[];
		const str = String(input);
		if (!str) return [];
		return str
			.split(",")
			.map((x) => Number.parseInt(x, 10))
			.filter((x) => (allGenres as unknown as number[]).includes(x)) as Genre[];
	}),
);

// Sites parsing
const allSites = [
	R18Site.Nocturne,
	R18Site.MoonLight,
	R18Site.MoonLightBL,
	R18Site.Midnight,
];

const sitesSchema = pipe(
	union([string(), number(), array(number())]), // accept string, single number, or array of numbers
	transform((input) => {
		if (Array.isArray(input)) return input as R18Site[];
		const str = String(input);
		if (!str) return [];
		return str
			.split(",")
			.map((x) => Number.parseInt(x, 10))
			.filter((x) =>
				(allSites as unknown as number[]).includes(x),
			) as R18Site[];
	}),
);

export const CustomRankingSearchSchema = object({
	keyword: optional(stringParams),
	not_keyword: optional(stringParams),
	by_title: fallback(optional(booleanParams), false), // Default false
	by_story: fallback(optional(booleanParams), false), // Default false
	genres: fallback(optional(genresSchema), []),
	min: optional(safeNumberParams),
	max: optional(safeNumberParams),
	first_update: optional(stringParams),
	rensai: fallback(optional(booleanParams), true), // Default true
	kanketsu: fallback(optional(booleanParams), true), // Default true
	tanpen: fallback(optional(booleanParams), true), // Default true
});

export type CustomRankingSearchInput = InferInput<
	typeof CustomRankingSearchSchema
>;
export type CustomRankingSearchOutput = InferOutput<
	typeof CustomRankingSearchSchema
>;

export const R18RankingSearchSchema = object({
	keyword: optional(stringParams),
	not_keyword: optional(stringParams),
	by_title: fallback(optional(booleanParams), false),
	by_story: fallback(optional(booleanParams), false),
	sites: fallback(optional(sitesSchema), []),
	min: optional(safeNumberParams),
	max: optional(safeNumberParams),
	first_update: optional(stringParams),
	rensai: fallback(optional(booleanParams), true),
	kanketsu: fallback(optional(booleanParams), true),
	tanpen: fallback(optional(booleanParams), true),
});

export type R18RankingSearchInput = InferInput<typeof R18RankingSearchSchema>;
export type R18RankingSearchOutput = InferOutput<typeof R18RankingSearchSchema>;
