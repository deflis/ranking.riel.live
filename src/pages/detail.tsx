import React from "react";
import ky from "ky";
import { useParams } from "react-router-dom";
import { NarouSearchResult } from "narou";
import DetailItem from "../components/detail/DetailItem";
import { RankingHistories } from "../interface/RankingHistory";
import { RankingHistoryRender } from "../components/detail/RankingHistoryRender";
import { useAsync, useTitle } from "react-use";
import FakeItem from "../components/detail/FakeItem";
import Alert from "@material-ui/lab/Alert";

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
    return <FakeItem />;
  } else if (value && !error) {
    return <DetailRenderer {...value} />;
  }
  return (
    <Alert severity="warning">
      情報が見つかりません。この小説は削除された可能性があります。
    </Alert>
  );
};
export default Detail;
