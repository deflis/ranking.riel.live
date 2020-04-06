import React, { useState, useEffect } from "react";
import { RankingResult } from "narou";
import RankingItem from "./RankingItem";
import { FilterInterface, DummyFilter } from "../../interface/Filter";
import { Waypoint } from "react-waypoint";
import AdSense from "../common/AdSense";

const InsideRender: React.FC<{
  ranking: RankingResult[];
  filter: FilterInterface;
}> = React.memo(({ ranking, filter }) => {
  const [max, setMax] = useState(10);
  const [items, setItems] = useState<RankingResult[]>([]);

  useEffect(() => {
    setMax(10);
  }, [filter]);
  useEffect(() => {
    setItems(filter.execute(ranking));
  }, [filter, ranking]);

  const rankingItems = items.slice(0, max).map(item => (
    <div className="column is-half-desktop" key={item.ncode}>
      <RankingItem item={item} />
    </div>
  ));

  return (
    <>
      {rankingItems}
      {max < items.length ? (
        <div className="column is-full">
          <Waypoint onEnter={() => setMax(x => x + 10)}>
            <progress className="progress is-primary" max="100">
              loading
            </progress>
          </Waypoint>
          <button className="button" onClick={() => setMax(x => x + 10)}>
            続きを見る
          </button>
        </div>
      ) : null}
    </>
  );
});

export const RankingRender: React.FC<{
  ranking: RankingResult[];
  filter?: FilterInterface;
}> = React.memo(({ ranking, filter }) => {
  return (
    <div className="columns is-desktop is-multiline">
      <div className="column is-full">
        <AdSense></AdSense>
      </div>
      <InsideRender ranking={ranking} filter={filter ?? new DummyFilter()} />
      <div className="column is-full">
        <AdSense></AdSense>
      </div>
    </div>
  );
});
