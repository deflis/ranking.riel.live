import React, { useMemo } from "react";

import { RankingType } from "narou/src/index.browser";
import useRanking from "../../modules/data/queries/ranking";
import { RankingRender } from "../ui/ranking/RankingRender";
import DatePicker from "../ui/atoms/DatePicker";
import { rankingPath } from "../../modules/paths/createPaths";
import { RankingTypeName } from "../../modules/interfaces/RankingType";
import { SelectBox } from "../ui/atoms/SelectBox";
import { Button } from "../ui/atoms/Button";
import { DateTime } from "luxon";
import { FilterComponent } from "../ui/ranking/Filter";
import {
  useNavigate,
  useMatch,
  Link,
  MakeGenerics,
} from "@tanstack/react-location";
import { useAtomValue } from "jotai";
import { filterConditonsAtom } from "../../modules/atoms/filter";
import { addDate, convertDate } from "../../modules/utils/date";

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

const useParams = (): [RankingType, DateTime] => {
  const {
    params: { date: dateRaw, type },
  } = useMatch<MakeGenerics<{ Params: RankingParams }>>();
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
  return [type ?? RankingType.Daily, date];
};
export const Ranking: React.FC = () => {
  const [type, date] = useParams();
  const { data, isLoading } = useRanking(type, date);
  const navigate = useNavigate();

  return (
    <>
      <div className=" mb-6 space-x-2">
        <Link to={rankingPath(type, addDate(date, type, -1))}>
          <Button as="a">前</Button>
        </Link>
        <DatePicker
          minDate={minDate}
          maxDate={maxDate}
          value={date}
          onChange={(date) => date && navigate({ to: rankingPath(type, date) })}
        />

        <Link to={rankingPath(type, addDate(date, type, 1))}>
          <Button as="a">次</Button>
        </Link>
        <Link to={rankingPath(type)}>
          <Button as="a">最新</Button>
        </Link>
        <SelectBox
          value={type}
          onChange={(type: RankingType) =>
            navigate({ to: rankingPath(type, date) })
          }
          options={rankingTypeList.map((value) => ({
            value,
            label: RankingTypeName.get(value),
          }))}
        />
      </div>
      <FilterComponent />
      <RankingRender ranking={data} loading={isLoading} />
    </>
  );
};

export default Ranking;
