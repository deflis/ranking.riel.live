import { RankingType } from "narou";
import { describe, expect, it } from "vitest";

import { addDate, convertDate, formatDate, parseDate } from "../date";
import { parseDateTime } from "../temporal";

describe("date utils", () => {
	describe("parseDate", () => {
		it("正しい形式の文字列をTemporal.ZonedDateTimeオブジェクトに変換すること", () => {
			const result = parseDate("2023-10-25 14:30:00");
			expect(result).toBeInstanceOf(Temporal.ZonedDateTime);
			expect(result?.toPlainDate().toString()).toBe("2023-10-25");
			expect(result?.hour).toBe(14);
			expect(result?.minute).toBe(30);
			expect(result?.second).toBe(0);
		});

		it("undefinedが渡された場合はundefinedを返すこと", () => {
			expect(parseDate(undefined)).toBeUndefined();
		});

		it("空文字列が渡された場合はundefinedを返すこと", () => {
			expect(parseDate("")).toBeUndefined();
		});
	});

	describe("convertDate", () => {
		const testDate = parseDateTime("2023-10-25T14:30:00").toPlainDate(); // 2023-10-25 is Wednesday

		it("Dailyの場合はその日付を返すこと", () => {
			const result = convertDate(testDate, RankingType.Daily);
			expect(result.toString()).toBe("2023-10-25");
		});

		it("Weeklyの場合はその週の火曜日を返すこと", () => {
			const result = convertDate(testDate, RankingType.Weekly);
			// 2023-10-25 (Wed) -> start of week is 2023-10-23 (Mon)
			// plus 1 day -> 2023-10-24 (Tue)
			expect(result.toString()).toBe("2023-10-24");
		});

		it("Weeklyで火曜日より前の曜日の場合は前の週の火曜日を返すこと", () => {
			const monday = parseDateTime("2023-10-23T14:30:00").toPlainDate();
			const result = convertDate(monday, RankingType.Weekly);
			// 2023-10-23 (Mon) -> start of week is 2023-10-23 (Mon)
			// plus 1 day -> 2023-10-24 (Tue). newDate (Tue) > date (Mon), so minus 1 week
			// -> 2023-10-17 (Tue)
			expect(result.toString()).toBe("2023-10-17");
		});

		it("Monthlyの場合はその月の1日を返すこと", () => {
			const result = convertDate(testDate, RankingType.Monthly);
			expect(result.toString()).toBe("2023-10-01");
		});

		it("Quarterlyの場合はその月の1日を返すこと", () => {
			const result = convertDate(testDate, RankingType.Quarterly);
			expect(result.toString()).toBe("2023-10-01");
		});
	});

	describe("formatDate", () => {
		const testDate = parseDateTime("2023-10-25T14:30:00").toPlainDate();

		it("指定されたランキングタイプでフォーマットされた日付文字列を返すこと", () => {
			expect(formatDate(testDate, RankingType.Daily)).toBe("2023-10-25");
			expect(formatDate(testDate, RankingType.Weekly)).toBe("2023-10-24");
			expect(formatDate(testDate, RankingType.Monthly)).toBe("2023-10-01");
		});
	});

	describe("addDate", () => {
		const testDate = parseDateTime("2023-10-25T14:30:00").toPlainDate();

		it("Dailyの場合は指定された日数を加算すること", () => {
			expect(addDate(testDate, RankingType.Daily, 2).toString()).toBe(
				"2023-10-27",
			);
			expect(addDate(testDate, RankingType.Daily, -1).toString()).toBe(
				"2023-10-24",
			);
		});

		it("Weeklyの場合は指定された週数を加算すること", () => {
			expect(addDate(testDate, RankingType.Weekly, 1).toString()).toBe(
				"2023-11-01",
			);
			expect(addDate(testDate, RankingType.Weekly, -2).toString()).toBe(
				"2023-10-11",
			);
		});

		it("Monthlyの場合は指定された月数を加算すること", () => {
			expect(addDate(testDate, RankingType.Monthly, 1).toString()).toBe(
				"2023-11-25",
			);
			expect(addDate(testDate, RankingType.Monthly, -1).toString()).toBe(
				"2023-09-25",
			);
		});

		it("Quarterlyの場合は指定された月数を加算すること", () => {
			expect(addDate(testDate, RankingType.Quarterly, 3).toString()).toBe(
				"2024-01-25",
			);
		});
		it("月末の加算は移動先の月の最終日に丸めること", () => {
			const date = Temporal.PlainDate.from("2024-01-31");
			expect(addDate(date, RankingType.Monthly, 1).toString()).toBe(
				"2024-02-29",
			);
		});
	});
});
