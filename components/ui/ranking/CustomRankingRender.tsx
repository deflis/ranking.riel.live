import { NarouRankingResult } from "narou/src/index.browser";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

import { chunk } from "../../../modules/utils/chunk";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";
import FakeItem from "./FakeItem";
import RankingItem from "./RankingItem";
import { adModeAtom } from "../../../modules/atoms/global";
import { useAtomValue } from "jotai";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { prefetchRankingDetail } from "../../../modules/data/prefetch";
import { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import { useCustomRanking } from "../../../modules/data/custom";

const InsideRender: React.FC<{
  params: CustomRankingParams;
  page: number;
}> = ({ params, page }) => {
  const { isLoading, data } = useCustomRanking(params, page);
  if (isLoading) {
    return (
      <>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
      </>
    );
  }
  if (!data) {
    return null;
  }
  return (
    <>
      {data.map((item) => (
        <div className="w-full md:basis-1/2 box-border p-4" key={item.ncode}>
          <RankingItem item={item} />
        </div>
      ))}
    </>
  );
};

export const CustomRankingRender: React.FC<{
  params: CustomRankingParams;
}> = ({ params }) => {
  const [max, setMax] = useState(1);
  const pages = Array.from({ length: max }, (_, i) => i + 1);
  const rankingItems = pages.map((page) => (
    <InsideRender params={params} page={page} />
  ));

  const adMode = useAtomValue(adModeAtom);
  const renderItems = rankingItems.reduce(
    (previous, current, index) => (
      <>
        {previous}
        {index !== 0 && adMode && (
          <div className="w-full p-auto">
            <AdAmazonWidth key={index} />
          </div>
        )}
        {current}
      </>
    ),
    <></>
  );
  const [sentryRef] = useInfiniteScroll({
    loading: !!useIsFetching(),
    hasNextPage: max < ranking.length,
    onLoadMore: useCallback(() => {
      setMax((x) => x + 10);
    }, [setMax]),
    rootMargin: "0px 0px 400px 0px",
  });

  return (
    <>
      <div className="flex w-full flex-wrap flex-row">{renderItems}</div>
      <div className="flex w-full flex-wrap flex-row" ref={sentryRef}></div>
      <div className="w-full">
        <SelfAd />
      </div>
      <div className="w-full">
        <AdSense></AdSense>
      </div>
    </>
  );

  return (
    <>
      {loading && <></>}
      {!loading && ranking.length === 0 && <p>データがありません</p>}
      <InsideRender ranking={ranking} />
    </>
  );
};
