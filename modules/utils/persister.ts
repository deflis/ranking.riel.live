import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { DateTime } from "luxon";

/**
 * キャッシュからパースするときに日付ならLuxonでパースする
 */
function reviver(key: string, value: any) {
  if (typeof value === "string") {
    const date = DateTime.fromISO(value);
    if (date.isValid) {
      return date;
    }
  }
  return value;
}

function deserialize<T>(data: string): T {
  return JSON.parse(data, reviver);
}

export const persister = createSyncStoragePersister({
  storage: window.localStorage,
  deserialize,
});
