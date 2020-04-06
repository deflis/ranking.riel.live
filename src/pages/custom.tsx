import React, { useState, useEffect, useCallback } from "react";
import { RankingResult, Order } from "narou";
import ky from "ky";
import { useParams, useHistory } from "react-router-dom";
import { RankingRender } from "../components/ranking/RankingRender";
import { useQuery } from "../util/useQuery";
import { FilterComponent } from "../components/ranking/Filter";
import { Filter } from "../interface/Filter";
import { useMemo } from 'react';
import Genre from '../enum/Genre';
import {
  CustomRankingForm,
  CustomRankingFormEvent,
} from "../components/custom/CustomRankingForm";

export type CustomRankingParams = {
  type?: RankingType;
};

export type CustomRankingQueryParams = {
  keyword: string;
  genres: string;
};

enum RankingType {
  Daily = "d",
  Weekly = "w",
  Monthly = "m",
  Quarter = "q",
  Yearly = "y",
  All = "a",
}

function convertOrder(type?: RankingType): Order {
  switch (type) {
    case RankingType.Daily:
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
    default:
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

function conventGenres(rawGenres: string = '') {
  return rawGenres.split(",").map(x => Number(x)).filter(x => Genre.has(x));
}

const CustomRanking: React.FC = () => {
  const { type } = useParams<CustomRankingParams>();
  const { keyword, genres: rawGenres } = useQuery<CustomRankingQueryParams>();
  const genres = useMemo(() => conventGenres(rawGenres), [rawGenres]);

  const history = useHistory();
  const [filter, setFilter] = useState(Filter.init());

  const [ranking, setRanking] = useState<RankingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;
    setLoading(true);
    setRanking([]);
    (async () => {
      try {
        console.log("api request");
        const result = await ky(
          `/api/custom/${convertOrder(type as RankingType)}/`,
          { searchParams: createParams(keyword, genres) }
        );
        if (!didCancel) {
          setRanking(await result.json());
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      didCancel = true;
    };
  }, [type, keyword, genres]);

  const handleChangeType = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const _type = e.target.value;
      if (type !== _type) {
        history.push(`/custom/${_type}?${createParams(keyword, genres)}`);
      }
    },
    [type, keyword, genres, history]
  );
  const handleSearch = useCallback<(e: CustomRankingFormEvent) => void>(
    ({ keyword, genres }) => {
      history.push(`/custom/${type ?? RankingType.All}?${createParams(keyword, genres)}`);
    },
    [type, history]
  );
  return (
    <div className="container">
      <form>
        <div className="field is-horizontal">
          <div className="field-label">
            <label className="label">種類</label>
          </div>
          <div className="field-body">
            <div className="field has-addons">
              <div className="select">
                <select value={type ?? RankingType.All} onChange={handleChangeType}>
                  <option value={RankingType.Daily}>日間</option>
                  <option value={RankingType.Weekly}>週間</option>
                  <option value={RankingType.Monthly}>月間</option>
                  <option value={RankingType.Quarter}>四半期</option>
                  <option value={RankingType.Yearly}>年間</option>
                  <option value={RankingType.All}>全期間</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </form>
      <CustomRankingForm
        keyword={keyword}
        genres={genres}
        onSearch={handleSearch}
      />
      <FilterComponent onChange={setFilter} />
      {loading ? (
        <progress className="progress is-primary" max="100">
          loading
        </progress>
      ) : ranking.length === 0 ? (
        <>データがありません</>
      ) : (
        <RankingRender ranking={ranking} filter={filter} />
      )}
    </div>
  );
};

export default CustomRanking;
