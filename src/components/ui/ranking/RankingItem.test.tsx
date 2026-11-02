// @vitest-environment happy-dom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	createMemoryHistory,
	createRootRoute,
	createRoute,
	createRouter,
	Outlet,
	RouterProvider,
} from "@tanstack/react-router";
import { createStore, Provider } from "jotai";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { showKeywordAtom, titleHeightAtom } from "@/modules/atoms/global";
import { itemKey } from "@/modules/data/item";
import { itemKey as r18ItemKey } from "@/modules/data/r18item";
import type { Item, NocItem } from "@/modules/data/types";
import * as temporal from "@/modules/utils/temporal";

import RankingItem, { R18RankingItem } from "./RankingItem";

const item: Item = {
	ncode: "N1234AB",
	title: "冒険 &amp; 魔法",
	writer: "作者 &lt;名前&gt;",
	userid: 123,
	genre: 101,
	noveltype: 1,
	end: 1,
	length: 100000,
	general_all_no: 100,
	general_firstup: "2026-10-01T12:00:00+09:00",
	general_lastup: "2026-11-01T12:00:00+09:00",
	novelupdated_at: "2026-11-01T12:00:00+09:00",
	keyword: "冒険 魔法",
	story: "最初のあらすじ",
};
const rank = { ncode: item.ncode, rank: 1, pt: 1234 };
let root: Root;
let container: HTMLDivElement;
let queryClient: QueryClient;
let store: ReturnType<typeof createStore>;

beforeEach(() => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	localStorage.clear();
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
	store = createStore();
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	});
});

afterEach(async () => {
	await act(async () => root.unmount());
	queryClient.clear();
	container.remove();
	localStorage.clear();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

async function mount(r18 = false, data: Item | NocItem | null = item) {
	queryClient.setQueryData(
		r18 ? r18ItemKey(item.ncode) : itemKey(item.ncode),
		data,
	);
	const base = createRootRoute({
		component: () => (
			<QueryClientProvider client={queryClient}>
				<Provider store={store}>
					<Outlet />
				</Provider>
			</QueryClientProvider>
		),
	});
	const index = createRoute({
		getParentRoute: () => base,
		path: "/",
		component: () =>
			r18 ? <R18RankingItem item={rank} /> : <RankingItem item={rank} />,
	});
	const paths = [
		"detail/$ncode",
		"r18/detail/$ncode",
		"custom/{-$type}",
		"r18/ranking/{-$type}",
	] as const;
	const routeTree = base.addChildren([
		index,
		...paths.map((path) =>
			createRoute({ getParentRoute: () => base, path, component: () => null }),
		),
	]);
	const router = createRouter({
		routeTree,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	await act(async () => {
		await router.load();
		root.render(<RouterProvider router={router} />);
	});
}

describe("RankingItemの部分更新", () => {
	it("表示設定とあらすじの操作で日時を再解析せず、開閉状態を維持すること", async () => {
		const parse = vi.spyOn(temporal, "parseDateTime");
		await mount();
		const parsed = parse.mock.calls.length;
		expect(parsed).toBeGreaterThan(0);
		expect(container.querySelector("h2")?.textContent).toBe("冒険 & 魔法");
		const button = container.querySelector("button")!;
		await act(async () => button.click());
		await vi.waitFor(() => expect(container.textContent).toContain(item.story));
		await act(async () => {
			store.set(showKeywordAtom, false);
			store.set(titleHeightAtom, 2);
		});
		expect(
			container.querySelector('a[href*="keyword="]')?.closest("[hidden]"),
		).not.toBeNull();
		expect(
			(
				container.querySelector("h2 a") as HTMLAnchorElement
			)?.style.getPropertyValue("--title-lines"),
		).toBe("2");
		expect(button.getAttribute("aria-expanded")).toBe("true");
		expect(container.textContent).toContain(item.story);
		expect(parse).toHaveBeenCalledTimes(parsed);
	});

	it("作品データの変更で日時・タイトル・キーワード・開いたあらすじを更新すること", async () => {
		const parse = vi.spyOn(temporal, "parseDateTime");
		await mount();
		await act(async () => container.querySelector("button")!.click());
		const parsed = parse.mock.calls.length;
		await act(async () =>
			queryClient.setQueryData(itemKey(item.ncode), {
				...item,
				title: "変更 &amp; 更新",
				keyword: "更新済み",
				story: "新しいあらすじ",
				novelupdated_at: "2026-11-02T15:30:00+09:00",
			}),
		);
		await vi.waitFor(async () => {
			await act(async () => {});
			expect(container.querySelector("h2")?.textContent).toBe("変更 & 更新");
			expect(container.textContent).toContain("2026/11/02 15:30:00");
			expect(container.textContent).toContain("新しいあらすじ");
			expect(container.querySelector('a[href*="keyword="]')?.textContent).toBe(
				"更新済み",
			);
		});
		expect(
			container.querySelector("button")?.getAttribute("aria-expanded"),
		).toBe("true");
		expect(parse).toHaveBeenCalledTimes(parsed + 1);
	});

	it("R18作品のリンクと作者の表示を維持すること", async () => {
		const { genre: _genre, userid: _userid, ...common } = item;
		await mount(true, { ...common, nocgenre: 1 });
		expect(container.querySelector("h2 a")?.getAttribute("href")).toBe(
			"/r18/detail/N1234AB",
		);
		expect(
			container.querySelector('a[href="https://novel18.syosetu.com/n1234ab/"]'),
		).not.toBeNull();
		expect(container.querySelector('a[href*="mypage.syosetu.com"]')).toBeNull();
		expect(container.textContent).toContain("作者 <名前>");
	});

	it("作品が見つからない場合も詳細リンクと読むリンクを維持すること", async () => {
		await mount(false, null);
		expect(container.querySelector("h2")?.textContent).toBe(
			"この小説は見つかりません",
		);
		expect(container.querySelector("h2 a")?.getAttribute("href")).toBe(
			"/detail/N1234AB",
		);
		expect(
			container.querySelector('a[href="https://ncode.syosetu.com/n1234ab/"]'),
		).not.toBeNull();
		expect(container.querySelector("button")).toBeNull();
	});
});
