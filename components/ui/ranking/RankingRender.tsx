import { NarouRankingResult } from "narou";
import React, { useEffect, useState } from "react";

import { chunk } from "../../../modules/utils/chunk";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";
import FakeItem from "./FakeItem";
import RankingItem from "./RankingItem";
import { adModeAtom } from "../../../modules/atoms/global";
import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useWaypoint } from "../../../modules/utils/useWaypoint";
import InfiniteScroll from "react-infinite-scroller";

const InsideRender: React.FC<{
  ranking: NarouRankingResult[];
}> = ({ ranking }) => {
  const [max, setMax] = useState(10);

  useHydrateAtoms([[adModeAtom, true]] as const);
  useEffect(() => {
    setMax(10);
  }, [ranking]);

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

  const [ref, waypointEnter] = useWaypoint<HTMLDivElement>(
    () => {
      console.log("waypoint");
      setMax((x) => x + 10);
    },
    1000,
    []
  );

  return (
    <>
      <InfiniteScroll
        className="flex w-full flex-wrap flex-row"
        loadMore={() => setMax((x) => x + 10)}
        hasMore={max < ranking.length}
        loader={
          <div className="flex w-full flex-wrap flex-row" key="0">
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
            <div className="w-full md:basis-1/2 box-border p-4">
              <FakeItem />
            </div>
          </div>
        }
      >
        {renderItems}
      </InfiniteScroll>
      <>
        <div className="w-full">
          <SelfAd />
        </div>
        <div className="w-full">
          <AdSense></AdSense>
        </div>
      </>
    </>
  );
};

export const RankingRender: React.FC<{
  ranking: NarouRankingResult[];
  loading?: boolean;
}> = ({ ranking, loading = false }) => {
  return (
    <>
      {ranking.length === 0 && (
        <>
          {loading && <></>}
          {!loading && <p>データがありません</p>}
        </>
      )}
      <InsideRender ranking={ranking} />
    </>
  );
};
