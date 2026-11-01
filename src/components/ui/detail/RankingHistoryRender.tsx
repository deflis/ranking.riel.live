import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { RankingType } from "narou";
import { FaTrophy } from "react-icons/fa";
import colors from "tailwindcss/colors";

import { formatJapaneseDate } from "@/modules/utils/temporal";

import { darkModeAtom } from "../../../modules/atoms/global";
import type {
	RankingHistories,
	RankingHistoryItem,
} from "../../../modules/data/types";
import { RankingTypeName } from "../../../modules/interfaces/RankingType";
import { Paper } from "../atoms/Paper";
import { RankingHistoryChart } from "./RankingHistoryChart";

import styles from "./RankingHistoryRender.module.css";

function* rangeDate(
	start: Temporal.PlainDate,
	end: Temporal.PlainDate,
	type: RankingType,
) {
	if (!start) return;
	let date = start;
	while (Temporal.PlainDate.compare(date, end) <= 0) {
		yield date;
		switch (type) {
			case RankingType.Daily:
				date = date.add({ days: 1 });
				break;
			case RankingType.Weekly:
				date = date.add({ weeks: 1 });
				break;
			case RankingType.Monthly:
			case RankingType.Quarterly:
				date = date.add({ months: 1 });
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
				// dark mode
				rank: colors.blue[400],
				pt: colors.rose[400],
				text: colors.neutral[300],
				bg: colors.neutral[800],
			},
);

const RankingHistoryCharts: React.FC<{
	ranking: RankingHistoryItem[];
	type: RankingType;
}> = ({ ranking, type }) => {
	const graphColor = useAtomValue(graphColorAtom);

	const rankingData = ranking.map(({ date, rank, pt }) => ({
		date: Temporal.PlainDate.from(date),
		rank,
		pt,
	}));
	const dateList = rankingData.map(({ date }) => date);
	const minDate = dateList[0];
	const maxDate = dateList[dateList.length - 1];

	const data: DataType[] = Array.from(rangeDate(minDate, maxDate, type))
		.map((date) => {
			const item = rankingData.find((item) => date.equals(item.date));
			return {
				date,
				rank: item?.rank ?? null,
				pt: item?.pt ?? null,
			};
		})
		.map(({ date, rank, pt }) => ({
			date: formatJapaneseDate(date, true),
			順位: rank,
			ポイント: pt,
		}));
	return (
		<div className="flex flex-col	lg:flex-row">
			<div className="w-full min-w-0 lg:w-2/3 h-96">
				<RankingHistoryChart data={data} colors={graphColor} />
			</div>

			<div className="w-full lg:w-1/3 lg:h-96 lg:overflow-auto">
				<table className="w-full table-auto">
					<thead>
						<tr className={styles.tableRow}>
							<th>日付</th>
							<th>順位</th>
							<th>ポイント</th>
						</tr>
					</thead>
					<tbody>
						{ranking.map(({ date, rank, pt }) => (
							<tr key={date} className={styles.tableRow}>
								<td className="text-center">
									<RouterLink
										to="/ranking/{-$type}/{-$date}"
										params={(prev) => ({
											...prev,
											type: type,
											date: date,
										})}
										className="text-blue-500 hover:underline dark:text-blue-400"
									>
										{formatJapaneseDate(Temporal.PlainDate.from(date), true)}
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
	RankingType.Daily,
);

const tabIndexAtom = atom<number, [number], void>(
	(get) => RankingTabs.findIndex((x) => x === get(rankingHistoryTypeAtom)),
	(_, set, index) => {
		set(rankingHistoryTypeAtom, RankingTabs[index]);
	},
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
				<TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
					<TabList className="w-full inline-block relative whitespace-nowrap">
						<div className="flex space-x-1 justify-center items-center">
							{RankingTabs.map((type) => (
								<Tab
									key={type}
									className={({ selected }) =>
										[
											"w-48 py-2.5 text-md leading-5",
											selected
												? "text-blue-500 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400"
												: ranking[type].length !== 0
													? "text-gray-700  dark:text-neutral-400 hover:bg-blue-300/12 hover:text-blue-700 dark:hover:text-blue-300 "
													: "text-gray-300 dark:text-neutral-700",
										]
											.filter(Boolean)
											.join(" ")
									}
									disabled={ranking[type].length === 0}
								>
									{RankingTypeName[type]}
								</Tab>
							))}
						</div>
					</TabList>
					<TabPanels className="mt-2">
						{RankingTabs.map((type) => (
							<Tab.Panel key={type}>
								<RankingHistoryCharts ranking={ranking[type]} type={type} />
							</Tab.Panel>
						))}
					</TabPanels>
				</TabGroup>
			</div>
		</Paper>
	);
};
