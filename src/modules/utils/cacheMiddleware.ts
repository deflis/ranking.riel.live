import { createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";

export type CacheOptions = {
	/** ブラウザキャッシュの秒数 */
	maxAge?: number;
	/** 共有キャッシュ(CDN)の秒数 */
	sMaxAge?: number;
	/** stale-while-revalidate の秒数 */
	staleWhileRevalidate?: number;
	/** visibility: 'public' | 'private' | 'no-store' */
	visibility?: "public" | "private" | "no-store" | string;
};

/**
 * キャッシュミドルウェア
 */
/**
 * Cache-Control ヘッダを生成する
 */
export function createCacheControlHeader(options: CacheOptions = {}) {
	const {
        maxAge = 3600,
        sMaxAge = maxAge,
        staleWhileRevalidate = 60,
        visibility = "public",
    } = options;

	return visibility === "no-store"
		? "no-store"
		: `${visibility}, max-age=${Math.round(maxAge)}, s-maxage=${Math.round(
			sMaxAge,
		)}, stale-while-revalidate=${Math.round(staleWhileRevalidate)}`;
}

export function cacheMiddleware(options: CacheOptions = {}) {
	const headerValue = createCacheControlHeader(options);

	return createMiddleware().server(async ({ next }) => {
		const res = await next();

		if (res instanceof Response && res.status >= 400) {
			return res;
		}

		// キャッシュを設定する
		setResponseHeader("Cache-Control", headerValue);
		return res;
	});
}
