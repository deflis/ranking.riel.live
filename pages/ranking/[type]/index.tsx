import { addHours } from "date-fns";
import { DateTime } from "luxon";
import { RankingType } from "narou";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import Ranking from "../../../components/templates/ranking";
import { prefetchRanking } from "../../../modules/data/prefetch";
import { convertDate } from "../../../modules/utils/date";
import { PropsDehydratedState } from "../../_app";

type Params = { type: RankingType };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  return {
    paths: [
      RankingType.Daily,
      RankingType.Weekly,
      RankingType.Monthly,
      RankingType.Quarterly,
    ].map((type) => ({ params: { type } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<
  PropsDehydratedState,
  Params
> = async ({ params }) => {
  if (!params || !params.type || params.type === RankingType.Daily) {
    return {
      redirect: "/",
      props: {},
    };
  }
  const type = params.type;
  const date = convertDate(
    DateTime.now().setZone("Asia/Tokyo").minus({ hour: -12 }),
    type
  );
  return prefetchRanking({ type, date });
};

export const Page: NextPage<Params> = ({}) => {
  const router = useRouter();
  const { type } = router.query;
  return (
    <Ranking
      date={convertDate(
        DateTime.now().setZone("Asia/Tokyo").minus({ hour: 12 }),
        type as RankingType
      )}
      type={type as RankingType}
    />
  );
};

export default Page;
