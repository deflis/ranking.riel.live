import { RankingResult } from "narou";
import React, { useEffect, useState } from "react";

import { Grid, LinearProgress } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import { DummyFilter, FilterInterface } from "../../interface/Filter";
import { chunk } from "../../util/chunk";
import { useAdMode } from "../../util/globalState";
import { AdAmazonWidth } from "../common/AdAmazon";
import AdSense from "../common/AdSense";
import { SelfAd } from "../common/SelfAd";
import FakeItem from "./FakeItem";
import RankingItem from "./RankingItem";
import { useWaypoint } from "../../util/useWaypoint";

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

  const rankingItems = items.slice(0, max).map((item) => (
    <Grid item sm={6} key={item.ncode}>
      <RankingItem item={item} />
    </Grid>
  ));
  const [adMode] = useAdMode();

  const renderItems = chunk(rankingItems, 10).reduce(
    (previous, current, index) => (
      <>
        {previous}
        {index !== 0 && adMode && (
          <Grid item xs={12}>
            <AdAmazonWidth key={index} />
          </Grid>
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
      {renderItems}
      {max < items.length ? (
        <>
          <Grid item xs={6} ref={ref}>
            <FakeItem />
          </Grid>
          <Grid item xs={6}>
            <FakeItem />
          </Grid>
          <Grid item xs={12}>
            <button className="button" onClick={waypointEnter}>
              続きを見る
            </button>
          </Grid>
        </>
      ) : null}
    </>
  );
});

export const RankingRender: React.FC<{
  ranking: RankingResult[];
  filter?: FilterInterface;
  loading?: boolean;
}> = ({ ranking, filter, loading = false }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}></Grid>
      <Grid item xs={12}>
        <AdSense />
      </Grid>
      {ranking.length === 0 && (
        <Grid item xs={12}>
          {loading && <LinearProgress />}
          {!loading && <Alert severity="info">データがありません</Alert>}
        </Grid>
      )}
      {!loading && (
        <InsideRender ranking={ranking} filter={filter ?? new DummyFilter()} />
      )}
      <Grid item xs={12}>
        <SelfAd />
      </Grid>
      <Grid item xs={12}>
        <AdSense></AdSense>
      </Grid>
    </Grid>
  );
};
