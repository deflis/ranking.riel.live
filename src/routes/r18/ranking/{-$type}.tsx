import { createFileRoute } from "@tanstack/react-router";
import { parse } from "valibot";

import { R18RankingPage } from "@/components/ui/ranking/R18RankingPage";
import { RankingType } from "@/modules/interfaces/RankingType";
import { R18RankingSearchSchema } from "@/modules/validations/ranking";

import { prefetchR18Ranking } from "@/modules/data/r18ranking";
import { parseR18RankingParams } from "@/modules/utils/parseSearch";

export const Route = createFileRoute("/r18/ranking/{-$type}")({
	validateSearch: (search: Record<string, unknown>) => {
		return parse(R18RankingSearchSchema, search);
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({
		context: { queryClient },
		params: { type },
		deps: { search },
	}) => {
		const params = parseR18RankingParams(type, search);
		await prefetchR18Ranking(queryClient, params, 1);
	},
	component: R18RankingPageWrapper,
});

function R18RankingPageWrapper() {
	const { type } = Route.useParams();
	const search = Route.useSearch();

	const rankingType = (type ?? RankingType.Daily) as RankingType;
	// Note: search object is now typed (boolean, number, array), not string | undefined.
	// We need to check if R18RankingPage expects R18RankingSearch (strings) or capable of handling typed object.
	// If R18RankingPage expects strings, we might have a type mismatch.
	// Let's verify R18RankingPage.
	return <R18RankingPage rankingType={rankingType} search={search} />;
}
