import { Genre } from "narou";
import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchParam, useTitle } from "react-use";

import { allGenres } from "../../modules/enum/Genre";
import { CustomRankingParams } from "../../modules/interfaces/CustomRankingParams";
import {
  RankingType,
  RankingTypeName,
} from "../../modules/interfaces/RankingType";
import { CustomRankingForm } from "../ui/custom/CustomRankingForm";
import { CustomRankingRender } from "../ui/ranking/CustomRankingRender";

export type CustomRankingPathParams = {
  type?: RankingType;
};

export type CustomRankingQueryParams = {
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

function createSearchParams({
  keyword,
  notKeyword,
  byStory,
  byTitle,
  genres,
  max,
  min,
  firstUpdate,
  rensai,
  kanketsu,
  tanpen,
}: CustomRankingParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (keyword) searchParams.set("keyword", keyword);
  if (notKeyword) searchParams.set("not_keyword", notKeyword);
  if (byStory) searchParams.set("by_story", "1");
  if (byTitle) searchParams.set("by_title", "1");
  if (genres.length !== 0) searchParams.set("genres", genres.join(","));
  if (max) searchParams.set("max", max.toString());
  if (min) searchParams.set("min", min.toString());
  if (firstUpdate) searchParams.set("first_update", firstUpdate);
  if (!rensai) searchParams.set("rensai", "0");
  if (!kanketsu) searchParams.set("kanketsu", "0");
  if (!tanpen) searchParams.set("tanpen", "0");
  return searchParams;
}

function parseQuery(rankingType: RankingType): CustomRankingParams {
  function boolean(str: string | null, defaultValue: boolean): boolean {
    return str === null ? defaultValue : str !== "0";
  }
  function int(str: string | null): number | undefined {
    return str !== null ? parseInt(str, 10) : undefined;
  }
  return {
    keyword: useSearchParam("keyword") ?? undefined,
    notKeyword: useSearchParam("not_keyword") ?? undefined,
    byStory: boolean(useSearchParam("by_story"), false),
    byTitle: boolean(useSearchParam("by_title"), false),
    genres: conventGenres(useSearchParam("genres")),
    max: int(useSearchParam("max")),
    min: int(useSearchParam("min")),
    firstUpdate: useSearchParam("first_update") ?? undefined,
    rensai: boolean(useSearchParam("rensai"), true),
    kanketsu: boolean(useSearchParam("kanketsu"), true),
    tanpen: boolean(useSearchParam("tanpen"), true),
    rankingType,
  };
}

function conventGenres(rawGenres: string | null): Genre[] {
  return (rawGenres ?? "")
    .split(",")
    .map((x) => parseInt(x, 10) as Genre)
    .filter((x) => allGenres.includes(x));
}

export const CustomRanking: React.FC = () => {
  const { type } = useParams<CustomRankingPathParams>();

  const params = parseQuery((type ?? RankingType.Daily) as RankingType);

  const navigate = useNavigate();

  useTitle(
    `${params.keyword ? `${params.keyword}の` : "カスタム"}${
      RankingTypeName[params.rankingType]
    }ランキング - なろうランキングビューワ`
  );

  const handleSearch = useCallback<(e: CustomRankingParams) => void>(
    (params) => {
      navigate(`/custom/${params.rankingType}?${createSearchParams(params)}`);
    },
    [history]
  );

  return (
    <>
      <CustomRankingForm params={params} onSearch={handleSearch} />
      <CustomRankingRender params={params} />
    </>
  );
};

export default CustomRanking;
