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
import { useIsFetching, useQueryClient } from "react-query";
import { prefetchDetail } from "../../../modules/data/prefetch";

const InsideRender: React.FC<{
  ranking: NarouRankingResult[];
}> = ({ ranking }) => {
  const [max, setMax] = useState(10);

  const rankingItems = ranking.slice(0, max).map((item) => (
    <div className="w-full md:basis-1/2 box-border p-4" key={item.ncode}>
      <RankingItem item={item} />
    </div>
  ));
  const adMode = useAtomValue(adModeAtom);
  const renderItems = chunk(rankingItems, 10).reduce(
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
  const rankingConstants = useMemo(
    () => ranking.map(({ ncode, pt }) => `${ncode}${pt}`).join(),
    [ranking]
  );
  useEffect(() => {
    setMax(10);
  }, [rankingConstants]);
  const queryClient = useQueryClient();
  useEffect(() => {
    prefetchDetail(
      queryClient,
      ranking.slice(max, max + 10).map((x) => x.ncode)
    );
  }, [max, rankingConstants]);
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
      <div className="flex w-full flex-wrap flex-row" ref={sentryRef}>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
        <div className="w-full md:basis-1/2 box-border p-4">
          <FakeItem />
        </div>
      </div>
      <div className="w-full">
        <SelfAd />
      </div>
      <div className="w-full">
        <AdSense></AdSense>
      </div>
    </>
  );
};

export const RankingRender: React.FC<{
  ranking: NarouRankingResult[];
  loading?: boolean;
}> = ({ ranking, loading = false }) => {
  return (
    <>
      {loading && <></>}
      {!loading && ranking.length === 0 && <p>データがありません</p>}
      <InsideRender ranking={ranking} />
    </>
  );
};
