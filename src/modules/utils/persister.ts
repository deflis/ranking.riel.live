import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

export const persister =
	typeof window !== "undefined"
		? createSyncStoragePersister({
				storage: window.localStorage,
			})
		: createSyncStoragePersister({
				storage: undefined, // Returns no-op functions
			});
