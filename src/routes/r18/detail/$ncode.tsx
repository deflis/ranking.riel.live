import { createFileRoute } from "@tanstack/react-router";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";

import { itemFetcher, itemKey } from "@/modules/data/item";
import { prefetchR18Detail } from "@/modules/data/r18item";
import {
	MAIN_PAGE_CACHE_OPTIONS,
	createCacheHeaders,
} from "@/modules/utils/cacheMiddleware";

export const Route = createFileRoute("/r18/detail/$ncode")({
	ssr: false,
	loader: async ({ context: { queryClient }, params: { ncode } }) => {
		const listing = await queryClient.ensureQueryData({
			queryKey: itemKey(ncode),
			queryFn: itemFetcher,
		});
		prefetchR18Detail(queryClient, ncode);
		return { title: listing?.title ?? null };
	},
	component: R18DetailPage,
	head: ({ loaderData, params: { ncode } }) => ({
		meta: [
			{
				title: `${loaderData?.title ?? ncode.toUpperCase()} - なろうランキングビューワ`,
			},
		],
	}),
	headers: () => createCacheHeaders(MAIN_PAGE_CACHE_OPTIONS),
});

function R18DetailPage() {
	const { ncode } = Route.useParams();

	return <DetailRenderer ncode={ncode} isR18={true} />;
}
