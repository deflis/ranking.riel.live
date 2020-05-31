import React, { useState, useCallback } from "react";
import { RankingResult } from "narou";
import ky from "ky";
import {
  format,
  formatISO,
  setDay,
  startOfMonth,
  addDays,
  getDay,
  addHours,
} from "date-fns/esm";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FilterComponent } from "../components/ranking/Filter";
import { Filter } from "../interface/Filter";
import { useParams, useHistory } from "react-router-dom";
import { parseISO } from "date-fns";
import { RankingRender } from "../components/ranking/RankingRender";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import { RankingType, RankingTypeName } from "../interface/RankingType";
import { TwitterShare } from "../components/common/TwitterShare";
import { useAsync, useTitle } from "react-use";

export type RankingParams = {
  date?: string;
  type?: string;
};

function formatDate(date: Date, type: RankingType): string {
  return formatISO(convertDate(date, type), { representation: "date" });
}

function convertDate(date: Date, type: RankingType): Date {
  switch (type) {
    case RankingType.Daily:
    default:
      return date;
    case RankingType.Weekly:
      return addDays(setDay(date, 2), getDay(date) < 2 ? -7 : 0);
    case RankingType.Monthly:
      return startOfMonth(date);
    case RankingType.Quarter:
      return startOfMonth(date);
  }
}

const Ranking: React.FC = () => {
  const history = useHistory();
  const { date: _date, type: _type } = useParams<RankingParams>();

  const [filter, setFilter] = useState(Filter.init());
  const { value, loading } = useAsync(async () => {
    const type = (_type as RankingType) ?? RankingType.Daily;
    const date = _date ? parseISO(_date) : addHours(new Date(), -12);
    const result = await ky(`/api/ranking/${type}/${formatDate(date, type)}`);
    return (await result.json()) as RankingResult[];
  }, [_date, _type]);
  const ranking = value ?? [];

  const onTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const defaultDate = addHours(new Date(), -12);
      const date = _date ? parseISO(_date) : defaultDate;
      const type = e.target.value as RankingType;
      if (formatDate(date, type) !== formatDate(defaultDate, type)) {
        history.push(`/ranking/${type}/${formatDate(date, type)}`);
      } else if (type === RankingType.Daily) {
        history.push(`/`);
      } else {
        history.push(`/ranking/${type}`);
      }
    },
    [_date, history]
  );

  const onDateChange = useCallback(
    (date: Date | null) => {
      const defaultDate = addHours(new Date(), -12);
      const type = (_type as RankingType) ?? RankingType.Daily;
      if (date && formatDate(date, type) !== formatDate(defaultDate, type)) {
        history.push(`/ranking/${type}/${formatDate(date, type)}`);
      } else if (type === RankingType.Daily) {
        history.push(`/`);
      } else {
        history.push(`/ranking/${type}`);
      }
    },
    [_type, history]
  );

  const clearDate = useCallback(() => onDateChange(null), [onDateChange]);

  const type = (_type as RankingType) ?? RankingType.Daily;
  const date = convertDate(
    _date ? parseISO(_date) : addHours(new Date(), -12),
    type
  );

  useTitle(
    `${_date ? format(date, "yyyy/MM/dd") : "最新"}の${RankingTypeName.get(
      type
    )}ランキング - なろうランキングビューワ`
  );

  return (
    <div className="container">
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">日付</label>
        </div>
        <div className="field-body">
          <div className="field has-addons">
            <div className="control has-icons-left">
              <ReactDatePicker
                className="input"
                dateFormat="yyyy/MM/dd"
                minDate={new Date(2013, 5, 1)}
                maxDate={new Date()}
                selected={date}
                onChange={onDateChange}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faCalendar} />
              </span>
            </div>
            <p className="control">
              <button className="button is-info" onClick={clearDate}>
                リセット
              </button>
            </p>
          </div>
        </div>
        <div className="field-label">
          <label className="label">種類</label>
        </div>
        <div className="field-body">
          <div className="field has-addons">
            <div className="select">
              <select value={type} onChange={onTypeChange}>
                <option value={RankingType.Daily}>日間</option>
                <option value={RankingType.Weekly}>週間</option>
                <option value={RankingType.Monthly}>月間</option>
                <option value={RankingType.Quarter}>四半期</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field-body">
          <TwitterShare
            title={`${
              _date ? format(date, "yyyy/MM/dd") : "最新"
            }の${RankingTypeName.get(type)}ランキング`}
          >
            ランキングを共有
          </TwitterShare>
        </div>
      </div>
      <FilterComponent onChange={setFilter} />

      {loading ? (
        <progress className="progress is-primary" max="100">
          loading
        </progress>
      ) : (
        <RankingRender ranking={ranking} filter={filter} />
      )}
    </div>
  );
};

export default Ranking;
