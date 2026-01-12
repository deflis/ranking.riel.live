import { QueryErrorResetBoundary } from "@tanstack/react-query";
import {
	createFileRoute,
	createLink,
	useNavigate,
} from "@tanstack/react-router";
import { DateTime } from "luxon";
import { RankingType } from "narou";
import { Suspense, useCallback, useMemo, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";

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
import { addDate, convertDate } from "@/modules/utils/date";

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

const minDate = DateTime.fromObject(
	{ year: 2013, month: 5, day: 1 },
	{ zone: "Asia/Tokyo" },
);
const maxDate = DateTime.now().setZone("Asia/Tokyo").startOf("day");

export const Route = createFileRoute("/ranking/{-$type}/{-$date}")({
	loader: async ({
		context: { queryClient },
		params: { type: typeParam, date: dateParam },
	}) => {
		const type = (typeParam as RankingType) ?? RankingType.Daily;
		const dt = !dateParam
			? DateTime.now().minus({ hour: 12 }).setZone("Asia/Tokyo").startOf("day")
			: DateTime.fromISO(dateParam);
		const date = convertDate(dt, type);

		await prefetchRanking(queryClient, type, date);
	},
	component: RankingPage,
});

function RankingPage() {
	const { type: typeParam, date: dateParam } = Route.useParams();
	const type = (typeParam as RankingType) ?? RankingType.Daily;

	const date = useMemo(() => {
		const dt = !dateParam
			? DateTime.now().minus({ hour: 12 }).setZone("Asia/Tokyo").startOf("day")
			: DateTime.fromISO(dateParam, { zone: "Asia/Tokyo" });
		return convertDate(dt, type);
	}, [dateParam, type]);

	const isNow = !dateParam;
	const navigate = useNavigate();

	const dateInputRef = useRef<HTMLInputElement>(null);

	if (dateInputRef.current) {
		dateInputRef.current.value = date.toISODate() ?? "";
	}

	const handleDateCommit = useCallback(
		(value: string) => {
			const newDate = DateTime.fromISO(value, { zone: "Asia/Tokyo" });
			if (newDate.isValid) {
				navigate({
					to: "/ranking/{-$type}/{-$date}",
					params: (prev) => ({
						...prev,
						type: type ?? undefined,
						date: newDate.toISODate() ?? undefined,
					}),
				});
			}
		},
		[type, navigate],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "Enter") {
				handleDateCommit(e.currentTarget.value);
			}
		},
		[handleDateCommit],
	);

	const handleBlur = useCallback(
		(e: React.FocusEvent<HTMLInputElement>) => {
			handleDateCommit(e.target.value);
		},
		[handleDateCommit],
	);

	return (
		<>
			<div className="mx-4 mt-2">
				<Paper className="mb-6 space-x-2 p-2 bg-white dark:bg-zinc-800 dark:border-zinc-700">
					<SelectBox
						value={type}
						onChange={(newType: RankingType) =>
							navigate({
								to: "/ranking/{-$type}/{-$date}",
								params: (prev) => ({
									...prev,
									type: newType,
									date: isNow ? undefined : (date.toISODate() ?? undefined),
								}),
							})
						}
						options={rankingTypeList.map((value) => ({
							value,
							label: RankingTypeName[value],
						}))}
					/>
					{date > minDate && (
						<ButtonLink
							as="a"
							to="/ranking/{-$type}/{-$date}"
							params={(prev) => ({
								...prev,
								type,
								date: addDate(date, type, -1).toISODate() ?? undefined,
							})}
						>
							前
						</ButtonLink>
					)}
					<TextField
						ref={dateInputRef}
						min={minDate.toISODate() ?? ""}
						max={maxDate.toISODate() ?? ""}
						defaultValue={date.toISODate() ?? ""}
						type="date"
						step={rankingTypeSteps[type]}
						onBlur={handleBlur}
						onKeyDown={handleKeyDown}
					/>
					{date < maxDate && (
						<ButtonLink
							as="a"
							to="/ranking/{-$type}/{-$date}"
							params={(prev) => ({
								...prev,
								type,
								date: addDate(date, type, 1).toISODate() ?? undefined,
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
				{({ reset }) => (
					<ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
						<Suspense fallback={<DotLoader />}>
							<RankingList type={type} date={date} />
						</Suspense>
					</ErrorBoundary>
				)}
			</QueryErrorResetBoundary>
		</>
	);
}

function RankingList({ type, date }: { type: RankingType; date: DateTime }) {
	const { data } = useRanking(type, date.toISODate() ?? "");
	return <RankingRender ranking={data} />;
}
