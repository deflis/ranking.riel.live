import { formatISO, parseISO } from "date-fns";
import { Order, R18Site } from "narou/src/index.browser";
import React, { useCallback, useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTitle } from "react-use";

import useR18Ranking from "../api/useR18Ranking";
import { R18RankingForm } from "../components/custom/R18RankingForm";
import { RankingRender } from "../components/ranking/RankingRender";
import { R18RankingParams } from "../interface/CustomRankingParams";
import { RankingType, RankingTypeName } from "../interface/RankingType";
import { useQuery } from "../util/useQuery";

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

function convertOrder(type?: RankingType): Order {
  switch (type) {
    case RankingType.Daily:
    default:
      return Order.DailyPoint;
    case RankingType.Weekly:
      return Order.WeeklyPoint;
    case RankingType.Monthly:
      return Order.MonthlyPoint;
    case RankingType.Quarter:
      return Order.QuarterPoint;
    case RankingType.Yearly:
      return Order.YearlyPoint;
    case RankingType.All:
      return Order.HyokaDesc;
    case RankingType.UniqueUser:
      return Order.Weekly;
  }
}

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
  if (firstUpdate)
    searchParams.set(
      "first_update",
      formatISO(firstUpdate, { representation: "complete" })
    );
  if (!rensai) searchParams.set("rensai", "0");
  if (!kanketsu) searchParams.set("kanketsu", "0");
  if (!tanpen) searchParams.set("tanpen", "0");
  return searchParams;
}

function parseQuery(
  {
    keyword,
    not_keyword,
    by_story,
    by_title,
    sites,
    max,
    min,
    first_update,
    rensai,
    kanketsu,
    tanpen,
  }: R18RankingQueryParams,
  rankingType: RankingType
): R18RankingParams {
  function boolean(str: string | undefined, defaultValue: boolean): boolean {
    return str === undefined ? defaultValue : str !== "0";
  }
  function int(str: string | undefined): number | undefined {
    return str !== undefined ? parseInt(str, 10) : undefined;
  }
  function date(str: string | undefined): Date | undefined {
    return str !== undefined ? parseISO(str) : undefined;
  }
  return {
    keyword,
    notKeyword: not_keyword,
    byStory: boolean(by_story, false),
    byTitle: boolean(by_title, false),
    sites: conventSites(sites),
    max: int(max),
    min: int(min),
    firstUpdate: date(first_update),
    rensai: boolean(rensai, true),
    kanketsu: boolean(kanketsu, true),
    tanpen: boolean(tanpen, true),
    rankingType,
  };
}

function conventSites(rawGenres: string = "") {
  return rawGenres
    .split(",")
    .map((x) => Number(x))
    .filter((x) => R18Site?.[x] !== undefined);
}

const R18Ranking: React.FC = () => {
  const { type } = useParams<R18RankingPathParams>();
  const query = useQuery<R18RankingQueryParams>();
  const params = useMemo(
    () => parseQuery(query, (type ?? RankingType.Daily) as RankingType),
    [query, type]
  );
  const searchParams = useMemo(() => createSearchParams(params), [params]);
  const order = convertOrder(params.rankingType);

  const history = useHistory();

  useTitle(
    `【R18】${
      params.keyword ? `${params.keyword}の` : "カスタム"
    }${RankingTypeName.get(
      params.rankingType
    )}ランキング - なろうランキングビューワ`
  );

  const handleSearch = useCallback<(e: R18RankingParams) => void>(
    (params) => {
      history.push(`/r18/${params.rankingType}?${createSearchParams(params)}`);
    },
    [history]
  );

  const { ranking, loading } = useR18Ranking(order, searchParams);

  return (
    <>
      <R18RankingForm params={params} onSearch={handleSearch} />
      <RankingRender ranking={ranking} loading={loading} />
    </>
  );
};

export default R18Ranking;
