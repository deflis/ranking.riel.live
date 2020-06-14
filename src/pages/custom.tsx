import React, { useCallback } from "react";
import { RankingResult, Order } from "narou";
import ky from "ky";
import { useParams, useHistory } from "react-router-dom";
import { RankingRender } from "../components/ranking/RankingRender";
import { useQuery } from "../util/useQuery";
import { useMemo } from "react";
import Genre from "../enum/Genre";
import {
  CustomRankingForm,
} from "../components/custom/CustomRankingForm";
import { RankingType, RankingTypeName } from "../interface/RankingType";
import { useAsync, useTitle } from "react-use";
import { CustomRankingParams } from "../interface/CustomRankingParams";
import { formatISO, parseISO } from "date-fns";

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
  }
}

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
    genres,
    max,
    min,
    first_update,
    rensai,
    kanketsu,
    tanpen,
  }: CustomRankingQueryParams,
  rankingType: RankingType
): CustomRankingParams {
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
    genres: conventGenres(genres),
    max: int(max),
    min: int(min),
    firstUpdate: date(first_update),
    rensai: boolean(rensai, true),
    kanketsu: boolean(kanketsu, true),
    tanpen: boolean(tanpen, true),
    rankingType,
  };
}

function conventGenres(rawGenres: string = "") {
  return rawGenres
    .split(",")
    .map((x) => Number(x))
    .filter((x) => Genre.has(x));
}

const CustomRanking: React.FC = () => {
  const { type } = useParams<CustomRankingPathParams>();
  const query = useQuery<CustomRankingQueryParams>();
  const params = useMemo(
    () => parseQuery(query, (type ?? RankingType.Daily) as RankingType),
    [query, type]
  );

  const history = useHistory();

  useTitle(
    `${
      params.keyword ? `${params.keyword}の` : "カスタム"
    }${RankingTypeName.get(params.rankingType)}ランキング - なろうランキングビューワ`
  );

  const { value, loading } = useAsync(async () => {
    const result = await ky(`/api/custom/${convertOrder(params.rankingType)}/`, {
      searchParams: createSearchParams(params),
      timeout: 60000,
    });
    return (await result.json()) as RankingResult[];
  }, [params]);

  const ranking = value ?? [];

  const handleSearch = useCallback<(e: CustomRankingParams) => void>(
    (params) => {
      history.push(
        `/custom/${params.rankingType}?${createSearchParams(params)}`
      );
    },
    [history]
  );

  return (
    <>
      <CustomRankingForm
        params={params}
        onSearch={handleSearch}
      />
      <RankingRender ranking={ranking} loading={loading} />
    </>
  );
};

export default CustomRanking;
