import { describe, expect, it } from "vitest";
import { parseBoolean } from "../parseSearch";

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
