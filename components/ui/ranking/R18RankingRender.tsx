import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import React, { useCallback, useEffect, useState } from "react";
import { Waypoint } from "react-waypoint";

import { adModeAtom } from "../../../modules/atoms/global";
import {
  prefetchR18Ranking,
  useR18Ranking,
} from "../../../modules/data/r18ranking";
import { R18RankingParams } from "../../../modules/interfaces/CustomRankingParams";
import { Button } from "../atoms/Button";
import { DotLoader } from "../atoms/Loader";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";

import { R18RankingItem } from "./RankingItem";

const InsideRender: React.FC<{
  params: R18RankingParams;
  page: number;
  isTail: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ params, page, isTail, setPage }) => {
  const handleMore = useCallback(() => {
    setPage((max) => (isTail ? max + 1 : max));
  }, [setPage, isTail]);
  const { isLoading, data } = useR18Ranking(params, page);
  const adMode = useAtomValue(adModeAtom);

  if (isLoading) {
    return (
      <div className="w-full h-8 px-20 pt-10 pb-20">
        <DotLoader />
      </div>
    );
  }
  if (data?.length === 0 || !data) {
    return page === 1 ? <div className="w-full">データがありません</div> : null;
  }
  return (
    <>
      {data.map((item) => (
        <div
          className="w-full md:basis-1/2 box-border p-4"
          key={`${item.rank}-${item.ncode}`}
        >
          <R18RankingItem item={item} />
        </div>
      ))}
      {adMode && (
        <div className="w-full p-auto">
          <AdAmazonWidth />
        </div>
      )}
      {isTail && (
        <Waypoint onEnter={handleMore}>
          <div className="w-full px-20 pt-10 pb-20">
            <Button onClick={handleMore} className="w-full h-20 text-3xl">
              もっと見る
            </Button>
          </div>
        </Waypoint>
      )}
    </>
  );
};

export const R18RankingRender: React.FC<{
  params: R18RankingParams;
}> = ({ params }) => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [params]);

  const queryClient = useQueryClient();
  useEffect(() => {
    prefetchR18Ranking(queryClient, params, page + 1);
  }, [params, page]);

  const pages = Array.from({ length: page }, (_, i) => i + 1);
  const renderItems = pages.map((currentPage) => (
    <InsideRender
      key={currentPage}
      params={params}
      page={currentPage}
      isTail={currentPage === page && page < 200}
      setPage={setPage}
    />
  ));

  return (
    <>
      <div className="flex w-full flex-wrap flex-row">
        {renderItems}
        <div className="w-full">
          <SelfAd />
        </div>
        <div className="w-full">
          <AdSense />
        </div>
      </div>
    </>
  );
};
