import { RankingType as NarouRankingType } from "narou";

import { parseDateTime } from "./temporal";

export function parseDate(date: string): Temporal.ZonedDateTime;
export function parseDate(
	date: string | undefined,
): Temporal.ZonedDateTime | undefined;
export function parseDate(
	date: string | undefined,
): Temporal.ZonedDateTime | undefined {
	if (!date) return undefined;
	if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
		throw new RangeError("Invalid API date");
	}
	return parseDateTime(date);
}

export function formatDate(
	date: Temporal.PlainDate,
	type: NarouRankingType,
): string {
	return convertDate(date, type).toString();
}

export function convertDate(
	date: Temporal.PlainDate,
	type: NarouRankingType,
): Temporal.PlainDate {
	switch (type) {
		case NarouRankingType.Weekly:
			return date.subtract({ days: (date.dayOfWeek + 5) % 7 });
		case NarouRankingType.Monthly:
		case NarouRankingType.Quarterly:
			return date.with({ day: 1 });
		default:
			return date;
	}
}

export function addDate(
	date: Temporal.PlainDate,
	type: NarouRankingType,
	amount: number,
): Temporal.PlainDate {
	switch (type) {
		case NarouRankingType.Weekly:
			return date.add({ weeks: amount });
		case NarouRankingType.Monthly:
		case NarouRankingType.Quarterly:
			return date.add({ months: amount });
		default:
			return date.add({ days: amount });
	}
}
