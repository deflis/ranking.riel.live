import { QueryErrorResetBoundary } from "@tanstack/react-query";
import {
	CatchBoundary,
	createFileRoute,
	createLink,
	useNavigate,
} from "@tanstack/react-router";
import { RankingType } from "narou";
import { Suspense, useRef } from "react";

import { Button } from "@/components/ui/atoms/Button";
import { DotLoader } from "@/components/ui/atoms/Loader";
import { Paper } from "@/components/ui/atoms/Paper";
import { SelectBox } from "@/components/ui/atoms/SelectBox";
import { TextField } from "@/components/ui/atoms/TextField";
import { ErrorFallback } from "@/components/ui/common/ErrorFallback";
import { FilterComponent } from "@/components/ui/ranking/Filter";
import { RankingRender } from "@/components/ui/ranking/RankingRender";
import { prefetchRanking } from "@/modules/data/prefetch";
import useRanking from "@/modules/data/ranking";
import { RankingTypeName } from "@/modules/interfaces/RankingType";
import {
	MAIN_PAGE_CACHE_OPTIONS,
	createCacheHeaders,
} from "@/modules/utils/cacheMiddleware";
import { addDate, convertDate } from "@/modules/utils/date";
import { nowInTokyo } from "@/modules/utils/temporal";

import styles from "@/components/ui/ranking/RankingPage.module.css";

const ButtonLink = createLink(Button);

const rankingTypeList = [
	RankingType.Daily,
	RankingType.Weekly,
	RankingType.Monthly,
	RankingType.Quarterly,
] as const;

const rankingTypeSteps = {
	[RankingType.Daily]: "1",
	[RankingType.Weekly]: "7",
	[RankingType.Monthly]: "",
	[RankingType.Quarterly]: "",
} as const;

const minDate = Temporal.PlainDate.from("2013-05-01");
const maxDate = nowInTokyo().toPlainDate();

export const Route = createFileRoute("/ranking/{-$type}/{-$date}")({
	loader: async ({
		context: { queryClient },
		params: { type: typeParam, date: dateParam },
	}) => {
		const type = (typeParam as RankingType) ?? RankingType.Daily;
		const dt = !dateParam
			? nowInTokyo().toPlainDate()
			: Temporal.PlainDate.from(dateParam);
		const date = convertDate(dt, type);

		return {
			date: await prefetchRanking(queryClient, type, date, !dateParam),
		};
	},
	component: RankingPage,
	head: ({ params: { type: typeParam }, loaderData }) => {
		const type = (typeParam as RankingType) ?? RankingType.Daily;
		if (!loaderData) return {};
		const date = Temporal.PlainDate.from(loaderData.date);
		return {
			meta: [
				{
					title: `${date.year}年${date.month}月${date.day}日の${RankingTypeName[type]}ランキング - なろうランキングビューワ`,
				},
			],
		};
	},
	headers: ({ params: { date } }) => {
		if (!date) {
			return createCacheHeaders({
				...MAIN_PAGE_CACHE_OPTIONS,
				maxAge: 60 * 5,
				sMaxAge: 60 * 5,
			});
		}

		return createCacheHeaders(MAIN_PAGE_CACHE_OPTIONS);
	},
});

function RankingPage() {
	const { type: typeParam, date: dateParam } = Route.useParams();
	const type = (typeParam as RankingType) ?? RankingType.Daily;

	const { date: resolvedDate } = Route.useLoaderData();
	const date = Temporal.PlainDate.from(resolvedDate);

	const isNow = !dateParam;
	const navigate = useNavigate();

	const dateInputRef = useRef<HTMLInputElement>(null);

	if (dateInputRef.current) {
		dateInputRef.current.value = date.toString();
	}

	const handleDateCommit = (value: string) => {
		try {
			const newDate = Temporal.PlainDate.from(value);
			navigate({
				to: "/ranking/{-$type}/{-$date}",
				params: (prev) => ({
					...prev,
					type: type ?? undefined,
					date: newDate.toString(),
				}),
			});
		} catch {
			// 無効な日付の場合は何もしない
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleDateCommit(e.currentTarget.value);
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		handleDateCommit(e.target.value);
	};

	return (
		<>
			<div className={styles.container}>
				<Paper className={styles.controls}>
					<SelectBox
						value={type}
						onChange={(newType: RankingType) =>
							navigate({
								to: "/ranking/{-$type}/{-$date}",
								params: (prev) => ({
									...prev,
									type: newType,
									date: isNow ? undefined : date.toString(),
								}),
							})
						}
						options={rankingTypeList.map((value) => ({
							value,
							label: RankingTypeName[value],
						}))}
					/>
					{Temporal.PlainDate.compare(date, minDate) > 0 && (
						<ButtonLink
							as="a"
							to="/ranking/{-$type}/{-$date}"
							params={(prev) => ({
								...prev,
								type,
								date: addDate(date, type, -1).toString(),
							})}
						>
							前
						</ButtonLink>
					)}
					<TextField
						ref={dateInputRef}
						min={minDate.toString()}
						max={maxDate.toString()}
						defaultValue={date.toString()}
						type="date"
						step={rankingTypeSteps[type]}
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
					/>
					{Temporal.PlainDate.compare(date, maxDate) < 0 && (
						<ButtonLink
							as="a"
							to="/ranking/{-$type}/{-$date}"
							params={(prev) => ({
								...prev,
								type,
								date: addDate(date, type, 1).toString(),
							})}
						>
							次
						</ButtonLink>
					)}
					<ButtonLink
						as="a"
						to="/ranking/{-$type}/{-$date}"
						params={(prev) => ({
							...prev,
							type: type,
							date: undefined,
						})}
						color="primary"
					>
						最新
					</ButtonLink>
				</Paper>
				<FilterComponent />
			</div>
			<QueryErrorResetBoundary>
				<CatchBoundary getResetKey={() => ""} errorComponent={ErrorFallback}>
					<Suspense fallback={<DotLoader />}>
						<RankingList type={type} date={date} />
					</Suspense>
				</CatchBoundary>
			</QueryErrorResetBoundary>
		</>
	);
}

function RankingList({
	type,
	date,
}: {
	type: RankingType;
	date: Temporal.PlainDate;
}) {
	const { data } = useRanking(type, date.toString());
	return <RankingRender ranking={data} />;
}
