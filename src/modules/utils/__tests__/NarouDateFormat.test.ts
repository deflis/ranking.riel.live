import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { parse } from "../NarouDateFormat";

describe("NarouDateFormat parse", () => {
	it("正しい形式の文字列をDateTimeオブジェクトに変換すること", () => {
		const result = parse("2023-10-25 14:30:00");
		expect(result).toBeInstanceOf(DateTime);
		expect(result?.isValid).toBe(true);
		expect(result?.toISODate()).toBe("2023-10-25");
		expect(result?.hour).toBe(14);
		expect(result?.minute).toBe(30);
		expect(result?.second).toBe(0);
	});

	it("undefinedが渡された場合はundefinedを返すこと", () => {
		expect(parse(undefined)).toBeUndefined();
	});

	it("空文字列が渡された場合はundefinedを返すこと", () => {
		expect(parse("")).toBeUndefined();
	});
});
