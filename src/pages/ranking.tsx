import React, { useState, useEffect } from "react";
import { RankingResult } from "narou";
import ky from "ky";
import RankingItem from "../components/ranking/RankingItem";
import "bulma";
import { formatISO, setDay, startOfMonth, addDays, getDay } from "date-fns/esm";
import { addHours } from "date-fns/esm";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FilterComponent, Filter } from "../components/ranking/Filter";
import { Waypoint } from "react-waypoint";
import AdSense from "../components/common/AdSense";

declare global {
  interface Window {
    adsbygoogle: Array<any>;
  }
}

enum RankingType {
  Daily = "d",
  Weekly = "w",
  Monthly = "m",
  Quarter = "q"
}

function formatDate(date: Date, type: RankingType): string {
  switch (type) {
    case RankingType.Daily:
      return formatISO(date, { representation: "date" });
    case RankingType.Weekly:
      return formatISO(addDays(setDay(date, 2), getDay(date) < 2 ? -7 : 0), {
        representation: "date"
      });
    case RankingType.Monthly:
      return formatISO(startOfMonth(date), { representation: "date" });
    case RankingType.Quarter:
      return formatISO(startOfMonth(date), { representation: "date" });
  }
}

function chunk<T extends any[]>(arr: T, size: number): T[][] {
  return arr.reduce(
    (newarr, _, i) => (i % size ? newarr : [...newarr, arr.slice(i, i + size)]),
    [] as T[][]
  );
}

const RankingRender: React.FC<{ ranking: RankingResult[]; filter: Filter }> = ({
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

const Ranking: React.FC = () => {
  const [type, setType] = useState(RankingType.Daily);
  const [date, setDate] = useState(addHours(new Date(), -12));
  const [ranking, setRanking] = useState<RankingResult[]>([]);
  const [filter, setFilter] = useState(new Filter());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setRanking([]);
      const result = await ky(`/api/${type}/${formatDate(date, type)}`);
      setRanking(await result.json());
      setLoading(false);
    })();
  }, [date, type]);

  return (
    <>
      <div className="container">
        <div className="field is-horizontal">
          <div className="field-label">
            <label className="label">日付</label>
          </div>
          <div className="field-body">
            <div className="control">
              <ReactDatePicker
                className="input"
                dateFormat="yyyy/MM/dd"
                minDate={new Date(2013, 5, 1)}
                maxDate={new Date()}
                selected={date}
                onChange={d => setDate(d ?? date)}
              />
            </div>
          </div>
          <div className="field-label">
            <label className="label">種類</label>
          </div>
          <div className="field-body">
            <div className="select">
              <select
                onChange={e => {
                  setType(e.target.value as RankingType);
                }}
              >
                <option value={RankingType.Daily}>日間</option>
                <option value={RankingType.Weekly}>週間</option>
                <option value={RankingType.Monthly}>月間</option>
                <option value={RankingType.Quarter}>四半期</option>
              </select>
            </div>
          </div>
        </div>
        <FilterComponent onChange={setFilter} />
        {loading ? (
          <progress className="progress is-primary" max="100">
            loading
          </progress>
        ) : (
          <></>
        )}
        <RankingRender ranking={ranking} filter={filter} />
      </div>
    </>
  );
};

export default Ranking;
