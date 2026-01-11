import { useNavigate } from "@tanstack/react-router";
import { R18Site } from "narou";
import { useCallback } from "react";

import { R18RankingForm } from "@/components/ui/custom/R18RankingForm";
import { R18RankingRender } from "@/components/ui/ranking/R18RankingRender";
import type { R18RankingParams } from "@/modules/interfaces/CustomRankingParams";
import type { RankingType } from "@/modules/interfaces/RankingType";
import type { R18RankingSearchInput } from "@/modules/validations/ranking";

// We can remove the local R18RankingSearch definition or align it with R18RankingSearchInput
// Valibot's InferInput is what the schema accepts (string | number | ...).
// If `validateSearch` returns a transformed object (InferOutput), then `search` prop will be that.
// But we are passing `search` to `parseR18RankingParams`, which expects `unknown` (and validates with schema).
// Since the schema is now idempotent, passing InferOutput is valid (it satisfies InferInput too mostly, or we made it so).

// However, `validateSearch` in route returns `InferOutput<typeof R18RankingSearchSchema>`.
// So `search` prop here receives that output.
// We should type `search` as `R18RankingSearchOutput`?
// But `parseR18RankingParams` takes `unknown`.
// Let's use `unknown` or a flexible type to avoid `any`.

import { parseR18RankingParams } from "@/modules/utils/parseSearch";

export const R18RankingPage: React.FC<{
	rankingType: RankingType;
	search: unknown;
}> = ({ rankingType, search }) => {
	const navigate = useNavigate();

	const params = parseR18RankingParams(rankingType, search);

	const handleSearch = useCallback(
		(newParams: R18RankingParams) => {
			// We use a simplified object here for navigation, relying on serialization or schema handling.
			const nextSearch: Record<string, unknown> = {};
			if (newParams.keyword) nextSearch.keyword = newParams.keyword;
			if (newParams.notKeyword) nextSearch.not_keyword = newParams.notKeyword;
			if (newParams.byStory) nextSearch.by_story = "1";
			if (newParams.byTitle) nextSearch.by_title = "1";
			if (newParams.sites.length !== 0)
				nextSearch.sites = newParams.sites.join(",");
			if (newParams.max) nextSearch.max = newParams.max.toString();
			if (newParams.min) nextSearch.min = newParams.min.toString();
			if (newParams.firstUpdate)
				nextSearch.first_update = newParams.firstUpdate;
			if (newParams.rensai === false) nextSearch.rensai = "0";
			if (newParams.kanketsu === false) nextSearch.kanketsu = "0";
			if (newParams.tanpen === false) nextSearch.tanpen = "0";

			navigate({
				to: "/r18/ranking/{-$type}",
				params: { type: newParams.rankingType },
				search: nextSearch,
			});
		},
		[navigate],
	);

	return (
		<>
			<R18RankingForm params={params} onSearch={handleSearch} />
			<R18RankingRender params={params} />
		</>
	);
};
