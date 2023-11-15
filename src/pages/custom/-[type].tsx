import { Genre } from "narou/browser";
import React, { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTitle } from "react-use";

import { CustomRankingForm } from "@/components/ui/custom/CustomRankingForm";
import { CustomRankingRender } from "@/components/ui/ranking/CustomRankingRender";
import { allGenres } from "@/modules/enum/Genre";
import { CustomRankingParams } from "@/modules/interfaces/CustomRankingParams";
import { RankingType, RankingTypeName } from "@/modules/interfaces/RankingType";
import { useNavigate, useParams } from "@/router";

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
  if (rensai === false) searchParams.set("rensai", "0");
  if (kanketsu === false) searchParams.set("kanketsu", "0");
  if (tanpen === false) searchParams.set("tanpen", "0");
  return searchParams;
}

function useParseQuery(rankingType: RankingType): CustomRankingParams {
  function boolean(str: string | null, defaultValue: boolean): boolean {
    return str === null ? defaultValue : str !== "0";
  }
  function int(str: string | null): number | undefined {
    return str !== null ? parseInt(str, 10) : undefined;
  }

  const { search } = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  return useMemo(
    () => ({
      keyword: searchParams.get("keyword") ?? undefined,
      notKeyword: searchParams.get("not_keyword") ?? undefined,
      byStory: boolean(searchParams.get("by_story"), false),
      byTitle: boolean(searchParams.get("by_title"), false),
      genres: conventGenres(searchParams.get("genres")),
      max: int(searchParams.get("max")),
      min: int(searchParams.get("min")),
      firstUpdate: searchParams.get("first_update") ?? undefined,
      rensai: boolean(searchParams.get("rensai"), true),
      kanketsu: boolean(searchParams.get("kanketsu"), true),
      tanpen: boolean(searchParams.get("tanpen"), true),
      rankingType,
    }),
    [searchParams, rankingType]
  );
}

function conventGenres(rawGenres: string | null): Genre[] {
  return (rawGenres ?? "")
    .split(",")
    .map((x) => parseInt(x, 10) as Genre)
    .filter((x) => allGenres.includes(x));
}

export const CustomRanking: React.FC = () => {
  const { type } = useParams("/custom/:type?");

  const params = useParseQuery((type ?? RankingType.Daily) as RankingType);

  const navigate = useNavigate();

  useTitle(
    `${params.keyword ? `${params.keyword}の` : "カスタム"}${
      RankingTypeName[params.rankingType]
    }ランキング - なろうランキングビューワ`
  );

  const handleSearch = useCallback<(e: CustomRankingParams) => void>(
    (params) => {
      navigate(
        {
          pathname: "/custom/:type?",
          search: createSearchParams(params).toString(),
        },
        {
          params: { type: params.rankingType },
        }
      );
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
