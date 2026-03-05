import { env } from "cloudflare:workers";

type KvCacheOptions = {
	/** キャッシュのTTL（秒） */
	ttl?: number;
};

/**
 * 複数キーのKVキャッシュを取得し、ヒット/ミスを返す
 * キーはlower caseに正規化される
 */
export async function getManyCached<T>(
	prefix: string,
	keys: readonly string[],
	options?: KvCacheOptions,
): Promise<{ hits: Map<string, T>; misses: string[] }> {
	const kv = env.CACHE;
	const normalizedKeys = keys.map((k) => k.toLowerCase());
	const prefixedKeys = normalizedKeys.map((k) => `${prefix}:${k}`);

	const hits = new Map<string, T>();
	const misses: string[] = [];

	const MAX_KV_BULK_GET = 100;
	const promises: Promise<Map<string, T | null>>[] = [];

	for (let i = 0; i < prefixedKeys.length; i += MAX_KV_BULK_GET) {
		const chunk = prefixedKeys.slice(i, i + MAX_KV_BULK_GET);
		promises.push(kv.get<T>(chunk, "json"));
	}

	const results = await Promise.all(promises);

	for (let i = 0; i < prefixedKeys.length; i++) {
		const normalizedKey = normalizedKeys[i];
		const prefixedKey = prefixedKeys[i];
		const chunkIndex = Math.floor(i / MAX_KV_BULK_GET);
		const resultMap = results[chunkIndex];

		const value = resultMap.get(prefixedKey);
		if (value !== null && value !== undefined) {
			hits.set(normalizedKey, value);
		} else {
			misses.push(normalizedKey);
		}
	}

	return { hits, misses };
}

/**
 * 複数キーをKVに保存
 * キーはlower caseに正規化される
 */
export async function putManyCached<T>(
	prefix: string,
	entries: [string, T][],
	options?: KvCacheOptions,
): Promise<void> {
	const kv = env.CACHE;
	const ttl = options?.ttl ?? 3600;
	// 保存を待たずにバックグラウンドで実行
	Promise.all(
		entries.map(([key, value]) =>
			kv.put(`${prefix}:${key.toLowerCase()}`, JSON.stringify(value), {
				expirationTtl: ttl,
			}),
		),
	).catch(console.error);
}
