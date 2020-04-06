import React, { useState, useCallback } from "react";
import {
  RankingHistories,
  RankingHistoryItem
} from "../../interface/RankingHistory";
import { RankingType } from "narou";
import store from "store";
import {
  parseISO,
  format,
  addDays,
  isEqual,
  formatISO,
  addMonths,
  isAfter
} from "date-fns/esm";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Brush
} from "recharts";
import { Link } from "react-router-dom";
import { ja } from 'date-fns/locale';

function* rangeDate(start: Date, end: Date, type: RankingType) {
  if (!start) return;
  let date = new Date(start.getTime());
  while (!isAfter(date, end)) {
    yield date;
    switch (type) {
      case RankingType.Daily:
        date = addDays(date, 1);
        break;
      case RankingType.Weekly:
        date = addDays(date, 7);
        break;
      case RankingType.Monthly:
        date = addMonths(date, 1);
        break;
      case RankingType.Quarterly:
        date = addMonths(date, 1);
        break;
    }
  }
}

const RankingHistoryCharts: React.FC<{
  ranking: RankingHistoryItem[];
  type: RankingType;
}> = ({ ranking, type }) => {
  const parsedRanking = ranking.map(({ date, ...other }) => ({
    date: parseISO(date),
    ...other
  }));
  const date = parsedRanking.map(({ date }) => date);
  const minDate = date[0];
  const maxDate = date[date.length - 1];
  const data = Array.from(rangeDate(minDate, maxDate, type))
    .map(
      date =>
        parsedRanking.find(item => isEqual(item.date, date)) ?? {
          date,
          rank: null,
          pt: null
        }
    )
    .map(({ date, rank, pt }) => ({
      date: format(date, "yyyy年MM月dd日(E)", {locale:ja}),
      順位: rank,
      ポイント: pt
    }));
  return (
    <div className="columns">
      <div className="column is-three-quarters-desktop">
        <h3 className="subtitle">順位</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="順位" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis
              reversed
              domain={[1, 300]}
              ticks={[10, 50, 100, 300]}
              allowDataOverflow
              scale="log"
            />
            <Brush dataKey="date" height={30} stroke="#8884d8" />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
        <h3 className="subtitle">ポイント</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <Line type="monotone" dataKey="ポイント" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Brush dataKey="date" height={30} stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="column">
        <table className="table is-fullwidth">
          <thead>
            <th>日付</th>
            <th>順位</th>
            <th>ポイント</th>
          </thead>
          {parsedRanking.map(({ date, rank, pt }) => (
            <tr>
              <td>
                <Link
                  to={`/ranking/${type}/${formatISO(date, {
                    representation: "date"
                  })}`}
                >
                  {format(date, "yyyy年MM月dd日(E)", {locale:ja})}
                </Link>
              </td>
              <td>{rank}位</td>
              <td>{pt.toLocaleString()}pt</td>
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
};

export const RankingHistoryRender: React.FC<{ ranking: RankingHistories }> = ({
  ranking
}) => {
  const [type, setType_] = useState<RankingType>(
    store.get("HistoryRankingType", RankingType.Daily)
  );
  const setType = useCallback((type: RankingType) => {
    setType_(type);
    store.set("HistoryRankingType", type);
  }, []);
  return (
    <>
      <h2 className="title">ランキング履歴</h2>
      <div className="tabs is-toggle is-fullwidth">
        <ul>
          <li className={type === RankingType.Daily ? "is-active" : ""}>
            <a // eslint-disable-line jsx-a11y/anchor-is-valid
              href="#"
              onClick={e => {
                e.preventDefault();
                setType(RankingType.Daily);
              }}
            >
              <span>日間</span>
            </a>
          </li>
          <li className={type === RankingType.Weekly ? "is-active" : ""}>
            <a // eslint-disable-line jsx-a11y/anchor-is-valid
              href="#"
              onClick={e => {
                e.preventDefault();
                setType(RankingType.Weekly);
              }}
            >
              <span>週間</span>
            </a>
          </li>
          <li className={type === RankingType.Monthly ? "is-active" : ""}>
            <a // eslint-disable-line jsx-a11y/anchor-is-valid
              href="#"
              onClick={e => {
                e.preventDefault();
                setType(RankingType.Monthly);
              }}
            >
              <span>月間</span>
            </a>
          </li>
          <li className={type === RankingType.Quarterly ? "is-active" : ""}>
            <a // eslint-disable-line jsx-a11y/anchor-is-valid
              href="#"
              onClick={e => {
                e.preventDefault();
                setType(RankingType.Quarterly);
              }}
            >
              <span>四半期</span>
            </a>
          </li>
        </ul>
      </div>
      <RankingHistoryCharts ranking={ranking[type]} type={type} />
    </>
  );
};
