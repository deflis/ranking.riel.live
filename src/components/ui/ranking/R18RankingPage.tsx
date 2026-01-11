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

export const R18RankingPage: React.FC<{
	rankingType: RankingType;
	search: R18RankingSearch;
}> = ({ rankingType, search }) => {
	const navigate = useNavigate();

	const boolean = (str: string | undefined, defaultValue: boolean): boolean => {
		return str === undefined ? defaultValue : str !== "0";
	};
	const int = (str: string | undefined): number | undefined => {
		return str !== undefined ? Number.parseInt(str, 10) : undefined;
	};
	const conventSites = (rawSites: string | undefined): R18Site[] => {
		return (rawSites ?? "")
			.split(",")
			.map((x) => Number.parseInt(x, 10) as R18Site)
			.filter((x) => allSites.includes(x));
	};

	const params: R18RankingParams = {
		keyword: search.keyword,
		notKeyword: search.not_keyword,
		byStory: boolean(search.by_story, false),
		byTitle: boolean(search.by_title, false),
		sites: conventSites(search.sites),
		max: int(search.max),
		min: int(search.min),
		firstUpdate: search.first_update,
		rensai: boolean(search.rensai, true),
		kanketsu: boolean(search.kanketsu, true),
		tanpen: boolean(search.tanpen, true),
		rankingType,
	};

	const handleSearch = useCallback(
		(newParams: R18RankingParams) => {
			const nextSearch: R18RankingSearch = {};
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
