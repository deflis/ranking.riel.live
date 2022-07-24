import { Tab } from "@headlessui/react";
import clsx from "clsx";
import { atom, useAtom, useAtomValue } from "jotai";
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
import colors from "tailwindcss/colors";
import { FaTrophy } from "react-icons/fa";
import { darkModeAtom } from "../../../modules/atoms/global";

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
  date: string;
  順位: number | null;
  ポイント: number | null;
};

const graphColorAtom = atom((get) =>
  !get(darkModeAtom)
    ? {
        // light mode
        rank: colors.blue[600],
        pt: colors.rose[600],
        text: colors.gray[800],
        bg: colors.white,
      }
    : {
        // darkmode
        rank: colors.blue[400],
        pt: colors.rose[400],
        text: colors.neutral[300],
        bg: colors.neutral[800],
      }
);

const RankingHistoryCharts: React.FC<{
  ranking: RankingHistoryItem[];
  type: RankingType;
}> = ({ ranking, type }) => {
  const graphColor = useAtomValue(graphColorAtom);

  const date = ranking.map(({ date }) => date);
  const minDate = date[0];
  const maxDate = date[date.length - 1];

  const data: DataType[] = Array.from(rangeDate(minDate, maxDate, type))
    .map(
      (date) =>
        ranking.find((item) => date.equals(item.date)) ?? {
          date,
          rank: null,
          pt: null,
        }
    )
    .map(({ date, rank, pt }) => ({
      date: date.toFormat("yyyy年MM月dd日(EEE)"),
      順位: rank,
      ポイント: pt,
    }));
  return (
    <div className="flex flex-col	lg:flex-row">
      <div className="w-full lg:w-2/3 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="順位"
              yAxisId="left"
              stroke={graphColor.rank}
            />
            <Line
              type="monotone"
              dataKey="ポイント"
              yAxisId="right"
              stroke={graphColor.pt}
            />
            <CartesianGrid stroke={graphColor.text} />
            <YAxis
              reversed
              domain={[1, 300]}
              ticks={[10, 50, 100, 300]}
              allowDataOverflow
              scale="log"
              yAxisId="left"
              axisLine={{ stroke: graphColor.rank }}
              tickLine={{ stroke: graphColor.rank }}
              tick={{ fill: graphColor.rank }}
              label={{
                value: "順位",
                fill: graphColor.rank,
                angle: -90,
                dx: -20,
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={{ stroke: graphColor.pt }}
              tickLine={{ stroke: graphColor.pt }}
              tick={{ fill: graphColor.pt }}
              label={{
                value: "ポイント",
                fill: graphColor.pt,
                angle: 90,
                dx: 20,
              }}
            />
            <XAxis dataKey="date" tick={{ fill: graphColor.text }} />
            <Brush
              dataKey="date"
              height={30}
              stroke={graphColor.text}
              fill={graphColor.bg}
            >
              <LineChart>
                <Line
                  type="monotone"
                  dataKey="順位"
                  yAxisId="left"
                  stroke={graphColor.rank}
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
            <Tooltip contentStyle={{ background: graphColor.bg }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="w-full lg:w-1/3 lg:h-96 lg:overflow-auto">
        <table className="w-full table-auto">
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
                <td className="text-center">
                  <RouterLink
                    to={`/ranking/${type}/${date.toISODate()}`}
                    className="text-blue-500 hover:underline dark:text-blue-400"
                  >
                    {date.toFormat("yyyy年MM月dd日(EEE)")}
                  </RouterLink>
                </td>
                <td className="text-right">
                  {rank === 1 && (
                    <FaTrophy className="h-5 w-5 inline text-yellow-500" />
                  )}
                  {rank === 2 && (
                    <FaTrophy className="h-5 w-5 inline text-gray-500 mr-a" />
                  )}
                  {rank === 3 && (
                    <FaTrophy className="h-5 w-5 inline text-yellow-700 mr-a" />
                  )}
                  {rank}位
                </td>
                <td className="text-right">{pt.toLocaleString()}pt</td>
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
    <Paper className="p-2 space-y-2 bg-white dark:bg-zinc-800">
      <h2 className="text-xl font-medium">ランキング履歴</h2>
      <div>
        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="w-full inline-block relative whitespace-nowrap">
            <div className="flex space-x-1 justify-center items-center">
              {RankingTabs.map((type) => (
                <Tab
                  key={type}
                  className={({ selected }) =>
                    clsx(
                      "w-48 py-2.5 text-md leading-5",
                      selected
                        ? "text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400"
                        : ranking[type].length != 0
                        ? "text-gray-700  dark:text-neutral-400 hover:bg-blue-300/[0.12] hover:text-blue-700 dark:hover:text-blue-300 "
                        : "text-gray-300 dark:text-neutral-700"
                    )
                  }
                  disabled={ranking[type].length == 0}
                >
                  {RankingTypeName.get(type)}
                </Tab>
              ))}
            </div>
          </Tab.List>
          <Tab.Panels className="mt-2">
            {RankingTabs.map((type) => (
              <Tab.Panel key={type}>
                <RankingHistoryCharts ranking={ranking[type]} type={type} />
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Paper>
  );
};
