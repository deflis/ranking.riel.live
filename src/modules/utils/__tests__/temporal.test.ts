import { afterEach, describe, expect, it, vi } from "vitest";

import {
	formatDateTime,
	formatJapaneseDate,
	formatRelative,
	nowInTokyo,
	parseDateTime,
	toISODateTime,
} from "../temporal";

afterEach(() => vi.useRealTimers());

describe("Temporal 日時処理", () => {
	it("オフセットなしの API 日時と日付は日本時間として扱うこと", () => {
		expect(toISODateTime(parseDateTime("2024-02-29 23:45:12"))).toBe(
			"2024-02-29T23:45:12+09:00",
		);
		expect(toISODateTime(parseDateTime("2024-02-29"))).toBe(
			"2024-02-29T00:00:00+09:00",
		);
	});

	it("UTC 日時を日本時間に変換し、日付を繰り上げること", () => {
		expect(toISODateTime(parseDateTime("2024-01-31T15:00:00Z"))).toBe(
			"2024-02-01T00:00:00+09:00",
		);
	});

	it("存在しない日付を拒否すること", () => {
		expect(() => parseDateTime("2023-02-29")).toThrow(RangeError);
	});

	it("曜日と24時間表記の日時を日本語で表示すること", () => {
		const date = parseDateTime("2024-02-29T23:45:12+09:00");
		expect(formatJapaneseDate(date.toPlainDate(), true)).toBe(
			"2024年02月29日(木)",
		);
		expect(formatDateTime(date)).toBe("2024/02/29 23:45:12");
		expect(formatDateTime(date, true)).toBe("2024年02月29日 23:45:12");
	});

	it("現在時刻を日本時間で取得し、過去と未来の相対日時を表示すること", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-02-29T15:00:00Z"));
		expect(nowInTokyo().toPlainDate().toString()).toBe("2024-03-01");
		expect(formatRelative(parseDateTime("2024-02-28"))).toBe("2 日前");
		expect(formatRelative(parseDateTime("2024-03-02"))).toBe("1 日後");
	});
});
