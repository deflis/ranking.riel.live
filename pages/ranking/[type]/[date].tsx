import { DateTime, Interval } from "luxon";
import { RankingType } from "narou";
import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffectOnce } from "react-use";
import Ranking from "../../../components/templates/ranking";
import { prefetchRanking } from "../../../modules/data/prefetch";
import { formatDate } from "../../../modules/utils/date";

type Params = { type: RankingType; date: string };

export const getStaticPaths: GetStaticPaths<Params> = async () => {
  const currentDate = DateTime.now().minus({ hour: 12 }).startOf("day");
  return {
    paths: [
      ...Interval.fromDateTimes(
        currentDate.minus({ month: 1 }),
        currentDate.minus({ day: 1 })
      )
        .splitBy({ day: 1 })
        .map((x) => ({
          params: {
            type: RankingType.Daily,
            date: formatDate(x.start, RankingType.Daily),
          },
        })),
      ...Interval.fromDateTimes(
        currentDate.minus({ month: 1 }),
        currentDate.minus({ day: 1 })
      )
        .splitBy({ week: 1 })
        .map((x) => ({
          params: {
            type: RankingType.Weekly,
            date: formatDate(x.start, RankingType.Weekly),
          },
        })),
      ...Interval.fromDateTimes(
        currentDate.minus({ month: 12 }),
        currentDate.minus({ day: 1 })
      )
        .splitBy({ month: 1 })
        .map((x) => ({
          params: {
            type: RankingType.Monthly,
            date: formatDate(x.start, RankingType.Monthly),
          },
        })),
      ...Interval.fromDateTimes(
        currentDate.minus({ month: 12 }),
        currentDate.minus({ day: 1 })
      )
        .splitBy({ month: 1 })
        .map((x) => ({
          params: {
            type: RankingType.Quarterly,
            date: formatDate(x.start, RankingType.Quarterly),
          },
        })),
    ],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<{}, Params> = async ({
  params,
}) => {
  if (!params) {
    return { redirect: "/", props: {} };
  }
  const type = params.type;
  const date = DateTime.fromISO(params.date);
  if (!date.isValid || date > DateTime.now()) {
    return { notFound: true };
  }
  const today = DateTime.now()
    .setZone("Asia/Tokyo")
    .minus({ hour: 12 })
    .startOf("day");
  if (date == today) {
    return { redirect: `/ranking/${type}`, props: {}, revalidate: 10 };
  }
  return prefetchRanking({ type, date });
};

export const Page: NextPage<Params> = ({}) => {
  const router = useRouter();
  const { type, date: rawDate } = router.query;
  const date = DateTime.fromISO(rawDate as string);

  useEffectOnce(() => {
    if (!date.isValid) {
      router.push("/");
    }
  });
  return date.isValid && <Ranking date={date} type={type as RankingType} />;
};

export default Page;
