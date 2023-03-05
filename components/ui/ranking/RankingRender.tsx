import { NarouRankingResult } from "narou/src/index.browser";
import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { chunk } from "../../../modules/utils/chunk";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";
import RankingItem from "./RankingItem";
import { adModeAtom } from "../../../modules/atoms/global";
import { useAtomValue } from "jotai";
import { useQueryClient } from "@tanstack/react-query";
import { prefetchRankingDetail } from "../../../modules/data/prefetch";
import { Button } from "../atoms/Button";
import { Waypoint } from "react-waypoint";

const ChunkRender: React.FC<{
  chunk: React.ReactNode;
  index: number;
  isTail: boolean;
  setMax: React.Dispatch<React.SetStateAction<number>>;
}> = ({ chunk, index, setMax, isTail }) => {
  const handleMore = useCallback(() => {
    setMax((max) => (isTail ? max + 10 : max));
  }, [setMax, index, isTail]);
  const adMode = useAtomValue(adModeAtom);

  return (
    <>
      {chunk}
      {adMode && (
        <div className="w-full p-auto" key={index}>
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
      index={i}
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
      {loading && <></>}
      {!loading && ranking.length === 0 && <p>データがありません</p>}
      <InsideRender ranking={ranking} />
    </>
  );
};
