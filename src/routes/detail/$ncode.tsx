import { createFileRoute } from "@tanstack/react-router";
import React from "react";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";
import { useDetailForView } from "@/modules/data/item";

import { prefetchDetail } from "@/modules/data/prefetch";
import { createCacheControlHeader } from "@/modules/utils/cacheMiddleware";

export const Route = createFileRoute("/detail/$ncode")({
	loader: async ({ context: { queryClient }, params: { ncode } }) => {
		await prefetchDetail(queryClient, ncode);
	},
	component: DetailPage,
	headers: () => ({
		"Cache-Control": createCacheControlHeader(),
	}),
});

function DetailPage() {
	const { ncode } = Route.useParams();

	return <DetailRenderer ncode={ncode} />;
}
