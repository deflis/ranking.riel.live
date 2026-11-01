import { describe, expect, it } from "vitest";

import { createCacheHeaders } from "../cacheMiddleware";
import { applySsrCachePolicy } from "../ssrCache";

function html(status = 200) {
	return new Response("ranking", {
		status,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			...createCacheHeaders({ maxAge: 300, sMaxAge: 300 }),
		},
	});
}

describe("SSRキャッシュポリシー", () => {
	it.each(["/ranking", "/ranking/d/2026-11-01"])(
		"公開ランキング%sのTTLと本文を維持する",
		async (path) => {
			const response = html();
			const result = applySsrCachePolicy(
				new Request(`https://example.com${path}`, {
					headers: { Accept: "text/html" },
				}),
				response,
			);
			expect(result).toBe(response);
			expect(result.headers.get("CDN-Cache-Control")).toBe("max-age=300");
			expect(await result.text()).toBe("ranking");
		},
	);

	it.each([
		["/ranking", {}, 500],
		["/ranking", {}, 404],
		["/ranking?__tsr=1", {}, 200],
		["/ranking", { Authorization: "Bearer token" }, 200],
		["/ranking", { Cookie: "session=1" }, 200],
		["/ranking", { Accept: "application/json" }, 200],
		["/_server/example", {}, 200],
		["/unknown", {}, 200],
	] as const)(
		"%sの対象外レスポンスを保存しない (%j, %s)",
		(path, headers, status) => {
			const result = applySsrCachePolicy(
				new Request(`https://example.com${path}`, {
					headers: { Accept: "text/html", ...headers },
				}),
				html(status),
			);
			expect(result.headers.get("Cache-Control")).toBe("no-store");
			expect(result.headers.get("CDN-Cache-Control")).toBe("no-store");
		},
	);

	it("Cookieを設定するレスポンスを保存しない", () => {
		const response = html();
		response.headers.set("Set-Cookie", "session=1");
		const result = applySsrCachePolicy(
			new Request("https://example.com/ranking", {
				headers: { Accept: "text/html" },
			}),
			response,
		);
		expect(result.headers.get("Cache-Control")).toBe("no-store");
	});
});
