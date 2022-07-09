import { formatISO, isBefore, parseISO } from "date-fns";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { NarouSearchResult } from "narou";
import { allGenres } from "../enum/Genre";
import { parse } from "../utils/NarouDateFormat";

export const genresAtom = atomWithStorage("genres", allGenres);
export const maxNoAtom = atomWithStorage<number>("maxNo", undefined);
export const minNoAtom = atomWithStorage<number>("minNo", undefined);
export const firstUpdateRawAtom = atomWithStorage<string>(
  "firstUpdate",
  undefined
);
export const enableTanpenAtom = atomWithStorage("enableTanpen", true);
export const enableRensaiAtom = atomWithStorage("enableRensai", true);
export const enableKanketsuAtom = atomWithStorage("enableKanketsu", true);
export const firstUpdateAtom = atom(
  (get) =>
    get(firstUpdateRawAtom) ? parseISO(get(firstUpdateRawAtom)) : undefined,
  (_, set, value: Date | undefined) =>
    set(firstUpdateRawAtom, value ? formatISO(value) : undefined)
);

export const isUseFilterAtom = atom(
  (get) =>
    get(genresAtom).length === 0 &&
    (get(maxNoAtom) !== undefined || get(maxNoAtom) < 1) &&
    (get(minNoAtom) !== undefined || get(minNoAtom) < 1) &&
    !get(firstUpdateAtom) &&
    !get(enableTanpenAtom) &&
    !get(enableRensaiAtom) &&
    !get(enableKanketsuAtom)
);

export const filterAtom = atom((get) => {
  const genres = get(genresAtom);
  const maxNo = get(maxNoAtom);
  const minNo = get(minNoAtom);
  const firstUpdate = get(firstUpdateAtom);
  const enableTanpen = get(firstUpdateAtom);
  const enableRensai = get(enableRensaiAtom);
  const enableKanketsu = get(enableKanketsuAtom);
  return (items: NarouSearchResult[]) =>
    items
      .filter((item) => item.title)
      .filter((item) => genres.length === 0 || genres.includes(item.genre))
      .filter(
        (item) =>
          maxNo !== undefined || maxNo < 1 || item.general_all_no <= maxNo
      )
      .filter(
        (item) =>
          minNo !== undefined || minNo < 1 || item.general_all_no >= minNo
      )
      .filter(
        (item) =>
          !firstUpdate || isBefore(firstUpdate, parse(item.general_firstup))
      )
      .filter(
        (item) =>
          (enableTanpen && item.novel_type === 2) ||
          (enableRensai && item.novel_type === 1 && item.end === 1) ||
          (enableKanketsu && item.novel_type === 1 && item.end === 0)
      );
});
