import { R18Site } from "narou";
import React, { useCallback, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { R18RankingForm } from "@/components/ui/custom/R18RankingForm";
import { R18RankingRender } from "@/components/ui/ranking/R18RankingRender";
import { R18RankingParams } from "@/modules/interfaces/CustomRankingParams";
import { RankingType, RankingTypeName } from "@/modules/interfaces/RankingType";

type R18RankingSearch = {
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

export const Route = createFileRoute("/r18/ranking/$type")({
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
	component: R18RankingPage,
});

const allSites = [
	R18Site.Nocturne,
	R18Site.MoonLight,
	R18Site.MoonLightBL,
	R18Site.Midnight,
];

function R18RankingPage() {
	const { type } = Route.useParams();
	const search = Route.useSearch();
	const navigate = useNavigate();

	const rankingType = (type ?? RankingType.Daily) as RankingType;

	const boolean = (str: string | undefined, defaultValue: boolean): boolean => {
		return str === undefined ? defaultValue : str !== "0";
	};
	const int = (str: string | undefined): number | undefined => {
		return str !== undefined ? parseInt(str, 10) : undefined;
	};
	const conventSites = (rawSites: string | undefined): R18Site[] => {
		return (rawSites ?? "")
			.split(",")
			.map((x) => parseInt(x, 10) as R18Site)
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
				to: "/r18/ranking/$type",
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
}
