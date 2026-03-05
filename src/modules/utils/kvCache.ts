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
	const results = await Promise.all(
		normalizedKeys.map(async (key) => {
			const cached = await kv.get(`${prefix}:${key}`, "json");
			return [key, cached] as const;
		}),
	);
	const hits = new Map<string, T>();
	const misses: string[] = [];
	for (const [key, value] of results) {
		if (value !== null) hits.set(key, value as T);
		else misses.push(key);
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
	await Promise.all(
		entries.map(([key, value]) =>
			kv.put(`${prefix}:${key.toLowerCase()}`, JSON.stringify(value), {
				expirationTtl: ttl,
			}),
		),
	);
}
