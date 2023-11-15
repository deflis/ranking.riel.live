import { R18Site } from "narou/browser";
import React, { useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTitle } from "react-use";

import { R18RankingForm } from "@/components/ui/custom/R18RankingForm";
import { R18RankingRender } from "@/components/ui/ranking/R18RankingRender";
import { R18RankingParams } from "@/modules/interfaces/CustomRankingParams";
import { RankingType, RankingTypeName } from "@/modules/interfaces/RankingType";

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

function useParseQuery(rankingType: RankingType): R18RankingParams {
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
      sites: conventSites(searchParams.get("sites")),
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
    .filter((x) => allSites.includes(x) !== undefined);
}

const R18Ranking: React.FC = () => {
  const { type } = useParams<R18RankingPathParams>();

  const params = useParseQuery((type ?? RankingType.Daily) as RankingType);

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
