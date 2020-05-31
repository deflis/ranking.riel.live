import React from "react";
import ky from "ky";
import { useParams } from "react-router-dom";
import { NarouSearchResult } from "narou";
import DetailItem from "../components/detail/DetailItem";
import { RankingHistories } from "../interface/RankingHistory";
import { RankingHistoryRender } from "../components/detail/RankingHistoryRender";
import { useAsync, useTitle } from "react-use";

type Result = {
  detail: NarouSearchResult;
  ranking: RankingHistories;
};

const DetailRenderer: React.FC<Result> = ({ detail, ranking }) => {
  return (
    <>
      <DetailItem item={detail} />
      <RankingHistoryRender ranking={ranking} />
    </>
  );
};

const Detail: React.FC = () => {
  const { ncode } = useParams<{ ncode: string }>();

  const { value, loading, error } = useAsync(async () => {
    const result = await ky(`/api/detail/${ncode}`);
    const json: Result = await result.json();
    if (json?.detail) {
      return json;
    } else {
      throw json;
    }
  }, [ncode]);

  useTitle(
    value
      ? `${value.detail.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  if (loading) {
    return (
      <div className="container">
        <progress className="progress is-primary" max="100">
          loading
        </progress>
      </div>
    );
  } else if (value && !error) {
    return (
      <div className="container">
        <DetailRenderer {...value} />
      </div>
    );
  }
  return (
    <div className="container">
      情報が見つかりません。この小説は削除された可能性があります。
    </div>
  );
};
export default Detail;
