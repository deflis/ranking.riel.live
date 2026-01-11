import { createFileRoute } from "@tanstack/react-router";

import {
	R18RankingPage,
	type R18RankingSearch,
} from "@/components/ui/ranking/R18RankingPage";
import { RankingType } from "@/modules/interfaces/RankingType";

export const Route = createFileRoute("/r18/ranking/{-$type}")({
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
	component: R18RankingPageWrapper,
});

function R18RankingPageWrapper() {
	const { type } = Route.useParams();
	const search = Route.useSearch();

	const rankingType = (type ?? RankingType.Daily) as RankingType;
	return <R18RankingPage rankingType={rankingType} search={search} />;
}
