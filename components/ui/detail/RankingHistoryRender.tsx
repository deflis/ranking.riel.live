import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { DateTime } from "luxon";
import { RankingType } from "narou/src/index.browser";
import React, { useMemo, useState } from "react";

import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  RankingHistories,
  RankingHistoryItem,
} from "../../../modules/data/types";
import { RankingTypeName } from "../../../modules/interfaces/RankingType";
import { Paper } from "../atoms/Paper";
import { Link as RouterLink } from "@tanstack/react-location";
import { convertDate } from "../../../modules/utils/date";

function* rangeDate(start: DateTime, end: DateTime, type: RankingType) {
  if (!start) return;
  let date = start;
  while (date <= end) {
    yield date;
    switch (type) {
      case RankingType.Daily:
        date = date.plus({ day: 1 });
        break;
      case RankingType.Weekly:
        date = date.plus({ week: 1 });
        break;
      case RankingType.Monthly:
      case RankingType.Quarterly:
        date = date.plus({ month: 1 });
        break;
    }
  }
}

type DataType = {
  date: Date;
  rank: number | null;
  pt: number | null;
};
const RankingHistoryCharts: React.FC<{
  ranking: RankingHistoryItem[];
  type: RankingType;
}> = ({ ranking, type }) => {
  const date = ranking.map(({ date }) => date);
  const minDate = date[0];
  const maxDate = date[date.length - 1];

  const data = Array.from(rangeDate(minDate, maxDate, type))
    .map(
      (date) =>
        ranking.find((item) => date.equals(item.date)) ?? {
          date,
          rank: null,
          pt: null,
        }
    )
    .map(({ date, rank, pt }) => ({
      date: date.toFormat("yyyy年MM月dd日(E)"),
      順位: rank,
      ポイント: pt,
    }));
  return (
    <div>
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="順位"
              yAxisId="left"
              stroke={"blue"}
            />
            <Line
              type="monotone"
              dataKey="ポイント"
              yAxisId="right"
              stroke={"red"}
            />
            <CartesianGrid stroke={"red"} />
            <YAxis
              reversed
              domain={[1, 300]}
              ticks={[10, 50, 100, 300]}
              allowDataOverflow
              scale="log"
              yAxisId="left"
              axisLine={{ stroke: "red" }}
              tickLine={{ stroke: "red" }}
              tick={{ fill: "red" }}
              label={{
                value: "順位",
                position: "insideTopLeft",
                fill: "red",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: "blue" }}
              tickLine={{ stroke: "blue" }}
              tick={{ fill: "blue" }}
              label={{
                value: "ポイント",
                position: "insideTopRight",
                fill: "blue",
              }}
            />
            <XAxis dataKey="date" tick={{ fill: "red" }} />
            <Brush dataKey="date" height={30} stroke={"red"} fill={"white"}>
              <LineChart>
                <Line
                  type="monotone"
                  dataKey="順位"
                  yAxisId="left"
                  stroke={"blue"}
                  dot={false}
                />
                <YAxis
                  reversed
                  domain={[1, 300]}
                  allowDataOverflow
                  scale="log"
                  yAxisId="left"
                  hide
                />
              </LineChart>
            </Brush>
            <Tooltip contentStyle={{ background: "white" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <table>
          <thead>
            <tr>
              <th>日付</th>
              <th>順位</th>
              <th>ポイント</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map(({ date, rank, pt }) => (
              <tr key={date.toUnixInteger()}>
                <td>
                  <RouterLink to={`/ranking/${type}/${date.toISODate()}`}>
                    {date.toFormat("yyyy年MM月dd日(E)")}
                  </RouterLink>
                </td>
                <td>{rank}位</td>
                <td>{pt.toLocaleString()}pt</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RankingTabs = [
  RankingType.Daily,
  RankingType.Weekly,
  RankingType.Monthly,
  RankingType.Quarterly,
];
const rankingHistoryTypeAtom = atomWithStorage<RankingType>(
  "HistoryRankingType",
  RankingType.Daily
);
const tabIndexAtom = atom<number, number>(
  (get) => RankingTabs.findIndex((x) => x === get(rankingHistoryTypeAtom)),
  (_, set, index) => {
    set(rankingHistoryTypeAtom, RankingTabs[index]);
  }
);
export const RankingHistoryRender: React.FC<{ ranking: RankingHistories }> = ({
  ranking,
}) => {
  const [selectedIndex, setSelectedIndex] = useAtom(tabIndexAtom);
  if (
    ranking[RankingType.Daily].length === 0 &&
    ranking[RankingType.Weekly].length === 0 &&
    ranking[RankingType.Monthly].length === 0 &&
    ranking[RankingType.Quarterly].length === 0
  ) {
    return null;
  }
  return (
    <Paper>
      <h2>ランキング履歴</h2>
      <div className="w-full px-2 py-16 sm:px-0">
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {RankingTabs.map((type) => (
              <Tab
                key={type}
                className={({ selected }) =>
                  clsx(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                    selected
                      ? "bg-white shadow"
                      : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                  )
                }
                disabled={ranking[type].length == 0}
              >
                {RankingTypeName.get(type)}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2">
            {RankingTabs.map((type) => (
              <Tab.Panel
                key={type}
                className={clsx(
                  "rounded-xl bg-white p-3",
                  "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
                )}
              >
                <RankingHistoryCharts ranking={ranking[type]} type={type} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Paper>
  );
};
