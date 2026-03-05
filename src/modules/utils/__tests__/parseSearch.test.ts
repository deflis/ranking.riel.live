import { describe, expect, it } from "vitest";
import { parseBoolean } from "../parseSearch";

describe("parseBoolean", () => {
	it("returns defaultValue when str is undefined", () => {
		expect(parseBoolean(undefined, true)).toBe(true);
		expect(parseBoolean(undefined, false)).toBe(false);
	});

	it("returns defaultValue when str is an empty string", () => {
		expect(parseBoolean("", true)).toBe(true);
		expect(parseBoolean("", false)).toBe(false);
	});

	it("returns false when str is '0'", () => {
		expect(parseBoolean("0", true)).toBe(false);
		expect(parseBoolean("0", false)).toBe(false);
	});

	it("returns true when str is '1'", () => {
		expect(parseBoolean("1", false)).toBe(true);
		expect(parseBoolean("1", true)).toBe(true);
	});

	it("returns true when str is any non-zero number string", () => {
		expect(parseBoolean("-1", false)).toBe(true);
		expect(parseBoolean("42", false)).toBe(true);
	});

	it("returns defaultValue when str is not a valid number", () => {
		expect(parseBoolean("abc", true)).toBe(true);
		expect(parseBoolean("false", false)).toBe(false);
		expect(parseBoolean("true", false)).toBe(false);
	});
});
