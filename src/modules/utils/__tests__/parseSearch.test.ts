import { type Genre, R18Site } from "narou";
import { describe, expect, it } from "vitest";
import { RankingType } from "../../interfaces/RankingType";
import {
	buildCustomRankingSearch,
	buildR18RankingSearch,
	parseBoolean,
	parseCustomRankingParams,
	parseGenres,
	parseIntSafe,
	parseR18RankingParams,
	parseSites,
	parseString,
} from "../parseSearch";

describe("parseBoolean", () => {
	it.each([
		{ str: undefined, defaultValue: true, expected: true },
		{ str: undefined, defaultValue: false, expected: false },
		{ str: "", defaultValue: true, expected: true },
		{ str: "", defaultValue: false, expected: false },
		{ str: "0", defaultValue: true, expected: false },
		{ str: "0", defaultValue: false, expected: false },
		{ str: "1", defaultValue: false, expected: true },
		{ str: "1", defaultValue: true, expected: true },
		{ str: "-1", defaultValue: false, expected: true },
		{ str: "42", defaultValue: false, expected: true },
		{ str: "abc", defaultValue: true, expected: true },
		{ str: "false", defaultValue: false, expected: false },
		{ str: "true", defaultValue: false, expected: false },
	])(
		"strが'$str', defaultValueが$defaultValueの場合は$expectedを返すこと",
		({ str, defaultValue, expected }) => {
			expect(parseBoolean(str, defaultValue)).toBe(expected);
		},
	);
});

describe("parseIntSafe", () => {
	it.each([
		{ str: undefined, expected: undefined },
		{ str: "", expected: undefined },
		{ str: "123", expected: 123 },
		{ str: "-42", expected: -42 },
		{ str: "0", expected: 0 },
		{ str: "abc", expected: undefined },
		{ str: "12abc", expected: 12 },
		{ str: 42, expected: 42 },
		{ str: 0, expected: 0 },
	])("strが'$str'の場合は$expectedを返すこと", ({ str, expected }) => {
		expect(parseIntSafe(str)).toBe(expected);
	});
});

describe("parseString", () => {
	it.each([
		{ str: undefined, expected: undefined },
		{ str: "", expected: "" },
		{ str: "abc", expected: "abc" },
		{ str: 123, expected: "123" },
		{ str: 0, expected: "0" },
	])("strが'$str'の場合は$expectedを返すこと", ({ str, expected }) => {
		expect(parseString(str)).toBe(expected);
	});
});

describe("parseGenres", () => {
	it("配列が渡された場合は有効なジャンルのみを返すこと", () => {
		const rawGenres = [101, 201, 123456];
		expect(parseGenres(rawGenres)).toEqual([101, 201]);
	});

	it("カンマ区切りの文字列が渡された場合は有効なジャンルの配列にして返すこと", () => {
		expect(parseGenres("101,201,123456")).toEqual([101, 201]);
	});

	it("undefinedが渡された場合は空の配列を返すこと", () => {
		expect(parseGenres(undefined)).toEqual([]);
	});

	it("空文字列が渡された場合は空の配列を返すこと", () => {
		expect(parseGenres("")).toEqual([]);
	});
});

describe("parseSites", () => {
	it("配列が渡された場合は有効なサイトのみを返すこと", () => {
		const rawSites = [R18Site.Nocturne, R18Site.MoonLight, 9999];
		expect(parseSites(rawSites)).toEqual([R18Site.Nocturne, R18Site.MoonLight]);
	});

	it("カンマ区切りの文字列が渡された場合は有効なサイトの配列にして返すこと", () => {
		expect(parseSites("1,2,9999")).toEqual([
			R18Site.Nocturne,
			R18Site.MoonLight,
		]);
	});

	it("undefinedが渡された場合は空の配列を返すこと", () => {
		expect(parseSites(undefined)).toEqual([]);
	});

	it("空文字列が渡された場合は空の配列を返すこと", () => {
		expect(parseSites("")).toEqual([]);
	});
});

describe("parseCustomRankingParams", () => {
	it("クエリパラメータからCustomRankingParamsを構築すること", () => {
		const search = {
			keyword: "test",
			not_keyword: "exclude",
			by_title: "1",
			by_story: "0",
			genres: "101,201",
			min: "100",
			max: "200",
			first_update: "2023-01-01",
			rensai: "0",
			kanketsu: "1",
			tanpen: "0",
		};
		const result = parseCustomRankingParams(RankingType.Weekly, search);

		expect(result).toEqual({
			keyword: "test",
			notKeyword: "exclude",
			byTitle: true,
			byStory: false,
			genres: [101, 201],
			min: 100,
			max: 200,
			firstUpdate: "2023-01-01",
			rensai: false,
			kanketsu: true,
			tanpen: false,
			rankingType: RankingType.Weekly,
		});
	});

	it("デフォルト値が正しく設定されること", () => {
		const result = parseCustomRankingParams(undefined, {});

		expect(result).toEqual({
			keyword: undefined,
			notKeyword: undefined,
			byTitle: false,
			byStory: false,
			genres: [],
			min: undefined,
			max: undefined,
			firstUpdate: undefined,
			rensai: true,
			kanketsu: true,
			tanpen: true,
			rankingType: RankingType.Daily,
		});
	});
});

describe("parseR18RankingParams", () => {
	it("クエリパラメータからR18RankingParamsを構築すること", () => {
		const search = {
			keyword: "test2",
			not_keyword: "exclude2",
			by_title: "0",
			by_story: "1",
			sites: "1,2",
			min: "50",
			max: "150",
			first_update: "2023-02-01",
			rensai: "1",
			kanketsu: "0",
			tanpen: "1",
		};
		const result = parseR18RankingParams(RankingType.Monthly, search);

		expect(result).toEqual({
			keyword: "test2",
			notKeyword: "exclude2",
			byTitle: false,
			byStory: true,
			sites: [R18Site.Nocturne, R18Site.MoonLight],
			min: 50,
			max: 150,
			firstUpdate: "2023-02-01",
			rensai: true,
			kanketsu: false,
			tanpen: true,
			rankingType: RankingType.Monthly,
		});
	});

	it("デフォルト値が正しく設定されること", () => {
		const result = parseR18RankingParams(undefined, {});

		expect(result).toEqual({
			keyword: undefined,
			notKeyword: undefined,
			byTitle: false,
			byStory: false,
			sites: [],
			min: undefined,
			max: undefined,
			firstUpdate: undefined,
			rensai: true,
			kanketsu: true,
			tanpen: true,
			rankingType: RankingType.Daily,
		});
	});
});

describe("buildCustomRankingSearch", () => {
	it("CustomRankingParamsから検索クエリ用のオブジェクトを構築すること", () => {
		const params = {
			keyword: "test",
			notKeyword: "exclude",
			byTitle: true,
			byStory: false,
			genres: [101, 201] as unknown as Genre[],
			min: 100,
			max: 200,
			firstUpdate: "2023-01-01",
			rensai: false,
			kanketsu: true,
			tanpen: false,
		};
		const result = buildCustomRankingSearch(params);

		expect(result).toEqual({
			keyword: "test",
			not_keyword: "exclude",
			by_title: 1,
			by_story: undefined,
			genres: [101, 201],
			min: 100,
			max: 200,
			first_update: "2023-01-01",
			rensai: 0,
			kanketsu: undefined,
			tanpen: 0,
		});
	});

	it("配列の要素が1つの場合は単一の値を返すこと", () => {
		const params = {
			genres: [101] as unknown as Genre[],
		};
		const result = buildCustomRankingSearch(params);
		expect(result.genres).toBe(101);
	});

	it("空の配列の場合はundefinedを返すこと", () => {
		const params = {
			genres: [],
		};
		const result = buildCustomRankingSearch(params);
		expect(result.genres).toBeUndefined();
	});

	it("デフォルト値と同じ場合はundefinedを返すこと", () => {
		const params = {
			byTitle: false, // default: false
			rensai: true, // default: true
		};
		const result = buildCustomRankingSearch(params);
		expect(result.by_title).toBeUndefined();
		expect(result.rensai).toBeUndefined();
	});
});

describe("buildR18RankingSearch", () => {
	it("R18RankingParamsから検索クエリ用のオブジェクトを構築すること", () => {
		const params = {
			keyword: "test2",
			notKeyword: "exclude2",
			byTitle: false,
			byStory: true,
			sites: [R18Site.Nocturne, R18Site.MoonLight],
			min: 50,
			max: 150,
			firstUpdate: "2023-02-01",
			rensai: true,
			kanketsu: false,
			tanpen: true,
		};
		const result = buildR18RankingSearch(params);

		expect(result).toEqual({
			keyword: "test2",
			not_keyword: "exclude2",
			by_title: undefined,
			by_story: 1,
			sites: [R18Site.Nocturne, R18Site.MoonLight],
			min: 50,
			max: 150,
			first_update: "2023-02-01",
			rensai: undefined,
			kanketsu: 0,
			tanpen: undefined,
		});
	});

	it("配列の要素が1つの場合は単一の値を返すこと", () => {
		const params = {
			sites: [R18Site.Nocturne],
		};
		const result = buildR18RankingSearch(params);
		expect(result.sites).toBe(R18Site.Nocturne);
	});
});
