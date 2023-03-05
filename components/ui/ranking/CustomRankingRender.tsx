import React, { Fragment, useCallback, useEffect, useState } from "react";

import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";
import RankingItem from "./RankingItem";
import { adModeAtom } from "../../../modules/atoms/global";
import { useAtomValue } from "jotai";
import { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import {
  useCustomRanking,
  useCustomRankingMaxPage,
} from "../../../modules/data/custom";
import { DotLoader } from "../atoms/Loader";
import { Waypoint } from "react-waypoint";
import { Button } from "../atoms/Button";

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
      <div className="w-full h-8 px-20 pt-10 pb-20">
        <DotLoader />
      </div>
    );
  }
  return (
    <>
      {data?.map((item) => (
        <div
          className="w-full md:basis-1/2 box-border p-4"
          key={`${item.rank}-${item.ncode}`}
        >
          <RankingItem item={item} />
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

export const CustomRankingRender: React.FC<{
  params: CustomRankingParams;
}> = ({ params }) => {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [params]);

  const maxPage = useCustomRankingMaxPage(params);
  const pages = Array.from({ length: page }, (_, i) => i + 1);
  const renderItems = pages.map((currentPage) => (
    <InsideRender
      key={currentPage}
      params={params}
      page={currentPage}
      isTail={currentPage === page && page < maxPage}
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
