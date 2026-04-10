import { DateTime, Settings } from "luxon";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { allGenres } from "../../enum/Genre";
import { checkAllGenres, parseDateRange } from "../filter";

// タイムゾーンを日本に固定
Settings.defaultZone = "Asia/Tokyo";

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
		const mockNow = DateTime.fromISO("2024-01-01T12:00:00.000Z", {
			zone: "Asia/Tokyo",
		});

		beforeEach(() => {
			vi.useFakeTimers();
			vi.setSystemTime(mockNow.toJSDate());
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		const todayStart = mockNow.startOf("day");

		it("相対的な期間文字列 (days) を正しく解析すること", () => {
			const result = parseDateRange("7days");
			expect(result?.toISODate()).toBe(todayStart.minus({ days: 7 }).toISODate());
		});

		it("相対的な期間文字列 (months) を正しく解析すること", () => {
			const result = parseDateRange("1months");
			expect(result?.toISODate()).toBe(
				todayStart.minus({ months: 1 }).toISODate(),
			);
		});

		it("相対的な期間文字列 (years) を正しく解析すること", () => {
			const result = parseDateRange("1years");
			expect(result?.toISODate()).toBe(
				todayStart.minus({ years: 1 }).toISODate(),
			);
		});

		it("ISO日付文字列を正しく解析すること", () => {
			const isoString = "2023-01-01T00:00:00.000Z";
			const result = parseDateRange(isoString);
			expect(result?.isValid).toBe(true);
			expect(result?.toISODate()).toBe("2023-01-01");
		});

		it("無効な入力に対して undefined を返すこと", () => {
			expect(parseDateRange(undefined)).toBeUndefined();
			expect(parseDateRange("invalid-date")).toBeUndefined();
		});
	});
});
