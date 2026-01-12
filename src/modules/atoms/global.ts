import { atomWithStorage } from "jotai/utils";

const darkMode =
	typeof window !== "undefined"
		? window.matchMedia("(prefers-color-scheme: dark)").matches
		: false;

export const darkModeAtom = atomWithStorage("darkMode", darkMode);
export const adModeAtom = atomWithStorage("useAd", true);
export const showKeywordAtom = atomWithStorage("showKeyword", true);
export const titleHeightAtom = atomWithStorage<number>("titleHeight", 0);
export const countAtom = atomWithStorage<number>("count", 0);
export const r18Atom = atomWithStorage("r18", false);
