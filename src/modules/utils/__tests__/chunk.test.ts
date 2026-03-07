import { describe, expect, it } from "vitest";
import { chunk } from "../chunk";

describe("chunk", () => {
	it("配列を指定したサイズのチャンクに分割すること", () => {
		expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
	});

	it("配列が指定したサイズで割り切れる場合は最後のチャンクも同じサイズになること", () => {
		expect(chunk([1, 2, 3, 4, 5, 6], 2)).toEqual([
			[1, 2],
			[3, 4],
			[5, 6],
		]);
	});

	it("チャンクサイズが配列の長さより大きい場合は1つのチャンクになること", () => {
		expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
	});

	it("チャンクサイズが配列の長さと同じ場合は1つのチャンクになること", () => {
		expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
	});

	it("空の配列を渡した場合は空の配列を返すこと", () => {
		expect(chunk([], 2)).toEqual([]);
	});

	it("チャンクサイズが0以下の場合はエラーをスローすること", () => {
		expect(() => chunk([1, 2, 3], 0)).toThrow("size must be greater than 0");
		expect(() => chunk([1, 2, 3], -1)).toThrow("size must be greater than 0");
	});
});
