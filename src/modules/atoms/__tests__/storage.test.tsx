import { type Atom, Provider, createStore, useAtomValue } from "jotai";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { filterAtom, isUseFilterAtom, storyMinAtom } from "../filter";
import {
	countAtom,
	darkModeAtom,
	r18Atom,
	showKeywordAtom,
	titleHeightAtom,
} from "../global";

function mockBrowser(values: Record<string, unknown>, prefersDark = true) {
	const saved = new Map(
		Object.entries(values).map(([key, value]) => [key, JSON.stringify(value)]),
	);
	const localStorage = {
		getItem: vi.fn((key: string) => saved.get(key) ?? null),
		setItem: vi.fn((key: string, value: string) => saved.set(key, value)),
		removeItem: vi.fn((key: string) => saved.delete(key)),
	};
	vi.stubGlobal("window", {
		localStorage,
		matchMedia: vi.fn(() => ({ matches: prefersDark })),
	});
	return localStorage;
}

function Preferences() {
	const darkMode = useAtomValue(darkModeAtom);
	const height = useAtomValue(titleHeightAtom);
	const keywords = useAtomValue(showKeywordAtom);
	const confirmed = useAtomValue(r18Atom);
	return <div>{JSON.stringify({ darkMode, height, keywords, confirmed })}</div>;
}

afterEach(() => vi.unstubAllGlobals());

describe("永続設定のSSRと復元", () => {
	it("ブラウザーでモジュールを読み込んでもOS設定を初期値にしないこと", async () => {
		const storage = mockBrowser({});
		vi.resetModules();
		const { darkModeAtom: clientDarkModeAtom } = await import("../global");
		expect(createStore().get(clientDarkModeAtom)).toBe(false);
		expect(storage.getItem).not.toHaveBeenCalled();
	});

	it("保存値とOS設定が異なってもSSRとブラウザーの初回描画が一致すること", () => {
		const serverHtml = renderToString(
			<Provider store={createStore()}>
				<Preferences />
			</Provider>,
		);
		const storage = mockBrowser({
			darkMode: true,
			titleHeight: 7,
			showKeyword: false,
			r18: true,
		});
		const clientHtml = renderToString(
			<Provider store={createStore()}>
				<Preferences />
			</Provider>,
		);
		expect(clientHtml).toBe(serverHtml);
		expect(storage.getItem).not.toHaveBeenCalled();
	});

	it("購読時に設定を復元し、保存値を上書きしないこと", () => {
		const storage = mockBrowser({
			darkMode: false,
			titleHeight: 7,
			showKeyword: false,
			r18: true,
		});
		const store = createStore();
		const atoms: Atom<unknown>[] = [
			darkModeAtom,
			titleHeightAtom,
			showKeywordAtom,
			r18Atom,
		];
		const unsubscribe = atoms.map((value) => store.sub(value, () => {}));
		expect(atoms.map((value) => store.get(value))).toEqual([
			false,
			7,
			false,
			true,
		]);
		expect(storage.setItem).not.toHaveBeenCalled();
		unsubscribe.forEach((stop) => stop());
	});

	it("テーマ未保存時のみマウント後にOS設定を反映すること", () => {
		mockBrowser({});
		const store = createStore();
		expect(store.get(darkModeAtom)).toBe(false);
		const stop = store.sub(darkModeAtom, () => {});
		expect(store.get(darkModeAtom)).toBe(true);
		stop();
	});

	it("保存済みの訪問回数を復元してから加算できること", () => {
		const storage = mockBrowser({ count: 42 });
		const store = createStore();
		const stop = store.sub(countAtom, () => {});
		store.set(countAtom, (count) => count + 1);
		expect(store.get(countAtom)).toBe(43);
		expect(storage.setItem).toHaveBeenLastCalledWith("count", "43");
		stop();
	});

	it("保存されたフィルターを派生atomからの購読でも復元すること", () => {
		mockBrowser({ minNo: 10 });
		const store = createStore();
		expect(store.get(isUseFilterAtom)).toBe(false);
		const stop = store.sub(filterAtom, () => {});
		expect(store.get(storyMinAtom)).toBe(10);
		expect(store.get(isUseFilterAtom)).toBe(true);
		stop();
	});
});
