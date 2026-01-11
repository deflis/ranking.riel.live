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
export const firstUpdateRawAtom = atomWithStorage<
	string | TermStrings | undefined
>("firstUpdate", undefined);
export const enableTanpenAtom = atomWithStorage("enableTanpen", true);
export const enableRensaiAtom = atomWithStorage("enableRensai", true);
export const enableKanketsuAtom = atomWithStorage("enableKanketsu", true);
export const firstUpdateAtom = atom((get) =>
	parseDateRange(get(firstUpdateRawAtom)),
);

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
				.minus({ months: years });
		}
	}
	const date = raw ? DateTime.fromISO(raw, { zone: "Asia/Tokyo" }) : undefined;
	return date?.isValid ? date : undefined;
}

function checkAllGenres(genres: Genre[]): boolean {
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
	return (
		(genres.length !== 0 && !checkAllGenres(genres)) ||
		(maxNo !== undefined && maxNo > 1) ||
		(minNo !== undefined && minNo > 1) ||
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
		const firstUpdate = get(firstUpdateAtom);
		const firstUpdateRaw = get(firstUpdateRawAtom);
		const enableTanpen = get(enableTanpenAtom);
		const enableRensai = get(enableRensaiAtom);
		const enableKanketsu = get(enableKanketsuAtom);
		return {
			genres: allGenres.reduce(
				(accumulator, id) => ({
					...accumulator,
					[`g${id}`]: genres.includes(id),
				}),
				{} as Record<`g${(typeof allGenres)[number]}`, boolean>,
			),
			story: {
				min: {
					enable: !!storyMax,
					value: storyMin ?? 1,
				},
				max: {
					enable: !!storyMax,
					value: storyMax ?? 30,
				},
			},
			firstUpdate: {
				term: DateTime.fromISO(firstUpdateRaw ?? "", { zone: "Asia/Tokyo" })
					.isValid
					? "custom"
					: ((firstUpdateRaw as TermStrings) ?? "none"),
				begin:
					firstUpdate?.toISODate() ??
					DateTime.now().setZone("Asia/Tokyo").toISODate() ??
					"",
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
		const firstUpdateBegin = DateTime.fromISO(config.firstUpdate.begin, {
			zone: "Asia/Tokyo",
		});
		set(
			firstUpdateRawAtom,
			config.firstUpdate.term === "custom" && firstUpdateBegin.isValid
				? (firstUpdateBegin.startOf("day").toISO() ?? "")
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
	return (item: Item): boolean =>
		(genres.length === 0 || genres.includes(item.genre)) &&
		(storyMax === undefined ||
			storyMax < 1 ||
			item.general_all_no <= storyMax) &&
		(storyMin === undefined ||
			storyMin < 1 ||
			item.general_all_no >= storyMin) &&
		(!firstUpdate || firstUpdate < item.general_firstup) &&
		((enableTanpen && item.noveltype === 2) ||
			(enableRensai && item.noveltype === 1 && item.end === 1) ||
			(enableKanketsu && item.noveltype === 1 && item.end === 0));
});
