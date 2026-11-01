import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { allGenres } from "../../enum/Genre";
import { parseDateTime } from "../../utils/temporal";
import { checkAllGenres, getTermFromRaw, parseDateRange } from "../filter";

describe("filter utilities", () => {
	describe("checkAllGenres", () => {
		it("すべてのジャンルが含まれている場合に true を返すこと", () => {
			expect(checkAllGenres([...allGenres])).toBe(true);
		});

		it("ジャンルが不足している場合に false を返すこと", () => {
			expect(checkAllGenres([allGenres[0]])).toBe(false);
		});

		it("空の配列の場合に false を返すこと", () => {
			expect(checkAllGenres([])).toBe(false);
		});

		it("重複していてもすべてのジャンルが含まれていれば true を返すこと", () => {
			expect(checkAllGenres([...allGenres, allGenres[0]])).toBe(true);
		});
	});

	describe("parseDateRange", () => {
		const mockNow = parseDateTime("2024-01-01T12:00:00.000Z");

		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(mockNow.epochMilliseconds);
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it("相対的な期間文字列 (days) を正しく解析すること", () => {
			const result = parseDateRange("7days");
			expect(result?.toPlainDate().toString()).toBe("2023-12-25");
		});

		it("相対的な期間文字列 (months) を正しく解析すること", () => {
			const result = parseDateRange("1months");
			expect(result?.toPlainDate().toString()).toBe("2023-12-01");
		});

		it("相対的な期間文字列 (years) を正しく解析すること", () => {
			const result = parseDateRange("1years");
			expect(result?.toPlainDate().toString()).toBe("2023-01-01");
		});

		it("ISO日付文字列を正しく解析すること", () => {
			const isoString = "2023-01-01T00:00:00.000Z";
			const result = parseDateRange(isoString);
			expect(result?.toPlainDate().toString()).toBe("2023-01-01");
		});

		it("無効な入力に対して undefined を返すこと", () => {
			expect(parseDateRange(undefined)).toBeUndefined();
			expect(parseDateRange("invalid-date")).toBeUndefined();
		});
	});

	describe("getTermFromRaw", () => {
		it("相対termはそのまま返すこと", () => {
			expect(getTermFromRaw("7days")).toBe("7days");
		});

		it("ISO日付はcustomを返すこと", () => {
			expect(getTermFromRaw("2023-01-01T00:00:00.000Z")).toBe("custom");
		});

		it("無効値はnoneを返すこと", () => {
			expect(getTermFromRaw(undefined)).toBe("none");
			expect(getTermFromRaw("invalid-date")).toBe("none");
		});
	});
});
