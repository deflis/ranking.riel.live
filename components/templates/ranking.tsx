import { DateTime } from "luxon";
import { RankingType } from "narou/src/index.browser";
import React, { useMemo } from "react";
import { useTitle } from "react-use";

import { Link, useParams, useNavigate } from "react-router-dom";

import useRanking from "../../modules/data/ranking";
import { RankingTypeName } from "../../modules/interfaces/RankingType";
import { rankingPath } from "../../modules/paths/createPaths";
import { addDate, convertDate } from "../../modules/utils/date";
import { Button } from "../ui/atoms/Button";
import DatePicker from "../ui/atoms/DatePicker";
import { Paper } from "../ui/atoms/Paper";
import { SelectBox } from "../ui/atoms/SelectBox";
import { FilterComponent } from "../ui/ranking/Filter";
import { RankingRender } from "../ui/ranking/RankingRender";

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

const minDate = DateTime.fromObject({ year: 2013, month: 5, day: 1 });
const maxDate = DateTime.now().setZone("Asia/Tokyo").startOf("day");

const useRankingParams = (): [RankingType, DateTime, boolean] => {
  const { date: dateRaw, type } = useParams<RankingParams>();
  const date = useMemo(
    () =>
      convertDate(
        dateRaw
          ? DateTime.fromISO(dateRaw)
          : DateTime.now()
              .minus({ hour: 12 })
              .setZone("Asia/Tokyo")
              .startOf("day"),
        type ?? RankingType.Daily
      ),
    [dateRaw]
  );
  return [type ?? RankingType.Daily, date, !dateRaw];
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

  return (
    <>
      <div className="mx-4 mt-2">
        <Paper className="mb-6 space-x-2 p-2 bg-white dark:bg-zinc-800 dark:border-zinc-700">
          <Button as={Link} to={rankingPath(type, addDate(date, type, -1))}>
            前
          </Button>
          <DatePicker
            minDate={minDate}
            maxDate={maxDate}
            value={date}
            onChange={(date) => date && navigate(rankingPath(type, date))}
          />

          <Button as={Link} to={rankingPath(type, addDate(date, type, 1))}>
            次
          </Button>
          <Button as={Link} to={rankingPath(type)} color="primary">
            最新
          </Button>
          <SelectBox
            value={type}
            onChange={(type: RankingType) => navigate(rankingPath(type, date))}
            options={rankingTypeList.map((value) => ({
              value,
              label: RankingTypeName[value],
            }))}
          />
        </Paper>
        <FilterComponent />
      </div>
      <RankingRender ranking={data} loading={isLoading} />
    </>
  );
};

export default Ranking;