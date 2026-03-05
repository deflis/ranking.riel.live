import { describe, expect, it } from "vitest";
import { parseBoolean } from "../parseSearch";

describe("parseBoolean", () => {
	it("strがundefinedの場合はdefaultValueを返すこと", () => {
		expect(parseBoolean(undefined, true)).toBe(true);
		expect(parseBoolean(undefined, false)).toBe(false);
	});

	it("strが空文字の場合はdefaultValueを返すこと", () => {
		expect(parseBoolean("", true)).toBe(true);
		expect(parseBoolean("", false)).toBe(false);
	});

	it("strが'0'の場合はfalseを返すこと", () => {
		expect(parseBoolean("0", true)).toBe(false);
		expect(parseBoolean("0", false)).toBe(false);
	});

	it("strが'1'の場合はtrueを返すこと", () => {
		expect(parseBoolean("1", false)).toBe(true);
		expect(parseBoolean("1", true)).toBe(true);
	});

	it("strが0以外の数値文字列の場合はtrueを返すこと", () => {
		expect(parseBoolean("-1", false)).toBe(true);
		expect(parseBoolean("42", false)).toBe(true);
	});

	it("strが数値としてパースできない不正な文字列の場合はdefaultValueを返すこと", () => {
		expect(parseBoolean("abc", true)).toBe(true);
		expect(parseBoolean("false", false)).toBe(false);
		expect(parseBoolean("true", false)).toBe(false);
	});
});
