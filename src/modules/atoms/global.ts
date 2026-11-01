import { atomWithStorage, createJSONStorage } from "jotai/utils";

const themeStorage = createJSONStorage<boolean>();

export const darkModeAtom = atomWithStorage("darkMode", false, {
	...themeStorage,
	getItem: (key, initialValue) => {
		// 初回描画はSSRと揃え、マウント時に保存値、未保存ならOS設定を復元する。
		const fallback =
			typeof window !== "undefined" && typeof window.matchMedia === "function"
				? window.matchMedia("(prefers-color-scheme: dark)").matches
				: initialValue;
		return themeStorage.getItem(key, fallback);
	},
});
export const adModeAtom = atomWithStorage("useAd", true);
export const showKeywordAtom = atomWithStorage("showKeyword", true);
export const titleHeightAtom = atomWithStorage<number>("titleHeight", 0);
export const countAtom = atomWithStorage<number>("count", 0);
export const r18Atom = atomWithStorage("r18", false);
