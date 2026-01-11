import type { Genre } from "narou";
import { useCallback } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

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
		}
	},
	component: CustomRankingPage,
});

function CustomRankingPage() {
	const { type } = Route.useParams();
	const search = Route.useSearch();
	const navigate = useNavigate();

	const rankingType = (type ?? RankingType.Daily) as RankingType;

	const boolean = (str: string | undefined, defaultValue: boolean): boolean => {
		return str === undefined ? defaultValue : str !== "0";
	}
	const int = (str: string | undefined): number | undefined => {
		return str !== undefined ? Number.parseInt(str, 10) : undefined;
	}
	const conventGenres = (rawGenres: string | undefined): Genre[] => {
		return (rawGenres ?? "")
			.split(",")
			.map((x) => Number.parseInt(x, 10) as Genre)
			.filter((x) => allGenres.includes(x));
	}

	const params: CustomRankingParams = {
		keyword: search.keyword,
		notKeyword: search.not_keyword,
		byStory: boolean(search.by_story, false),
		byTitle: boolean(search.by_title, false),
		genres: conventGenres(search.genres),
		max: int(search.max),
		min: int(search.min),
		firstUpdate: search.first_update,
		rensai: boolean(search.rensai, true),
		kanketsu: boolean(search.kanketsu, true),
		tanpen: boolean(search.tanpen, true),
		rankingType,
	}

	const handleSearch = useCallback(
		(newParams: CustomRankingParams) => {
			const nextSearch: CustomRankingSearch = {};
			if (newParams.keyword) nextSearch.keyword = newParams.keyword;
			if (newParams.notKeyword) nextSearch.not_keyword = newParams.notKeyword;
			if (newParams.byStory) nextSearch.by_story = "1";
			if (newParams.byTitle) nextSearch.by_title = "1";
			if (newParams.genres.length !== 0)
				nextSearch.genres = newParams.genres.join(",");
			if (newParams.max) nextSearch.max = newParams.max.toString();
			if (newParams.min) nextSearch.min = newParams.min.toString();
			if (newParams.firstUpdate)
				nextSearch.first_update = newParams.firstUpdate;
			if (newParams.rensai === false) nextSearch.rensai = "0";
			if (newParams.kanketsu === false) nextSearch.kanketsu = "0";
			if (newParams.tanpen === false) nextSearch.tanpen = "0";

			navigate({
				to: "/custom/{-$type}",
				params: { type: newParams.rankingType },
				search: nextSearch,
			})
		},
		[navigate],
	)

	return (
		<>
			<CustomRankingForm params={params} onSearch={handleSearch} />
			<CustomRankingRender params={params} />
		</>
	)
}
