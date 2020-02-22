import React, { useState, useCallback } from "react";
import { parseISO, format } from "date-fns";
import {
  RankingHistories,
  RankingHistoryItem
} from "../../interface/RankingHistory";
import { RankingType } from "narou";
import store from "store";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts";

const RankingHistoryCharts: React.FC<{ ranking: RankingHistoryItem[] }> = ({
  ranking
}) => {
  const data = ranking.map(({date, rank, pt})=> ({date: format(parseISO(date), "yyyy年MM月dd日"), 順位: rank, ポイント: pt}))
  return (
    <div className="columns">
      <div className="column">
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
            />
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
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="column">
        <table className="table">
          <thead>
            <th>日付</th>
            <th>順位</th>
            <th>ポイント</th>
          </thead>
          {data.map(({ date, 順位, ポイント }) => (
            <tr>
              <td>{date}</td>
              <td>{順位}</td>
              <td>{ポイント}</td>
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
      <h2>ランキング履歴</h2>
      <div className="tabs is-toggle is-fullwidth">
        <ul>
          <li className={type === RankingType.Daily ? "is-active" : ""}>
            <a
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
            <a
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
            <a
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
            <a
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
      <RankingHistoryCharts ranking={ranking[type]} />
    </>
  );
};
