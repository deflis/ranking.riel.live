import DataLoader from "dataloader";
import { formatISO } from "date-fns";
import { DateTime } from "luxon";
import { NarouSearchResult, ranking, RankingType, search } from "narou";
import { GetStaticProps } from "next";
import { dehydrate, QueryClient } from "react-query";
import { PropsDehydratedState } from "../../pages/_app";
import { detailKey } from "./queries/detail";
import { rankingKey } from "./queries/ranking";

const loader = new DataLoader<string, NarouSearchResult, string>(
  async (ncodes) => {
    const { values } = await search()
      .ncode(ncodes as string[])
      .limit(ncodes.length)
      .opt("weekly")
      .execute();
    return ncodes
      .map((x) => x.toLowerCase())
      .map((ncode) => values.find((x) => x.ncode.toLowerCase() === ncode));
  },
  {
    maxBatchSize: 500,
  }
);

type PrefetchParams = {
  date: DateTime;
  type: RankingType;
};

export const prefetchRanking = async ({
  date,
  type,
}: PrefetchParams): Promise<
  ReturnType<GetStaticProps<PropsDehydratedState>>
> => {
  const queryClient = new QueryClient();
  try {
    const rankingResult = await ranking()
      .date(date.toJSDate())
      .type(type)
      .execute();
    await queryClient.prefetchQuery(
      rankingKey(type, date),
      () => rankingResult
    );

    await Promise.all(
      rankingResult
        .filter((x) => x.rank <= 10)
        .map(({ ncode }) =>
          queryClient.prefetchQuery(detailKey(ncode), () => loader.load(ncode))
        )
    );
  } catch (e) {
    console.error(e);
  }

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
    revalidate: 10 * 60 * 1000,
  };
};
