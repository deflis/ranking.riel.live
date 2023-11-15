import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import React, { useCallback, useEffect, useState } from "react";
import { Waypoint } from "react-waypoint";

import { adModeAtom } from "../../../modules/atoms/global";
import {
  prefetchCustomRanking,
  useCustomRanking,
} from "../../../modules/data/custom";
import { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import { Button } from "../atoms/Button";
import { DotLoader } from "../atoms/Loader";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";

import RankingItem from "./RankingItem";

const InsideRender: React.FC<{
  params: CustomRankingParams;
  page: number;
  isTail: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}> = ({ params, page, isTail, setPage }) => {
  const handleMore = useCallback(() => {
    setPage((max) => (isTail ? max + 1 : max));
  }, [setPage, isTail]);
  const { isLoading, data } = useCustomRanking(params, page);
  const adMode = useAtomValue(adModeAtom);

  if (isLoading) {
    return (
      <div className="col-span-full">
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
        <RankingItem key={`${item.rank}-${item.ncode}`} item={item} />
      ))}
      {adMode && (
        <div className="col-span-full">
          <AdAmazonWidth />
        </div>
      )}
      {isTail && (
        <Waypoint onEnter={handleMore}>
          <div className="col-span-full">
            <Button onClick={handleMore} className="w-full h-20 text-3xl">
              もっと見る
            </Button>
          </div>
        </Waypoint>
      )}
    </>
  );
};

export const CustomRankingRender: React.FC<{
  params: CustomRankingParams;
}> = ({ params }) => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [params]);

  const queryClient = useQueryClient();
  useEffect(() => {
    prefetchCustomRanking(queryClient, params, page + 1);
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
      <div className="w-full grid md:grid-cols-2 p-4 gap-4">
        {renderItems}
        <div className="col-span-full">
          <SelfAd />
        </div>
        <div className="col-span-full">
          <AdSense />
        </div>
      </div>
    </>
  );
};
