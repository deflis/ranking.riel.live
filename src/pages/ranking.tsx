import React, { useState, useEffect, useCallback } from "react";
import { RankingResult } from "narou";
import ky from "ky";
import { formatISO, setDay, startOfMonth, addDays, getDay } from "date-fns/esm";
import { addHours } from "date-fns/esm";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FilterComponent, Filter } from "../components/ranking/Filter";
import { useParams, useHistory } from "react-router-dom";
import { parseISO } from "date-fns";
import { RankingRender } from "../components/ranking/RankingRender";

export type RankingParams = {
  date?: string;
  type?: string;
};

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

const Ranking: React.FC = () => {
  const history = useHistory();
  const { date: _date, type: _type } = useParams<RankingParams>();

  const [ranking, setRanking] = useState<RankingResult[]>([]);
  const [filter, setFilter] = useState(new Filter());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const type = (_type as RankingType) ?? RankingType.Daily;
    const date = _date ? parseISO(_date) : addHours(new Date(), -12);
    let didCancel = false;
    setLoading(true);
    setRanking([]);
    (async () => {
      const result = await ky(`/api/${type}/${formatDate(date, type)}`);
      if (!didCancel) {
        setRanking(await result.json());
        setLoading(false);
      }
    })();
    return () => {
      didCancel = true;
    };
  }, [_date, _type]);

  const onTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const date = _date ? parseISO(_date) : addHours(new Date(), -12);
      const type = e.target.value as RankingType;
      if (type === RankingType.Daily) {
        if (
          formatDate(date, type) !== formatDate(addHours(new Date(), -12), type)
        ) {
          history.push(`/ranking/${type}`);
        } else {
          history.push(`/`);
        }
      } else {
        history.push(`/ranking/${type}/${formatDate(date, type)}`);
      }
    },
    [_date, history]
  );

  const onDateChange = useCallback(
    (date: Date | null) => {
      const type = (_type as RankingType) ?? RankingType.Daily;
      if (date && type === RankingType.Daily) {
        if (
          formatDate(date, type) !== formatDate(addHours(new Date(), -12), type)
        ) {
          history.push(`/ranking/${type}/${formatDate(date, type)}  `);
        } else {
          history.push(`/`);
        }
      } else if (date) {
        history.push(`/ranking/${type}/${formatDate(date, type)}`);
      }
    },
    [_type, history]
  );

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
                selected={_date ? parseISO(_date) : addHours(new Date(), -12)}
                onChange={onDateChange}
              />
            </div>
          </div>
          <div className="field-label">
            <label className="label">種類</label>
          </div>
          <div className="field-body">
            <div className="select">
              <select value={_type ?? RankingType.Daily} onChange={onTypeChange}>
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
