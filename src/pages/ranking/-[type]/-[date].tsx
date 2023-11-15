import { DateTime } from "luxon";
import { RankingType } from "narou/browser";
import React, { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTitle } from "react-use";

import { Button } from "@/components/ui/atoms/Button";
import { Paper } from "@/components/ui/atoms/Paper";
import { SelectBox } from "@/components/ui/atoms/SelectBox";
import { TextField } from "@/components/ui/atoms/TextField";
import { FilterComponent } from "@/components/ui/ranking/Filter";
import { RankingRender } from "@/components/ui/ranking/RankingRender";
import useRanking from "@/modules/data/ranking";
import { RankingTypeName } from "@/modules/interfaces/RankingType";
import { rankingParams, rankingPath } from "@/modules/paths/createPaths";
import { addDate, convertDate } from "@/modules/utils/date";
import { useNavigate, useParams } from "@/router";

const rankingTypeList = [
  RankingType.Daily,
  RankingType.Weekly,
  RankingType.Monthly,
  RankingType.Quarterly,
] as const;

export type RankingParams = {
  date?: string;
  type?: RankingType;
};

const rankingTypeSteps = {
  [RankingType.Daily]: "1",
  [RankingType.Weekly]: "7",
  [RankingType.Monthly]: "",
  [RankingType.Quarterly]: "",
} as const;

const minDate = DateTime.fromObject({ year: 2013, month: 5, day: 1 });
const maxDate = DateTime.now().setZone("Asia/Tokyo").startOf("day");

const useRankingParams = (): [RankingType, DateTime, boolean] => {
  const params = useParams("/ranking/:type?/:date?");
  const type = params.type as RankingType;
  const date = useMemo(
    () =>
      convertDate(
        params.date
          ? DateTime.fromISO(params.date)
          : DateTime.now()
              .minus({ hour: 12 })
              .setZone("Asia/Tokyo")
              .startOf("day"),
        (type as RankingType) ?? RankingType.Daily
      ),
    [params.date, type]
  );
  return [type ?? RankingType.Daily, date, !params.date];
};

export const Ranking: React.FC = () => {
  const [type, date, isNow] = useRankingParams();
  const { data, isLoading } = useRanking(type, date);
  const navigate = useNavigate();

  useTitle(
    `${isNow ? "最新" : date.toFormat("yyyy/MM/dd")}の${
      RankingTypeName[type]
    }ランキング - なろうランキングビューワ`
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const date = DateTime.fromISO(e.target.value);
      if (date) {
        navigate("/ranking/:type?/:date?", {
          params: rankingParams(type, date),
        });
      }
    },
    [type]
  );

  return (
    <>
      <div className="mx-4 mt-2">
        <Paper className="mb-6 space-x-2 p-2 bg-white dark:bg-zinc-800 dark:border-zinc-700">
          <SelectBox
            value={type}
            onChange={(type: RankingType) =>
              navigate("/ranking/:type?/:date?", {
                params: rankingParams(type, date),
              })
            }
            options={rankingTypeList.map((value) => ({
              value,
              label: RankingTypeName[value],
            }))}
          />
          {date > minDate && (
            <Button as={Link} to={rankingPath(type, addDate(date, type, -1))}>
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
            <Button as={Link} to={rankingPath(type, addDate(date, type, 1))}>
              次
            </Button>
          )}
          <Button
            as={Link}
            to={rankingPath(
              type,
              DateTime.now()
                .minus({ hour: 12 })
                .setZone("Asia/Tokyo")
                .startOf("day")
            )}
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
};

export default Ranking;
