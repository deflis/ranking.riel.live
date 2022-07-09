import { DateTime } from "luxon";
import { RankingType } from "narou";
import { GetStaticProps } from "next";
import Ranking from "../components/templates/ranking";
import { prefetchRanking } from "../modules/data/prefetch";
import { convertDate } from "../modules/utils/date";
import { PropsDehydratedState } from "./_app";

export const getStaticProps: GetStaticProps<
  PropsDehydratedState
> = async () => {
  const type = RankingType.Daily;
  const date = convertDate(
    DateTime.now().setZone("Asia/Tokyo").minus({ hour: 12 }),
    type
  );
  console.log({ type, date });
  return prefetchRanking({ type, date });
};

export default function Page() {
  return (
    <Ranking
      date={convertDate(DateTime.now().minus({ hour: 12 }), RankingType.Daily)}
      type={RankingType.Daily}
    />
  );
}
