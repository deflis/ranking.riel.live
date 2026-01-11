import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { parse } from "valibot";

import { CustomRankingForm } from "@/components/ui/custom/CustomRankingForm";
import { CustomRankingRender } from "@/components/ui/ranking/CustomRankingRender";
import type { CustomRankingParams } from "@/modules/interfaces/CustomRankingParams";
import { CustomRankingSearchSchema } from "@/modules/validations/ranking";

import { prefetchCustomRanking } from "@/modules/data/custom";
import { parseCustomRankingParams } from "@/modules/utils/parseSearch";

export const Route = createFileRoute("/custom/{-$type}")({
	validateSearch: (search: Record<string, unknown>) => {
		// Use Valibot schema to validate and transform search params
		return parse(CustomRankingSearchSchema, search);
	},
	loaderDeps: ({ search }) => ({ search }),
	loader: async ({
		context: { queryClient },
		params: { type },
		deps: { search },
	}) => {
		// search is now fully typed and transformed
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
			const nextSearch: Record<string, unknown> = {};

			if (newParams.keyword) nextSearch.keyword = newParams.keyword;
			if (newParams.notKeyword) nextSearch.not_keyword = newParams.notKeyword;
			if (newParams.byStory) nextSearch.by_story = "1";
			if (newParams.byTitle) nextSearch.by_title = "1";
			if (newParams.genres.length !== 0)
				nextSearch.genres = newParams.genres.join(",");
			if (newParams.max) nextSearch.max = newParams.max;
			if (newParams.min) nextSearch.min = newParams.min;
			if (newParams.firstUpdate)
				nextSearch.first_update = newParams.firstUpdate;
			if (newParams.rensai === false) nextSearch.rensai = "0";
			if (newParams.kanketsu === false) nextSearch.kanketsu = "0";
			if (newParams.tanpen === false) nextSearch.tanpen = "0";

			navigate({
				to: "/custom/{-$type}",
				params: { type: newParams.rankingType },
				search: nextSearch,
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
