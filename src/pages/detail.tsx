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
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (result) {
      document.title = `${result.detail.title} - なろうランキングビューワ`;
    } else {
      document.title = "なろうランキングビューワ";
    }
  }, [result]);

  useEffect(() => {
    let didCancel = false;
    setResult(undefined);
    setError(false);
    (async () => {
      try {
        const result = await ky(`/api/detail/${ncode}`);
        const json: Result = await result.json();
        if (!didCancel) {
          if (json?.detail) {
            setResult(json);
          } else {
            setError(true);
          }
        }
      } catch (e) {
        setError(true);
      }
    })();
    return () => {
      didCancel = true;
    };
  }, [ncode]);
  if (error) {
    return (
      <div className="container">
        情報が見つかりません。この小説は削除された可能性があります。
      </div>
    );
  } else if (!result) {
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
