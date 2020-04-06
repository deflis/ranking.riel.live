import React, { useState, useEffect } from "react";
import { RankingResult, Order } from "narou";
import ky from "ky";
import { useParams, useLocation } from "react-router-dom";
import { RankingRender } from "../components/ranking/RankingRender";

export type CustomRankingParams = {
  type: RankingType;
};

enum RankingType {
  Daily = "d",
  Weekly = "w",
  Monthly = "m",
  Quarter = "q",
  Yearly = "y",
  All = "a"
}

function convertOrder(type: RankingType): Order {
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
      return Order.HyokaDesc;
  }
}

function useQuery<Params extends { [K in keyof Params]?: string } = {}>(): {
  [p in keyof Params]: string;
} {
  return Object.fromEntries(
    new URLSearchParams(useLocation().search).entries()
  ) as any;
}

const CustomRanking: React.FC = () => {
  const { type } = useParams<CustomRankingParams>();
  const { keyword } = useQuery();

  const [ranking, setRanking] = useState<RankingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let didCancel = false;
    setLoading(true);
    setRanking([]);
    (async () => {
      const searchParams = new URLSearchParams();
      if (keyword) searchParams.append("keyword", keyword);
      const result = await ky(
        `/api/custom/${convertOrder(type as RankingType)}/`,
        { searchParams }
      );
      if (!didCancel) {
        setRanking(await result.json());
        setLoading(false);
      }
    })();
    return () => {
      didCancel = true;
    };
  }, [type, keyword]);

  return (
    <div className="container">
      {loading ? (
        <progress className="progress is-primary" max="100">
          loading
        </progress>
      ) : (
        <></>
      )}
      <RankingRender ranking={ranking} />
    </div>
  );
};

export default CustomRanking;
