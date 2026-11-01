import { useAtomValue, useStore } from "jotai";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { titleHeightAtom } from "./modules/atoms/global";
import { getRouter } from "./router";

vi.mock("./routeTree.gen", async () => {
	const { createRootRoute } = await import("@tanstack/react-router");
	return { routeTree: createRootRoute() };
});

describe("ルーターごとのJotaiストア", () => {
	it("リクエスト間では分離し、同じルーター内では状態を維持すること", () => {
		const first = getRouter();
		const second = getRouter();
		const FirstWrap = first.options.Wrap!;
		const SecondWrap = second.options.Wrap!;
		function SetHeight() {
			useStore().set(titleHeightAtom, 7);
			return null;
		}
		function Height() {
			return <span>{useAtomValue(titleHeightAtom)}</span>;
		}
		const render = (Wrap: typeof FirstWrap, children: ReactNode) =>
			renderToString(<Wrap>{children}</Wrap>);

		render(FirstWrap, <SetHeight />);
		expect(render(FirstWrap, <Height />)).toBe("<span>7</span>");
		expect(render(SecondWrap, <Height />)).toBe("<span>0</span>");
	});
});
