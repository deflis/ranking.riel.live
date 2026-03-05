import { createFileRoute } from "@tanstack/react-router";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";

import { prefetchDetail } from "@/modules/data/prefetch";
import { createCacheHeaders } from "@/modules/utils/cacheMiddleware";

export const Route = createFileRoute("/detail/$ncode")({
	loader: async ({ context: { queryClient }, params: { ncode } }) => {
		await prefetchDetail(queryClient, ncode);
	},
	component: DetailPage,
	headers: () => createCacheHeaders(),
});

function DetailPage() {
	const { ncode } = Route.useParams();

	return <DetailRenderer ncode={ncode} />;
}
