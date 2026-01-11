import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { RankingType } from "narou";
import React, { useCallback, useMemo } from "react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/atoms/Button";
import { Paper } from "@/components/ui/atoms/Paper";
import { SelectBox } from "@/components/ui/atoms/SelectBox";
import { TextField } from "@/components/ui/atoms/TextField";
import { FilterComponent } from "@/components/ui/ranking/Filter";
import { RankingRender } from "@/components/ui/ranking/RankingRender";
import useRanking from "@/modules/data/ranking";
import { RankingTypeName } from "@/modules/interfaces/RankingType";
import { addDate, convertDate } from "@/modules/utils/date";

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

export const Route = createFileRoute("/ranking/$type/$date")({
	component: RankingPage,
});

function RankingPage() {
	const { type: typeParam, date: dateParam } = Route.useParams();
	const type = typeParam as RankingType;

	const date = useMemo(() => {
		const dt =
			dateParam === "now"
				? DateTime.now()
						.minus({ hour: 12 })
						.setZone("Asia/Tokyo")
						.startOf("day")
				: DateTime.fromISO(dateParam);
		return convertDate(dt, type ?? RankingType.Daily);
	}, [dateParam, type]);

	const isNow = dateParam === "now";
	const { data, isLoading } = useRanking(type, date);
	const navigate = useNavigate();

	const handleDateChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const newDate = DateTime.fromISO(e.target.value);
			if (newDate) {
				navigate({
					to: "/ranking/$type/$date",
					params: {
						type,
						date: newDate.toISODate() ?? "now",
					},
				});
			}
		},
		[type, navigate],
	);

	return (
		<>
			<div className="mx-4 mt-2">
				<Paper className="mb-6 space-x-2 p-2 bg-white dark:bg-zinc-800 dark:border-zinc-700">
					<SelectBox
						value={type}
						onChange={(newType: RankingType) =>
							navigate({
								to: "/ranking/$type/$date",
								params: {
									type: newType,
									date: isNow ? "now" : (date.toISODate() ?? "now"),
								},
							})
						}
						options={rankingTypeList.map((value) => ({
							value,
							label: RankingTypeName[value],
						}))}
					/>
					{date > minDate && (
						<Button
							as={Link}
							to="/ranking/$type/$date"
							params={{
								type,
								date: addDate(date, type, -1).toISODate() ?? "now",
							}}
						>
							前
						</Button>
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
						<Button
							as={Link}
							to="/ranking/$type/$date"
							params={{
								type,
								date: addDate(date, type, 1).toISODate() ?? "now",
							}}
						>
							次
						</Button>
					)}
					<Button
						as={Link}
						to="/ranking/$type/$date"
						params={{
							type,
							date: "now",
						}}
						color="primary"
					>
						最新
					</Button>
				</Paper>
				<FilterComponent />
			</div>
			<RankingRender ranking={data} loading={isLoading} />
		</>
	);
}
