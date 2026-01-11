import { useNavigate, createFileRoute, createLink } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { RankingType } from "narou";
import { Suspense, useCallback, useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";

import { Button } from "@/components/ui/atoms/Button";
import { DotLoader } from "@/components/ui/atoms/Loader";
import { Paper } from "@/components/ui/atoms/Paper";
import { SelectBox } from "@/components/ui/atoms/SelectBox";
import { TextField } from "@/components/ui/atoms/TextField";
import { ErrorFallback } from "@/components/ui/common/ErrorFallback";
import { FilterComponent } from "@/components/ui/ranking/Filter";
import { RankingRender } from "@/components/ui/ranking/RankingRender";
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

const minDate = DateTime.fromObject({ year: 2013, month: 5, day: 1 });
const maxDate = DateTime.now().setZone("Asia/Tokyo").startOf("day");

export const Route = createFileRoute("/ranking/{-$type}/{-$date}")({
	component: RankingPage,
});

function RankingPage() {
	const { type: typeParam, date: dateParam } = Route.useParams();
	const type = (typeParam as RankingType) ?? RankingType.Daily;

	const date = useMemo(() => {
		const dt = !dateParam
			? DateTime.now().minus({ hour: 12 }).setZone("Asia/Tokyo").startOf("day")
			: DateTime.fromISO(dateParam);
		return convertDate(dt, type);
	}, [dateParam, type]);

	const isNow = !dateParam;
	const navigate = useNavigate();

	const handleDateChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newDate = DateTime.fromISO(e.target.value);
			if (newDate) {
				navigate({
					to: "/ranking/{-$type}/{-$date}",
					params: {
						type: type ?? undefined,
						date: newDate.toISODate() ?? undefined,
					},
				})
			}
		},
		[type, navigate],
	)

	return (
		<>
			<div className="mx-4 mt-2">
				<Paper className="mb-6 space-x-2 p-2 bg-white dark:bg-zinc-800 dark:border-zinc-700">
					<SelectBox
						value={type}
						onChange={(newType: RankingType) =>
							navigate({
								to: "/ranking/{-$type}/{-$date}",
								params: {
									type: newType,
									date: isNow ? undefined : (date.toISODate() ?? undefined),
								},
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
							params={{
								type,
								date: addDate(date, type, -1).toISODate() ?? undefined,
							}}
						>
							前
						</ButtonLink>
					)}
					<TextField
						min={minDate.toISODate() ?? ""}
						max={maxDate.toISODate() ?? ""}
						value={date.toISODate() ?? ""}
						type="date"
						step={rankingTypeSteps[type]}
						onChange={handleDateChange}
					/>
					{date < maxDate && (
						<ButtonLink
							as="a"
							to="/ranking/{-$type}/{-$date}"
							params={{
								type,
								date: addDate(date, type, 1).toISODate() ?? undefined,
							}}
						>
							次
						</ButtonLink>
					)}
					<ButtonLink
						as="a"
						to="/ranking/{-$type}/{-$date}"
						params={{
							type: type,
						}}
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
	)
}

function RankingList({ type, date }: { type: RankingType; date: DateTime }) {
	const { data } = useRanking(type, date);
	return <RankingRender ranking={data} />;
}
