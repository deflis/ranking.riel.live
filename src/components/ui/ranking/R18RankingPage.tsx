import { useNavigate } from "@tanstack/react-router";
import { R18Site } from "narou";
import { useCallback } from "react";

import { R18RankingForm } from "@/components/ui/custom/R18RankingForm";
import { R18RankingRender } from "@/components/ui/ranking/R18RankingRender";
import type { R18RankingParams } from "@/modules/interfaces/CustomRankingParams";
import type { RankingType } from "@/modules/interfaces/RankingType";

export type R18RankingSearch = {
	keyword?: string;
	not_keyword?: string;
	by_title?: string;
	by_story?: string;
	sites?: string;
	min?: string;
	max?: string;
	first_update?: string;
	rensai?: string;
	kanketsu?: string;
	tanpen?: string;
};

const allSites = [
	R18Site.Nocturne,
	R18Site.MoonLight,
	R18Site.MoonLightBL,
	R18Site.Midnight,
];

import {
	buildR18RankingSearch,
	parseR18RankingParams,
} from "@/modules/utils/parseSearch";

export const R18RankingPage: React.FC<{
	rankingType: RankingType;
	search: R18RankingSearch;
}> = ({ rankingType, search }) => {
	const navigate = useNavigate();

	const params = parseR18RankingParams(rankingType, search);

	const handleSearch = useCallback(
		(newParams: R18RankingParams) => {
			navigate({
				to: "/r18/ranking/{-$type}",
				params: { type: newParams.rankingType },
				search: (_) => buildR18RankingSearch(newParams),
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
