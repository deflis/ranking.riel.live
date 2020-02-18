import React, { useState, useEffect } from "react";
import { RankingResult } from "narou";
import RankingItem from "./RankingItem";
import { Filter } from "./Filter";
import { Waypoint } from "react-waypoint";
import AdSense from "../common/AdSense";

function chunk<T extends any[]>(arr: T, size: number): T[][] {
  return arr.reduce(
    (newarr, _, i) => (i % size ? newarr : [...newarr, arr.slice(i, i + size)]),
    [] as T[][]
  );
}

export const RankingRender: React.FC<{ ranking: RankingResult[]; filter: Filter }> = ({
  ranking,
  filter
}) => {
  useEffect(() => {
    setMax(10);
  }, [filter]);
  const [items, setItems] = useState<RankingResult[]>([]);

  useEffect(() => {
    setItems(filter.execute(ranking));
  }, [ranking, filter]);

  const [max, setMax] = useState(10);

  const rankingItems = items.slice(0, max).map(item => (
    <div className="column is-half-desktop" key={item.ncode}>
      <RankingItem item={item} />
    </div>
  ));

  const itemsWithAds = chunk(rankingItems, 10).reduce(
    (x, y) => (
      <>
        {x}
        <div className="column is-full">
          <AdSense></AdSense>
        </div>
        {y}
      </>
    ),
    <></>
  );

  return (
    <>
      <div className="columns is-desktop is-multiline">
        {itemsWithAds}
        <div className="column is-full">
          <Waypoint onEnter={() => setMax(x => x + 10)}>
            {max < items.length ? (
              <progress className="progress is-primary" max="100">
                loading
              </progress>
            ) : null}
          </Waypoint>
          {max < items.length ? (
            <button className="button" onClick={() => setMax(x => x + 10)}>
              続きを見る
            </button>
          ) : null}
        </div>
      </div>

      <AdSense></AdSense>
    </>
  );
};
