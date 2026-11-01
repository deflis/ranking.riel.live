// @vitest-environment happy-dom

import {
	QueryClient,
	QueryClientProvider,
	QueryErrorResetBoundary,
	useSuspenseQuery,
} from "@tanstack/react-query";
import { CatchBoundary } from "@tanstack/react-router";
import { act, Suspense } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ErrorFallback } from "./ErrorFallback";

let root: Root;
let container: HTMLDivElement;
let queryClient: QueryClient;

beforeEach(() => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	vi.spyOn(console, "error").mockImplementation(() => {});
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);
	queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
});

afterEach(async () => {
	await act(async () => root.unmount());
	queryClient.clear();
	container.remove();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe("CatchBoundary と Query のエラー回復", () => {
	it.each([1, 2])(
		"取得が%d回失敗しても再試行で内容を表示できること",
		async (failures) => {
			const queryFn = vi.fn(async () => "取得成功");
			for (let i = 0; i < failures; i++) {
				queryFn.mockRejectedValueOnce(new Error(`取得失敗 ${i + 1}`));
			}
			const queryOptions = { queryKey: ["retry-test"], queryFn };
			await queryClient.prefetchQuery(queryOptions);

			function Content() {
				const { data } = useSuspenseQuery(queryOptions);
				return <div>{data}</div>;
			}

			const render = () => (
				<QueryClientProvider client={queryClient}>
					<QueryErrorResetBoundary>
						<CatchBoundary
							getResetKey={() => ""}
							errorComponent={ErrorFallback}
						>
							<Suspense fallback={<div>読み込み中</div>}>
								<Content />
							</Suspense>
						</CatchBoundary>
					</QueryErrorResetBoundary>
				</QueryClientProvider>
			);
			await act(async () => root.render(render()));
			expect(container.textContent).toContain("エラーが発生しました");
			expect(container.textContent).toContain("取得失敗 1");

			// 親の再描画だけではエラーを解除せず、再試行操作を待つ。
			await act(async () => root.render(render()));
			expect(queryFn).toHaveBeenCalledTimes(1);
			expect(container.textContent).toContain("取得失敗 1");

			for (let i = 1; i <= failures; i++) {
				const retry = container.querySelector("button");
				expect(retry?.textContent).toBe("再試行");
				await act(async () => retry!.click());
				await vi.waitFor(async () => {
					await act(async () => {});
					expect(container.textContent).toContain(
						i < failures ? `取得失敗 ${i + 1}` : "取得成功",
					);
				});
				expect(queryFn).toHaveBeenCalledTimes(i + 1);
			}
			expect(container.querySelector("button")).toBeNull();
		},
	);
});
