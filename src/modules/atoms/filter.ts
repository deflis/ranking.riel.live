import { type Atom, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DateTime } from "luxon";
import type { Genre } from "narou";

import type { Item } from "../data/types";
import { allGenres } from "../enum/Genre";

export const genresAtom = atomWithStorage("genres", Array.from(allGenres));
export const storyMaxAtom = atomWithStorage<number | undefined>(
	"maxNo",
	undefined,
);
export const storyMinAtom = atomWithStorage<number | undefined>(
	"minNo",
	undefined,
);
export const lengthMaxAtom = atomWithStorage<number | undefined>(
	"maxLength",
	undefined,
);
export const lengthMinAtom = atomWithStorage<number | undefined>(
	"minLength",
	undefined,
);
export const firstUpdateRawAtom = atomWithStorage<
	string | TermStrings | undefined
>("firstUpdate", undefined);
export const enableTanpenAtom = atomWithStorage("enableTanpen", true);
export const enableRensaiAtom = atomWithStorage("enableRensai", true);
export const enableKanketsuAtom = atomWithStorage("enableKanketsu", true);
export const firstUpdateAtom = atom((get) =>
	parseDateRange(get(firstUpdateRawAtom)),
);

const relativeTermPattern = /^\d+(days|months|years)$/;

export function isRelativeTermString(
	raw: string | undefined,
): raw is TermStrings {
	return !!raw && relativeTermPattern.test(raw);
}

export function isCustomDateString(raw: string | undefined): boolean {
	if (!raw || isRelativeTermString(raw)) {
		return false;
	}
	try {
		return DateTime.fromISO(raw, { zone: "Asia/Tokyo" }).isValid;
	} catch {
		return false;
	}
}

export function getTermFromRaw(
	raw: string | undefined,
): TermStrings | "custom" | "none" {
	if (isCustomDateString(raw)) {
		return "custom";
	}
	if (isRelativeTermString(raw)) {
		return raw;
	}
	return "none";
}

export function parseDateRange(raw: string | undefined): DateTime | undefined {
	if (!raw) {
		return undefined;
	}
	if (raw.endsWith("days")) {
		const days = Number.parseInt(raw.slice(0, -4));
		if (days) {
			return DateTime.now()
				.setZone("Asia/Tokyo")
				.startOf("day")
				.minus({ days });
		}
	}
	if (raw.endsWith("months")) {
		const months = Number.parseInt(raw.slice(0, -6));
		if (months) {
			return DateTime.now()
				.setZone("Asia/Tokyo")
				.startOf("day")
				.minus({ months });
		}
	}
	if (raw.endsWith("years")) {
		const years = Number.parseInt(raw.slice(0, -5));
		if (years) {
			return DateTime.now()
				.setZone("Asia/Tokyo")
				.startOf("day")
				.minus({ years });
		}
	}
	try {
		const date = DateTime.fromISO(raw, { zone: "Asia/Tokyo" });
		return date.isValid ? date : undefined;
	} catch {
		return undefined;
	}
}

export function checkAllGenres(genres: Genre[]): boolean {
	return allGenres.every((genre) => genres.includes(genre));
}

export const isUseFilterAtom: Atom<boolean> = atom((get) => {
	const genres = get(genresAtom);
	const maxNo = get(storyMaxAtom);
	const minNo = get(storyMinAtom);
	const firstUpdate = get(firstUpdateAtom);
	const enableTanpen = get(enableTanpenAtom);
	const enableRensai = get(enableRensaiAtom);
	const enableKanketsu = get(enableKanketsuAtom);
	const lengthMax = get(lengthMaxAtom);
	const lengthMin = get(lengthMinAtom);
	return (
		(genres.length !== 0 && !checkAllGenres(genres)) ||
		(maxNo !== undefined && maxNo > 1) ||
		(minNo !== undefined && minNo > 1) ||
		(lengthMax !== undefined && lengthMax > 1) ||
		(lengthMin !== undefined && lengthMin > 1) ||
		!!firstUpdate ||
		!enableTanpen ||
		!enableRensai ||
		!enableKanketsu
	);
});

type NumberConfig = {
	enable: boolean;
	value: number;
};

export type TermStrings = `${number}${"days" | "months" | "years"}`;

type TermConfig = {
	term: TermStrings | "custom" | "none";
	begin: string;
	end: string;
};

export type FilterConfig = {
	genres: Record<`g${(typeof allGenres)[number]}`, boolean>;
	story: {
		min: NumberConfig;
		max: NumberConfig;
	};
	length: {
		min: NumberConfig;
		max: NumberConfig;
	};
	firstUpdate: TermConfig;
	status: {
		tanpen: boolean;
		rensai: boolean;
		kanketsu: boolean;
	};
};

export const filterConfigAtom = atom<FilterConfig, [FilterConfig], void>(
	(get) => {
		const genres = get(genresAtom);
		const storyMax = get(storyMaxAtom);
		const storyMin = get(storyMinAtom);
		const lengthMax = get(lengthMaxAtom);
		const lengthMin = get(lengthMinAtom);
		const firstUpdate = get(firstUpdateAtom);
		const firstUpdateRaw = get(firstUpdateRawAtom);
		const enableTanpen = get(enableTanpenAtom);
		const enableRensai = get(enableRensaiAtom);
		const enableKanketsu = get(enableKanketsuAtom);
		return {
			genres: allGenres.reduce(
				(accumulator, id) => {
					accumulator[`g${id}`] = genres.includes(id);
					return accumulator;
				},
				{} as Record<`g${(typeof allGenres)[number]}`, boolean>,
			),
			story: {
				min: {
					enable: !!storyMin,
					value: storyMin ?? 1,
				},
				max: {
					enable: !!storyMax,
					value: storyMax ?? 30,
				},
			},
			length: {
				min: {
					enable: !!lengthMin,
					value: lengthMin ?? 1,
				},
				max: {
					enable: !!lengthMax,
					value: lengthMax ?? 50000,
				},
			},
			firstUpdate: {
				term: getTermFromRaw(firstUpdateRaw),
				begin:
					firstUpdate?.toISODate() ??
					DateTime.now().setZone("Asia/Tokyo").toISODate(),
				end: "",
			},
			status: {
				tanpen: enableTanpen,
				rensai: enableRensai,
				kanketsu: enableKanketsu,
			},
		};
	},
	(_, set, config) => {
		set(
			genresAtom,
			allGenres.filter((id) => config.genres[`g${id}`]),
		);
		set(
			storyMinAtom,
			config.story.min.enable ? config.story.min.value : undefined,
		);
		set(
			storyMaxAtom,
			config.story.max.enable ? config.story.max.value : undefined,
		);
		set(
			lengthMinAtom,
			config.length.min.enable ? config.length.min.value : undefined,
		);
		set(
			lengthMaxAtom,
			config.length.max.enable ? config.length.max.value : undefined,
		);
		const firstUpdateBegin = DateTime.fromISO(config.firstUpdate.begin, {
			zone: "Asia/Tokyo",
		});
		set(
			firstUpdateRawAtom,
			config.firstUpdate.term === "custom" && firstUpdateBegin.isValid
				? firstUpdateBegin.startOf("day").toISO()
				: config.firstUpdate.term !== "none"
					? config.firstUpdate.term
					: undefined,
		);
		set(enableTanpenAtom, config.status.tanpen);
		set(enableRensaiAtom, config.status.rensai);
		set(enableKanketsuAtom, config.status.kanketsu);
	},
);

export const filterAtom = atom((get) => {
	const genres = get(genresAtom);
	const storyMax = get(storyMaxAtom);
	const storyMin = get(storyMinAtom);
	const firstUpdate = get(firstUpdateAtom);
	const enableTanpen = get(enableTanpenAtom);
	const enableRensai = get(enableRensaiAtom);
	const enableKanketsu = get(enableKanketsuAtom);
	const lengthMax = get(lengthMaxAtom);
	const lengthMin = get(lengthMinAtom);
	return (item: Item): boolean =>
		(genres.length === 0 || genres.includes(item.genre)) &&
		(storyMax === undefined ||
			storyMax < 1 ||
			item.general_all_no <= storyMax) &&
		(storyMin === undefined ||
			storyMin < 1 ||
			item.general_all_no >= storyMin) &&
		(lengthMax === undefined || lengthMax < 1 || item.length <= lengthMax) &&
		(lengthMin === undefined || lengthMin < 1 || item.length >= lengthMin) &&
		(!firstUpdate || firstUpdate < DateTime.fromISO(item.general_firstup)) &&
		((enableTanpen && item.noveltype === 2) ||
			(enableRensai && item.noveltype === 1 && item.end === 1) ||
			(enableKanketsu && item.noveltype === 1 && item.end === 0));
});
