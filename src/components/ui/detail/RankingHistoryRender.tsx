import { Tab, TabGroup, TabList, TabPanels } from "@headlessui/react";
import { Link as RouterLink } from "@tanstack/react-router";
import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { RankingType } from "narou";
import { FaTrophy } from "react-icons/fa";

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
				rank: "oklch(54.6% 0.245 262.881)",
				pt: "oklch(58.6% 0.253 17.585)",
				text: "oklch(27.8% 0.033 256.848)",
				bg: "#fff",
			}
		: {
				// dark mode
				rank: "oklch(70.7% 0.165 254.624)",
				pt: "oklch(71.2% 0.194 13.428)",
				text: "oklch(87% 0 none)",
				bg: "oklch(26.9% 0 none)",
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
		<div className={styles.columns}>
			<div className={styles.chartColumn}>
				<RankingHistoryChart data={data} colors={graphColor} />
			</div>

			<div className={styles.tableColumn}>
				<table className={styles.table}>
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
								<td className={styles.center}>
									<RouterLink
										to="/ranking/{-$type}/{-$date}"
										params={(prev) => ({
											...prev,
											type: type,
											date: date,
										})}
										className={styles.link}
									>
										{formatJapaneseDate(Temporal.PlainDate.from(date), true)}
									</RouterLink>
								</td>
								<td className={styles.right}>
									{rank === 1 && <FaTrophy className={styles.gold} />}
									{rank === 2 && <FaTrophy className={styles.silver} />}
									{rank === 3 && <FaTrophy className={styles.bronze} />}
									{rank}位
								</td>
								<td className={styles.right}>{pt.toLocaleString()}pt</td>
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
		<Paper className={styles.panel}>
			<h2 className={styles.title}>ランキング履歴</h2>
			<div>
				<TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
					<TabList className={styles.tabs}>
						<div className={styles.tabStrip}>
							{RankingTabs.map((type) => (
								<Tab
									key={type}
									className={({ selected }) =>
										[
											styles.tab,
											selected
												? styles.selected
												: ranking[type].length !== 0
													? styles.available
													: styles.unavailable,
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
					<TabPanels className={styles.panels}>
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
