// @vitest-environment happy-dom

import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { act } from "react";
import { type Root, createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getRouter } from "./router";

vi.mock("./routes/__root", async () => {
	const { Outlet, createRootRoute } = await import("@tanstack/react-router");
	return { Route: createRootRoute({ component: Outlet }) };
});
vi.mock("./modules/data/prefetch", () => ({
	prefetchR18Ranking: vi.fn(),
	prefetchR18Detail: vi.fn(),
	prefetchRanking: vi.fn(),
	prefetchDetail: vi.fn(),
	prefetchCustomRanking: vi.fn(),
}));
vi.mock("./components/ui/common/AdSense", () => ({ default: () => null }));
vi.mock("./modules/data/ranking", () => ({
	default: () => ({ data: [] }),
}));
vi.mock("./components/ui/ranking/R18RankingPage", () => ({
	R18RankingPage: () => <div>R18ランキング</div>,
}));
vi.mock("./components/ui/detail/DetailRenderer", () => ({
	DetailRenderer: () => <div>作品詳細</div>,
}));
vi.mock("./components/ui/ranking/RankingRender", () => ({
	RankingRender: () => <div>通常ランキング</div>,
}));

let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	localStorage.clear();
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(async () => {
	await act(async () => root.unmount());
	container.remove();
	localStorage.clear();
	vi.unstubAllGlobals();
});

async function visit(path: string) {
	const router = getRouter();
	router.update({
		context: router.options.context,
		history: createMemoryHistory({ initialEntries: [path] }),
		defaultPendingMinMs: 0,
	});
	await act(async () => {
		await router.load();
		root.render(<RouterProvider router={router} />);
	});
	return router;
}

function button(label: string) {
	const found = Array.from(document.querySelectorAll("button")).find((item) =>
		item.textContent?.includes(label),
	);
	expect(found).toBeDefined();
	return found!;
}

describe("R18ルートの年齢確認", () => {
	it.each(["/r18", "/r18/ranking/d", "/r18/detail/n1234ab"])(
		"未確認で%sに直接アクセスすると確認を表示すること",
		async (path) => {
			await visit(path);
			expect(document.querySelector('[role="dialog"]')?.textContent).toContain(
				"あなたは18歳以上ですか？",
			);
		},
	);

	it("確認済みの保存値を復元した場合はダイアログを表示しないこと", async () => {
		localStorage.setItem("r18", "true");
		const dialogs: Element[] = [];
		const observer = new MutationObserver(() => {
			dialogs.push(...document.querySelectorAll('[role="dialog"]'));
		});
		observer.observe(document.body, { childList: true, subtree: true });
		try {
			await visit("/r18");
			expect(document.querySelector('[role="dialog"]')).toBeNull();
			expect(dialogs).toHaveLength(0);
		} finally {
			observer.disconnect();
		}
	});

	it("18歳以上を選ぶと保存し、別のR18ページでも再表示しないこと", async () => {
		const router = await visit("/r18");
		await act(async () => button("18歳以上である").click());
		expect(localStorage.getItem("r18")).toBe("true");
		await act(async () => {
			await router.navigate({ to: "/about" });
			await router.navigate({
				to: "/r18/detail/$ncode",
				params: { ncode: "n1234ab" },
			});
		});
		expect(document.querySelector('[role="dialog"]')).toBeNull();
		expect(container.textContent).toContain("作品詳細");
	});

	it("18歳未満を選ぶと通常ランキングへ戻り、確認済みにしないこと", async () => {
		const router = await visit("/r18");
		await act(async () => {
			button("18歳未満である").click();
			await router.load();
		});
		expect(router.state.location.pathname).toBe("/ranking");
		expect(localStorage.getItem("r18")).toBeNull();
		expect(document.querySelector('[role="dialog"]')).toBeNull();
	});

	it("通常ページには年齢確認を表示しないこと", async () => {
		await visit("/about");
		expect(document.querySelector('[role="dialog"]')).toBeNull();
	});

	it("Escapeで閉じた場合も通常ランキングへ戻ること", async () => {
		const router = await visit("/r18/detail/n1234ab");
		await act(async () => {
			document.dispatchEvent(
				new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
			);
			await router.load();
		});
		expect(router.state.location.pathname).toBe("/ranking");
		expect(localStorage.getItem("r18")).toBeNull();
	});
});
