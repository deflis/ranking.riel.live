import { Atom, atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DateTime } from "luxon";
import { Genre, NarouSearchResult } from "narou/src/index.browser";
import { DetailResult } from "../data/loaders/detail";
import { allGenres } from "../enum/Genre";
import { parse } from "../utils/NarouDateFormat";

export const genresAtom = atomWithStorage("genres", Array.from(allGenres));
export const maxNoAtom = atomWithStorage<number | undefined>(
  "maxNo",
  undefined
);
export const minNoAtom = atomWithStorage<number | undefined>(
  "minNo",
  undefined
);
export const firstUpdateRawAtom = atomWithStorage<string | undefined>(
  "firstUpdate",
  undefined
);
export const enableTanpenAtom = atomWithStorage("enableTanpen", true);
export const enableRensaiAtom = atomWithStorage("enableRensai", true);
export const enableKanketsuAtom = atomWithStorage("enableKanketsu", true);
export const firstUpdateAtom = atom(
  (get) => {
    const raw = get(firstUpdateRawAtom);
    return raw ? DateTime.fromISO(raw) : undefined;
  },
  (_, set, value: DateTime | undefined) =>
    set(firstUpdateRawAtom, value?.toISODate())
);

function checkAllGenres(genres: Genre[]): boolean {
  return allGenres.every((genre) => genres.includes(genre));
}

export const isUseFilterAtom: Atom<boolean> = atom((get) => {
  const genres = get(genresAtom);
  const maxNo = get(maxNoAtom);
  const minNo = get(minNoAtom);
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
export const forLogAtom = atom((get) => {
  const genres = get(genresAtom);
  const maxNo = get(maxNoAtom);
  const minNo = get(minNoAtom);
  const firstUpdate = get(firstUpdateAtom);
  const enableTanpen = get(enableTanpenAtom);
  const enableRensai = get(enableRensaiAtom);
  const enableKanketsu = get(enableKanketsuAtom);
  return {
    genres,
    maxNo,
    minNo,
    firstUpdate,
    enableTanpen,
    enableRensai,
    enableKanketsu,
  };
});

export const filterAtom = atom((get) => {
  const genres = get(genresAtom);
  const maxNo = get(maxNoAtom);
  const minNo = get(minNoAtom);
  const firstUpdate = get(firstUpdateAtom);
  const enableTanpen = get(enableTanpenAtom);
  const enableRensai = get(enableRensaiAtom);
  const enableKanketsu = get(enableKanketsuAtom);
  return (item: DetailResult): boolean =>
    !!item?.title &&
    (genres.length === 0 || genres.includes(item.genre)) &&
    (maxNo === undefined || maxNo < 1 || item.general_all_no <= maxNo) &&
    (minNo === undefined || minNo < 1 || item.general_all_no >= minNo) &&
    (!firstUpdate || firstUpdate < parse(item.general_firstup)!) &&
    ((enableTanpen && item.noveltype === 2) ||
      (enableRensai && item.noveltype === 1 && item.end === 1) ||
      (enableKanketsu && item.noveltype === 1 && item.end === 0));
});
