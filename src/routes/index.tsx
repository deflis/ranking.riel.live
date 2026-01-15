import { createCacheHeaders } from "@/modules/utils/cacheMiddleware";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: () => {
		throw redirect({
			to: "/ranking/{-$type}/{-$date}",
		});
	},
	headers: () => createCacheHeaders(),
});
