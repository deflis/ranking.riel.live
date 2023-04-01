import { useQueryClient } from "@tanstack/react-query";
import { useAtomValue } from "jotai";
import { NarouRankingResult } from "narou/src/index.browser";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Waypoint } from "react-waypoint";

import { adModeAtom } from "../../../modules/atoms/global";
import { prefetchRankingDetail } from "../../../modules/data/prefetch";
import { chunk } from "../../../modules/utils/chunk";
import { Button } from "../atoms/Button";
import { DotLoader } from "../atoms/Loader";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";

import RankingItem from "./RankingItem";

const ChunkRender: React.FC<{
  chunk: React.ReactNode;
  isTail: boolean;
  setMax: React.Dispatch<React.SetStateAction<number>>;
}> = ({ chunk, setMax, isTail }) => {
  const handleMore = useCallback(() => {
    setMax((max) => (isTail ? max + 10 : max));
  }, [setMax, isTail]);
  const adMode = useAtomValue(adModeAtom);

  return (
    <>
      {chunk}
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

const InsideRender: React.FC<{
  ranking: NarouRankingResult[];
}> = ({ ranking }) => {
  const [max, setMax] = useState(10);

  const rankingItems = ranking.slice(0, max).map((item) => (
    <div className="w-full md:basis-1/2 box-border p-4" key={item.ncode}>
      <RankingItem item={item} />
    </div>
  ));
  const renderItems = chunk(rankingItems, 10).map((v, i) => (
    <ChunkRender
      chunk={v}
      setMax={setMax}
      isTail={i * 10 + 10 === max}
      key={i}
    />
  ));
  const rankingConstants = useMemo(
    () => ranking.map(({ ncode, pt }) => `${ncode}${pt}`).join(),
    [ranking]
  );
  useEffect(() => {
    setMax(10);
  }, [rankingConstants]);

  const queryClient = useQueryClient();
  useEffect(() => {
    prefetchRankingDetail(
      queryClient,
      ranking.slice(max + 1, max + 10).map((x) => x.ncode)
    );
  }, [ranking, max]);

  return (
    <div className="flex w-full flex-wrap flex-row">
      {renderItems}
      <div className="w-full">
        <SelfAd />
      </div>
      <div className="w-full">
        <AdSense />
      </div>
    </div>
  );
};

export const RankingRender: React.FC<{
  ranking: NarouRankingResult[];
  loading?: boolean;
}> = ({ ranking, loading = false }) => {
  return (
    <>
      {loading && ranking.length === 0 && <DotLoader />}
      {!loading && ranking.length === 0 && <p>データがありません</p>}
      <InsideRender ranking={ranking} />
    </>
  );
};
