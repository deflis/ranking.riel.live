/** Workers Cacheの暗黙のTTLを避け、公開ランキングのHTMLだけを保存する。 */
export function applySsrCachePolicy(
	request: Request,
	response: Response,
): Response {
	const url = new URL(request.url);
	const cacheable =
		request.method === "GET" &&
		/^\/ranking(?:\/|$)/.test(url.pathname) &&
		!url.search &&
		!request.headers.has("authorization") &&
		!request.headers.has("cookie") &&
		request.headers.get("accept")?.includes("text/html") &&
		response.status === 200 &&
		response.headers.get("content-type")?.includes("text/html") &&
		!response.headers.has("set-cookie") &&
		response.headers.get("cache-control")?.startsWith("public,");

	if (cacheable) return response;

	const result = new Response(response.body, response);
	result.headers.set("Cache-Control", "no-store");
	result.headers.set("CDN-Cache-Control", "no-store");
	result.headers.set("Cloudflare-CDN-Cache-Control", "no-store");
	return result;
}
