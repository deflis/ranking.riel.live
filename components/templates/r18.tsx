import { R18Site } from "narou/src/index.browser";
import React, { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSearchParam, useTitle } from "react-use";

import { R18RankingParams } from "../../modules/interfaces/CustomRankingParams";
import {
  RankingType,
  RankingTypeName,
} from "../../modules/interfaces/RankingType";
import { R18RankingForm } from "../ui/custom/R18RankingForm";
import { R18RankingRender } from "../ui/ranking/R18RankingRender";

export type R18RankingPathParams = {
  type?: RankingType;
};

export type R18RankingQueryParams = {
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

function createSearchParams({
  keyword,
  notKeyword,
  byStory,
  byTitle,
  sites,
  max,
  min,
  firstUpdate,
  rensai,
  kanketsu,
  tanpen,
}: R18RankingParams): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (keyword) searchParams.set("keyword", keyword);
  if (notKeyword) searchParams.set("not_keyword", notKeyword);
  if (byStory) searchParams.set("by_story", "1");
  if (byTitle) searchParams.set("by_title", "1");
  if (sites.length !== 0) searchParams.set("sites", sites.join(","));
  if (max) searchParams.set("max", max.toString());
  if (min) searchParams.set("min", min.toString());
  if (firstUpdate) searchParams.set("first_update", firstUpdate);
  if (!rensai) searchParams.set("rensai", "0");
  if (!kanketsu) searchParams.set("kanketsu", "0");
  if (!tanpen) searchParams.set("tanpen", "0");
  return searchParams;
}

function parseQuery(rankingType: RankingType): R18RankingParams {
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
    sites: conventSites(useSearchParam("sites")),
    max: int(useSearchParam("max")),
    min: int(useSearchParam("min")),
    firstUpdate: useSearchParam("first_update") ?? undefined,
    rensai: boolean(useSearchParam("rensai"), true),
    kanketsu: boolean(useSearchParam("kanketsu"), true),
    tanpen: boolean(useSearchParam("tanpen"), true),
    rankingType,
  };
}

const allSites = [
  R18Site.Nocturne,
  R18Site.MoonLight,
  R18Site.MoonLightBL,
  R18Site.Midnight,
];

function conventSites(rawSites: string | null): R18Site[] {
  return (rawSites ?? "")
    .split(",")
    .map((x) => Number(x) as R18Site)
    .filter((x) => allSites.includes(x));
}

const R18Ranking: React.FC = () => {
  const { type } = useParams<R18RankingPathParams>();

  const params = parseQuery((type ?? RankingType.Daily) as RankingType);

  const navigate = useNavigate();

  useTitle(
    `【R18】${params.keyword ? `${params.keyword}の` : "カスタム"}${
      RankingTypeName[params.rankingType]
    }ランキング - なろうランキングビューワ`
  );

  const handleSearch = useCallback<(e: R18RankingParams) => void>(
    (params) => {
      navigate(`/r18/${params.rankingType}?${createSearchParams(params)}`);
    },
    [history]
  );

  return (
    <>
      <R18RankingForm params={params} onSearch={handleSearch} />
      <R18RankingRender params={params} />
    </>
  );
};

export default R18Ranking;
