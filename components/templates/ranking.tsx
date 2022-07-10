import React from "react";

import { RankingType } from "narou";
import useRanking from "../../modules/data/queries/ranking";
import { RankingRender } from "../ui/ranking/RankingRender";
import DatePicker from "../ui/atoms/DatePicker";
import { useRouter } from "next/router";
import { rankingPath } from "../../modules/paths/createPaths";
import { RankingTypeName } from "../../modules/interfaces/RankingType";
import { SelectBox } from "../ui/atoms/SelectBox";
import { Button } from "../ui/atoms/Button";
import Link from "next/link";
import { DateTime } from "luxon";
import { FilterComponent } from "../ui/ranking/Filter";

const rankingTypeList = [
  RankingType.Daily,
  RankingType.Weekly,
  RankingType.Monthly,
  RankingType.Quarterly,
] as const;

export type RankingParams = {
  date?: string;
  type?: string;
};

const minDate = DateTime.fromObject({ year: 2013, month: 5, day: 1 });
const maxDate = DateTime.now().setZone("Asia/Tokyo").startOf("day");

export const Ranking: React.FC<{ date: DateTime; type: RankingType }> = ({
  date,
  type,
}) => {
  const { data, isLoading } = useRanking(type, date);
  const router = useRouter();

  return (
    <>
      <div className=" mb-6 space-x-2">
        <Link href={rankingPath(type, date.minus({ day: 1 }))} passHref>
          <Button as="a">前</Button>
        </Link>
        <DatePicker
          minDate={minDate}
          maxDate={maxDate}
          value={date}
          onChange={(date) => router.push(rankingPath(type, date))}
        />

        <Link href={rankingPath(type, date.plus({ day: 1 }))} passHref>
          <Button as="a">次</Button>
        </Link>
        <Link href={rankingPath(type)} passHref>
          <Button as="a">最新</Button>
        </Link>
        <SelectBox
          value={type}
          onChange={(type: RankingType) => router.push(rankingPath(type, date))}
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
