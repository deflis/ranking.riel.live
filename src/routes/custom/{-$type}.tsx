import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { Genre } from "narou";
import { useCallback } from "react";

import { CustomRankingForm } from "@/components/ui/custom/CustomRankingForm";
import { CustomRankingRender } from "@/components/ui/ranking/CustomRankingRender";
import { allGenres } from "@/modules/enum/Genre";
import type { CustomRankingParams } from "@/modules/interfaces/CustomRankingParams";
import { RankingType } from "@/modules/interfaces/RankingType";

type CustomRankingSearch = {
	keyword?: string;
	not_keyword?: string;
	by_title?: string;
	by_story?: string;
	genres?: string;
	min?: string;
	max?: string;
	first_update?: string;
	rensai?: string;
	kanketsu?: string;
	tanpen?: string;
};

import { prefetchCustomRanking } from "@/modules/data/custom";
import {
	buildCustomRankingSearch,
	parseCustomRankingParams,
} from "@/modules/utils/parseSearch";

export const Route = createFileRoute("/custom/{-$type}")({
	validateSearch: (search: Record<string, unknown>): CustomRankingSearch => {
		return {
			keyword: search.keyword as string | undefined,
			not_keyword: search.not_keyword as string | undefined,
			by_title: search.by_title as string | undefined,
			by_story: search.by_story as string | undefined,
			genres: search.genres as string | undefined,
			min: search.min as string | undefined,
			max: search.max as string | undefined,
			first_update: search.first_update as string | undefined,
			rensai: search.rensai as string | undefined,
			kanketsu: search.kanketsu as string | undefined,
			tanpen: search.tanpen as string | undefined,
		};
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({
		context: { queryClient },
		params: { type },
		deps: { search },
	}) => {
		const params = parseCustomRankingParams(type, search);
		await prefetchCustomRanking(queryClient, params, 1);
	},
	component: CustomRankingPage,
});

function CustomRankingPage() {
	const { type } = Route.useParams();
	const search = Route.useSearch();
	const navigate = useNavigate();

	const params = parseCustomRankingParams(type, search);

	const handleSearch = useCallback(
		(newParams: CustomRankingParams) => {
			navigate({
				to: "/custom/{-$type}",
				params: { type: newParams.rankingType },
				search: (_) => buildCustomRankingSearch(newParams),
			});
		},
		[navigate],
	);

	return (
		<>
			<CustomRankingForm params={params} onSearch={handleSearch} />
			<CustomRankingRender params={params} />
		</>
	);
}
