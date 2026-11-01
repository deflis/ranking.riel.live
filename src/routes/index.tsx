import { createFileRoute, redirect } from "@tanstack/react-router";

import {
	MAIN_PAGE_CACHE_OPTIONS,
	createCacheHeaders,
} from "@/modules/utils/cacheMiddleware";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({
			to: "/ranking/{-$type}/{-$date}",
		});
	},
	headers: () => createCacheHeaders(MAIN_PAGE_CACHE_OPTIONS),
});
