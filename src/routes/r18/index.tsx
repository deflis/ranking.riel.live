import { createFileRoute } from "@tanstack/react-router";
import {
	R18RankingPage,
	type R18RankingSearch,
} from "../../components/ui/ranking/R18RankingPage";
import { RankingType } from "../../modules/interfaces/RankingType";

import { prefetchR18Ranking } from "@/modules/data/r18ranking";
import { createCacheHeaders } from "@/modules/utils/cacheMiddleware";
import { parseR18RankingParams } from "@/modules/utils/parseSearch";

export const Route = createFileRoute("/r18/")({
	validateSearch: (search: Record<string, unknown>): R18RankingSearch => {
		return {
			keyword: search.keyword as string | undefined,
			not_keyword: search.not_keyword as string | undefined,
			by_title: search.by_title as string | undefined,
			by_story: search.by_story as string | undefined,
			sites: search.sites as string | undefined,
			min: search.min as string | undefined,
			max: search.max as string | undefined,
			first_update: search.first_update as string | undefined,
			rensai: search.rensai as string | undefined,
			kanketsu: search.kanketsu as string | undefined,
			tanpen: search.tanpen as string | undefined,
		};
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		const params = parseR18RankingParams(undefined, search);
		await prefetchR18Ranking(queryClient, params, 1);
	},
	component: R18RankingPageWrapper,
	headers: () => createCacheHeaders(),
});

function R18RankingPageWrapper() {
	const search = Route.useSearch();
	return <R18RankingPage rankingType={RankingType.Daily} search={search} />;
}
