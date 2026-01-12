import { createFileRoute } from "@tanstack/react-router";
import { parse } from "valibot";
import { R18RankingPage } from "../../components/ui/ranking/R18RankingPage";
import { RankingType } from "../../modules/interfaces/RankingType";

import { prefetchR18Ranking } from "@/modules/data/r18ranking";
import { parseR18RankingParams } from "@/modules/utils/parseSearch";
import { R18RankingSearchSchema } from "@/modules/validations/ranking";

export const Route = createFileRoute("/r18/")({
	validateSearch: (search: Record<string, unknown>) => {
		return parse(R18RankingSearchSchema, search);
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({ context: { queryClient }, deps: { search } }) => {
		const params = parseR18RankingParams(undefined, search);
		await prefetchR18Ranking(queryClient, params, 1);
	},
	component: R18RankingPageWrapper,
});

function R18RankingPageWrapper() {
	const search = Route.useSearch();
	return <R18RankingPage rankingType={RankingType.Daily} search={search} />;
}
