import React, { useState, useEffect } from "react";
import ky from "ky";
import { useParams } from "react-router-dom";
import { NarouSearchResult } from "narou";
import DetailItem from "../components/detail/DetailItem";
import { RankingHistories } from "../interface/RankingHistory";
import { RankingHistoryRender } from "../components/detail/RankingHistoryRender";
import { useToggle } from "react-use";

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
  const [error, toggleError] = useToggle(false);

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
    toggleError(false);
    (async () => {
      try {
        const result = await ky(`/api/detail/${ncode}`);
        const json: string | Result = await result.json();
        if (!didCancel) {
          if (json instanceof Object && json?.detail) {
            setResult(json);
          } else {
            toggleError(true);
          }
        }
      } catch (e) {
        toggleError(true);
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
  } else if (error) {
    return (
      <div className="container">
        情報が見つかりません。この小説は削除された可能性があります。
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
