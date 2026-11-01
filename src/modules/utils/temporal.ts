import "temporal-polyfill-lite/global";
import "temporal-polyfill-lite/types/global";

export const TIME_ZONE = "Asia/Tokyo";

export function nowInTokyo(): Temporal.ZonedDateTime {
	return Temporal.Now.zonedDateTimeISO(TIME_ZONE);
}

/** オフセットなしの API 日時は日本時間として解釈する。 */
export function parseDateTime(value: string): Temporal.ZonedDateTime {
	try {
		return Temporal.Instant.from(value).toZonedDateTimeISO(TIME_ZONE);
	} catch {
		return Temporal.PlainDateTime.from(
			/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
		).toZonedDateTime(TIME_ZONE);
	}
}

export function toISODateTime(date: Temporal.ZonedDateTime): string {
	return date.toString({ timeZoneName: "never", calendarName: "never" });
}

export function formatJapaneseDate(
	date: Temporal.PlainDate,
	weekday = false,
): string {
	const result = `${date.year}年${String(date.month).padStart(2, "0")}月${String(date.day).padStart(2, "0")}日`;
	return weekday
		? `${result}(${date.toLocaleString("ja-JP", { weekday: "short" })})`
		: result;
}

export function formatDateTime(
	date: Temporal.ZonedDateTime,
	japanese = false,
): string {
	const day = date.toPlainDate();
	const datePart = japanese
		? formatJapaneseDate(day)
		: day.toString().replaceAll("-", "/");
	return `${datePart} ${date.toPlainTime().toString({ smallestUnit: "second" })}`;
}

export function formatRelative(date: Temporal.ZonedDateTime): string {
	const duration = nowInTokyo().until(date, { largestUnit: "years" });
	const formatter = new Intl.RelativeTimeFormat("ja");
	for (const unit of [
		"years",
		"months",
		"days",
		"hours",
		"minutes",
		"seconds",
	] as const) {
		if (duration[unit]) return formatter.format(duration[unit], unit);
	}
	return formatter.format(0, "seconds");
}
