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

type CacheHeaders = {
	readonly "Cache-Control": string;
	readonly "CDN-Cache-Control"?: string;
};

/**
 * キャッシュヘッダを生成する
 */
export function createCacheHeaders(options: CacheOptions = {}): CacheHeaders {
	const {
		maxAge = 3600,
		sMaxAge = maxAge,
		staleWhileRevalidate = 60,
		visibility = "public",
	} = options;

	if (visibility === "no-store") {
		return {
			"Cache-Control": "no-store",
		};
	}

	const cacheControl = `${visibility}, max-age=${Math.round(
		maxAge,
	)}, s-maxage=${Math.round(sMaxAge)}, stale-while-revalidate=${Math.round(
		staleWhileRevalidate,
	)}`;

	const cdnCacheControl = `s-maxage=${Math.round(
		sMaxAge,
	)}, stale-while-revalidate=${Math.round(staleWhileRevalidate)}`;
	return {
		"Cache-Control": cacheControl,
		"CDN-Cache-Control": cdnCacheControl,
	};
}

/**
 * キャッシュミドルウェア
 */
export function cacheMiddleware(options: CacheOptions = {}) {
	const headers = createCacheHeaders(options);
	const cacheControlHeader = headers["Cache-Control"];
	const cdnCacheControlHeader = headers["CDN-Cache-Control"];

	return createMiddleware().server(async ({ next }) => {
		const res = await next();

		if (res instanceof Response && res.status >= 400) {
			return res;
		}

		// キャッシュを設定する
		setResponseHeader("Cache-Control", cacheControlHeader);
		if (cdnCacheControlHeader) {
			setResponseHeader("CDN-Cache-Control", cdnCacheControlHeader);
		}
		return res;
	});
}
