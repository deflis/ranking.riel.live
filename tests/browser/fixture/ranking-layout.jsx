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
import { Fragment, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { LoadMore } from "../../../src/components/ui/ranking/LoadMore";
import RankingItem, {
	R18RankingItem,
} from "../../../src/components/ui/ranking/RankingItem";
import { RankingRows } from "../../../src/components/ui/ranking/RankingRows";
import {
	showKeywordAtom,
	titleHeightAtom,
} from "../../../src/modules/atoms/global";
import { itemKey } from "../../../src/modules/data/item";
import { itemKey as r18ItemKey } from "../../../src/modules/data/r18item";
import { chunk } from "../../../src/modules/utils/chunk";

import "./styles.css";

const client = new QueryClient({
	defaultOptions: {
		queries: { staleTime: Infinity, refetchOnMount: false, retry: false },
	},
});
const store = createStore();
const novels = Array.from({ length: 300 }, (_, index) => ({
	ncode: `N${String(index).padStart(4, "0")}AB`,
	title:
		index % 2 === 0
			? "長い作品タイトルと冒険の物語 ".repeat(8)
			: "短いタイトル",
	writer: "作者",
	userid: 123,
	genre: 101,
	nocgenre: 1,
	noveltype: 1,
	end: 1,
	length: 100000,
	general_all_no: 100,
	general_firstup: "2026-10-01T12:00:00+09:00",
	general_lastup: "2026-11-01T12:00:00+09:00",
	novelupdated_at: "2026-11-01T12:00:00+09:00",
	keyword:
		index % 2 === 0
			? Array.from({ length: 20 }, (_, i) => `キーワード${i}`).join(" ")
			: "冒険 魔法",
	story: "あらすじの本文です。".repeat(40),
}));
novels.forEach((item) => {
	client.setQueryData(itemKey(item.ncode), item);
	client.setQueryData(r18ItemKey(item.ncode), item);
});

function check(condition, message) {
	if (!condition) throw new Error(message);
}
function complete(result) {
	document.documentElement.dataset.browserResult = btoa(
		String.fromCharCode(...new TextEncoder().encode(JSON.stringify(result))),
	);
}
// setTimeoutはheadlessのvirtual-timeでも実行し、各確認で実際のレイアウトを強制する。
const settle = () => new Promise((done) => setTimeout(done, 150));
const rowCards = (row) => [...row.querySelectorAll(":scope > .row-span-8")];
function assertSubgrid(cards) {
	for (const card of cards) {
		const style = getComputedStyle(card);
		check(
			style.gridTemplateRows.startsWith("subgrid"),
			`Card row subgrid was disabled: rows=${style.gridTemplateRows}, display=${style.display}, row=${style.gridRow}, visibility=${style.contentVisibility}`,
		);
	}
}
function assertAligned(cards) {
	assertSubgrid(cards);
	if (innerWidth < 768) return;
	const [left, right] = cards;
	check(
		left.children.length === 8 && right.children.length === 8,
		"Expected eight card fields",
	);
	for (let index = 0; index < 8; index++) {
		const a = left.children[index].getBoundingClientRect();
		const b = right.children[index].getBoundingClientRect();
		check(
			Math.abs(a.top - b.top) <= 1,
			`Card field ${index} is misaligned: ${a.top} / ${b.top}`,
		);
	}
}
async function runChecks() {
	await settle();
	const rows = [...document.querySelectorAll("[data-ranking-row]")];
	check(rows.length === 150, "All 300 cards must remain in the DOM");
	check(
		document.querySelectorAll("[data-ad-slot]").length === 30,
		"Ad slots must remain outside card rows",
	);
	const first = rowCards(rows[0]);
	check(
		first[0].querySelector("h2").textContent.length >
			first[1].querySelector("h2").textContent.length * 5,
		"Fixture must contain unequal titles",
	);
	assertAligned(first);
	const originalHeights = first.map(
		(card) => card.getBoundingClientRect().height,
	);
	// 行側の描画省略を解除しても、表示中カードの高さや行揃えが変わらないこと。
	rows[0].style.contentVisibility = "visible";
	assertAligned(first);
	first.forEach((card, index) =>
		check(
			Math.abs(card.getBoundingClientRect().height - originalHeights[index]) <=
				1,
			"Containment changed the visible card height",
		),
	);
	rows[0].style.removeProperty("content-visibility");
	const storyButton = first[0].querySelector("button");
	storyButton.click();
	await settle();
	check(
		storyButton.getAttribute("aria-expanded") === "true",
		"Story did not open",
	);
	assertAligned(first);
	store.set(showKeywordAtom, false);
	store.set(titleHeightAtom, 2);
	await settle();
	assertAligned(first);
	check(
		storyButton.getAttribute("aria-expanded") === "true",
		"Settings lost the story state",
	);
	check(
		first[0].querySelector("h2 a").classList.contains("line-clamp-2"),
		"Title setting was not applied",
	);
	// 画面外だった最後の通常/R18ペアも、表示すると正しいsubgridになること。
	const last = rowCards(rows.at(-1));
	last[0].scrollIntoView({ block: "start" });
	await settle();
	assertAligned(last);
	last[1].querySelector("h2 a").focus();
	await settle();
	const focused = document.activeElement.getBoundingClientRect();
	check(
		last[1].contains(document.activeElement) &&
			focused.bottom > 0 &&
			focused.top < innerHeight,
		"Offscreen card could not receive visible focus",
	);
	document.querySelector("[data-load-more]").scrollIntoView({ block: "end" });
	await settle();
	const more = document
		.querySelector("[data-load-more]")
		.getBoundingClientRect();
	check(more.bottom > 0 && more.top < innerHeight, "Load more was unreachable");
	check(
		!document.querySelector(
			"[data-ranking-row] [data-ad-slot], [data-ranking-row] [data-load-more]",
		),
		"Ads or load more were put inside containment",
	);
	complete({
		passed: true,
		width: innerWidth,
		cards: 300,
		checks: [
			"unequal-content alignment",
			"subgrid",
			"story and settings",
			"offscreen focus",
			"ads and load more",
		],
	});
}

function Listing() {
	useEffect(() => {
		runChecks().catch((error) =>
			complete({ passed: false, error: error.stack }),
		);
	}, []);
	return (
		<main className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
			{chunk(novels, 10).map((group) => (
				<Fragment key={group[0].ncode}>
					<RankingRows
						items={group.map((item, index) =>
							index % 2 === 0 ? (
								<RankingItem
									key={item.ncode}
									item={{ ncode: item.ncode, rank: index + 1, pt: 1234 }}
								/>
							) : (
								<R18RankingItem
									key={item.ncode}
									item={{ ncode: item.ncode, rank: index + 1, pt: 1234 }}
								/>
							),
						)}
					/>
					<div data-ad-slot className="col-span-full h-24">
						広告枠
					</div>
				</Fragment>
			))}
			<div data-load-more className="col-span-full">
				<LoadMore onLoadMore={() => {}} />
			</div>
		</main>
	);
}
const root = createRootRoute({
	component: () => (
		<QueryClientProvider client={client}>
			<Provider store={store}>
				<Outlet />
			</Provider>
		</QueryClientProvider>
	),
});
const index = createRoute({
	getParentRoute: () => root,
	path: "/",
	component: Listing,
});
const paths = [
	"detail/$ncode",
	"r18/detail/$ncode",
	"custom/{-$type}",
	"r18/ranking/{-$type}",
];
const router = createRouter({
	routeTree: root.addChildren([
		index,
		...paths.map((path) =>
			createRoute({ getParentRoute: () => root, path, component: () => null }),
		),
	]),
	history: createMemoryHistory({ initialEntries: ["/"] }),
});
await router.load();
createRoot(document.getElementById("app")).render(
	<RouterProvider router={router} />,
);
