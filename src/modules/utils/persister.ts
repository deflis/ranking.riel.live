import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { DateTime } from "luxon";

/**
 * キャッシュからパースするときに日付ならLuxonでパースする
 */
function reviver(key: string, value: unknown): unknown {
	if (typeof value === "string") {
		if (!/^\d{4}-\d{2}-\d{2}(?:[T\s].*)?$/.test(value)) {
			return value;
		}
		const date = DateTime.fromISO(value, { zone: "Asia/Tokyo" });
		if (date.isValid) {
			return date;
		}
	}
	return value;
}

function deserialize<T>(data: string): T {
	return JSON.parse(data, reviver);
}

export const persister =
	typeof window !== "undefined"
		? createSyncStoragePersister({
				storage: window.localStorage,
				deserialize,
			})
		: createSyncStoragePersister({
				storage: undefined, // Returns no-op functions
			});
