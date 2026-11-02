import { defineChart, lineY } from "@tanstack/charts";
import { d3Curve } from "@tanstack/charts/d3/shape";
import { brushX, type BrushRange } from "@tanstack/charts/interaction/brush";
import { controlledSignal } from "@tanstack/charts/interaction/signal";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { scaleLog } from "d3-scale";
import { curveMonotoneX } from "d3-shape";
import { useMemo, useState, type CSSProperties } from "react";

import styles from "./RankingHistoryChart.module.css";

type HistoryDatum = {
	date: string;
	順位: number | null;
	ポイント: number | null;
};

type GraphColors = {
	rank: string;
	pt: string;
	text: string;
	bg: string;
};

const DEFAULT_MAX_RANGE = 365;
const curve = d3Curve(curveMonotoneX);

export function RankingHistoryChart({
	data,
	colors,
}: {
	data: HistoryDatum[];
	colors: GraphColors;
}) {
	const [range, setRange] = useState<BrushRange<string> | null>(null);
	const dates = useMemo(() => data.map((row) => row.date), [data]);
	const startIndex = range ? Math.max(0, dates.indexOf(range.start)) : 0;
	const endIndex = range
		? Math.max(startIndex, dates.indexOf(range.end))
		: Math.min(data.length - 1, DEFAULT_MAX_RANGE);
	const visibleData = useMemo(
		() => data.slice(startIndex, endIndex + 1),
		[data, startIndex, endIndex],
	);
	const definition = useMemo(
		() =>
			defineChart({
				marks: [
					lineY(visibleData, {
						id: "順位",
						x: "date",
						y: "順位",
						stroke: colors.rank,
						points: true,
						curve,
					}),
					lineY(visibleData, {
						id: "ポイント",
						x: "date",
						y: "ポイント",
						yScale: "points",
						stroke: colors.pt,
						points: true,
						curve,
					}),
				],
				scales: {
					x: { scale: scalePoint().domain(visibleData.map((row) => row.date)) },
					y: {
						scale: scaleLog().domain([1, 300]),
						reverse: true,
						grid: true,
						axis: {
							label: { text: "順位", fill: colors.rank },
							ticks: {
								values: [10, 50, 100, 300],
								format: (value) => `${value}`,
							},
						},
					},
					points: {
						channel: "y",
						scale: scaleLinear,
						side: "right",
						nice: true,
						axis: { label: { text: "ポイント", fill: colors.pt } },
					},
				},
				focus: "group-x",
				maxFocusDistance: Number.POSITIVE_INFINITY,
				tooltip: {
					use: tooltip,
					format: ({ datum }) =>
						`${datum.date}\n順位: ${datum.順位?.toLocaleString() ?? "—"}位\nポイント: ${datum.ポイント?.toLocaleString() ?? "—"}pt`,
				},
				theme: { foreground: colors.text, background: colors.bg },
			}),
		[visibleData, colors],
	);
	const overview = useMemo(
		() =>
			defineChart({
				marks: [
					lineY(data, { x: "date", y: "順位", stroke: colors.rank, curve }),
				],
				scales: {
					x: { scale: scalePoint().domain(dates), axis: false },
					y: { scale: scaleLog().domain([1, 300]), reverse: true, axis: false },
				},
				margin: { top: 4, bottom: 4, left: 16, right: 16 },
				controls:
					dates.length > 1
						? [
								brushX({
									range: controlledSignal(
										{ start: dates[startIndex], end: dates[endIndex] },
										(next) => setRange(next),
									),
									values: dates,
									format: (date) => date,
									ariaLabel: "ランキング履歴の表示期間",
									startAriaLabel: "表示開始日",
									endAriaLabel: "表示終了日",
								}),
							]
						: [],
				theme: { foreground: colors.text, background: colors.bg },
			}),
		[data, dates, startIndex, endIndex, colors],
	);

	if (data.length === 0) return null;

	return (
		<div
			style={
				{
					color: colors.text,
					"--ts-chart-tooltip-background": colors.bg,
					"--ts-chart-tooltip-color": colors.text,
				} as CSSProperties
			}
		>
			<Chart
				definition={definition}
				height={300}
				ariaLabel="順位とポイントの推移"
			/>
			<Chart
				definition={overview}
				height={48}
				ariaLabel="ランキング履歴の期間選択"
			/>
			<output className={styles.range}>
				{dates[startIndex]} ～ {dates[endIndex]}
			</output>
		</div>
	);
}
