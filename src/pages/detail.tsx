import React, { useState, useEffect } from "react";
import ky from "ky";
import { useParams } from "react-router-dom";
import { NarouSearchResult } from "narou";
import DetailItem from "../components/detail/DetailItem";
import { RankingHistories } from "../interface/RankingHistory";
import { RankingHistoryRender } from "../components/detail/RankingHistoryRender";

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
  const [result, setResult] = useState<Result | null>();

  useEffect(() => {
    let didCancel = false;
    setResult(null);
    (async () => {
      const result = await ky(`/api/detail/${ncode}`);
      if (!didCancel) {
        setResult(await result.json());
      }
    })();
    return () => {
      didCancel = true;
    };
  }, [ncode]);
  if (!result) {
    return (
      <div className="container">
        <progress className="progress is-primary" max="100">
          loading
        </progress>
      </div>
    );
  } else {
    return (
      <div className="container">
        <DetailRenderer {...result} />
      </div>
    );
  }
};
export default Detail;
