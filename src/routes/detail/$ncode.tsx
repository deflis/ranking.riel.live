import { createFileRoute } from "@tanstack/react-router";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";

import { prefetchDetail } from "@/modules/data/prefetch";
import {
	MAIN_PAGE_CACHE_OPTIONS,
	createCacheHeaders,
} from "@/modules/utils/cacheMiddleware";

export const Route = createFileRoute("/detail/$ncode")({
	ssr: false,
	loader: async ({ context: { queryClient }, params: { ncode } }) => {
		const title = await prefetchDetail(queryClient, ncode);
		return { title };
	},
	component: DetailPage,
	head: ({ loaderData, params: { ncode } }) => ({
		meta: [
			{
				title: `${loaderData?.title ?? ncode.toUpperCase()} - なろうランキングビューワ`,
			},
		],
	}),
	headers: () => createCacheHeaders(MAIN_PAGE_CACHE_OPTIONS),
});

function DetailPage() {
	const { ncode } = Route.useParams();

	return <DetailRenderer ncode={ncode} />;
}
