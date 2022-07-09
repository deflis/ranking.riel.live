import { atomWithStorage } from "jotai/utils";

const darkMode =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : false;

export const darkModeAtom = atomWithStorage("darkMode", darkMode);
export const adModeAtom = atomWithStorage("useAd", true);
export const showKeywordAtom = atomWithStorage("showKeyword", true);
export const titleHeightAtom = atomWithStorage<number | undefined>(
  "titleHeight",
  undefined
);
