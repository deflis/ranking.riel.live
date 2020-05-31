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
  CustomRankingFormEvent,
} from "../components/custom/CustomRankingForm";
import { RankingType, RankingTypeName } from "../interface/RankingType";
import { useAsync, useTitle } from "react-use";

export type CustomRankingParams = {
  type?: RankingType;
};

export type CustomRankingQueryParams = {
  keyword: string;
  genres: string;
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

function createParams(
  keyword: string | undefined,
  genres: number[]
): URLSearchParams {
  const searchParams = new URLSearchParams();
  if (keyword) searchParams.set("keyword", keyword);
  if (genres.length !== 0) searchParams.set("genres", genres.join(","));
  return searchParams;
}

function conventGenres(rawGenres: string = "") {
  return rawGenres
    .split(",")
    .map((x) => Number(x))
    .filter((x) => Genre.has(x));
}

const CustomRanking: React.FC = () => {
  const params = useParams<CustomRankingParams>();
  const type = (params.type ?? RankingType.Daily) as RankingType;
  const { keyword, genres: rawGenres } = useQuery<CustomRankingQueryParams>();
  const genres = useMemo(() => conventGenres(rawGenres), [rawGenres]);

  const history = useHistory();

  useTitle(
    `${keyword ? `${keyword}の` : "カスタム"}${RankingTypeName.get(
      type
    )}ランキング - なろうランキングビューワ`
  );

  const { value, loading } = useAsync(async () => {
    const result = await ky(`/api/custom/${convertOrder(type)}/`, {
      searchParams: createParams(keyword, genres),
    });
    return (await result.json()) as RankingResult[];
  }, [type, keyword, genres]);

  const ranking = value ?? [];

  const handleSearch = useCallback<(e: CustomRankingFormEvent) => void>(
    ({ keyword, genres, rankingType }) => {
      history.push(`/custom/${rankingType}?${createParams(keyword, genres)}`);
    },
    [history]
  );

  return (
    <div className="container">
      <CustomRankingForm
        keyword={keyword}
        genres={genres}
        rankingType={type}
        onSearch={handleSearch}
      />
      {loading ? (
        <progress className="progress is-primary" max="100">
          loading
        </progress>
      ) : ranking.length === 0 ? (
        <>データがありません</>
      ) : (
        <RankingRender ranking={ranking} />
      )}
    </div>
  );
};

export default CustomRanking;
