import React, { Fragment, useCallback, useEffect, useState } from "react";

import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";
import FakeItem from "./FakeItem";
import RankingItem from "./RankingItem";
import { adModeAtom } from "../../../modules/atoms/global";
import { useAtomValue } from "jotai";
import { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import {
  useCustomRanking,
  useCustomRankingMaxPage,
} from "../../../modules/data/custom";
import InfiniteScroll from "react-infinite-scroller";

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
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
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
        <div
          className="w-full md:basis-1/2 box-border p-4"
          key={`${item.rank}-${item.ncode}`}
        >
          <RankingItem item={item} />
        </div>
      ))}
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
  const adMode = useAtomValue(adModeAtom);
  const rankingItems = pages.map((page) => (
    <Fragment key={page}>
      <InsideRender params={params} page={page} />
      {adMode && (
        <div className="w-full p-auto">
          <AdAmazonWidth />
        </div>
      )}
    </Fragment>
  ));

  return (
    <>
      <InfiniteScroll
        pageStart={1}
        loadMore={useCallback(
          (page) => {
            setPage(page);
          },
          [setPage]
        )}
        hasMore={page < maxPage}
        loader={
          <>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
          </>
        }
        className="flex w-full flex-wrap flex-row"
      >
        {rankingItems}
      </InfiniteScroll>
      <div className="w-full">
        <SelfAd />
      </div>
      <div className="w-full">
        <AdSense></AdSense>
      </div>
    </>
  );
};
