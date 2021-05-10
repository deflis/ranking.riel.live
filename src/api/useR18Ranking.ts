import { Order, RankingResult } from "narou";
import { useMemo } from "react";
import useSWR from "swr";

import { fetcher } from "../util/fetcher";

export function useR18Ranking(order: Order, searchParams: URLSearchParams) {
  const options = useMemo(
    () => ({
      searchParams,
    }),
    [searchParams]
  );
  const { data, error } = useSWR<RankingResult[]>(
    [`/_api/r18/${order}/`, options],
    fetcher
  );
  const loading = !data;
  const ranking = data ?? [];
  if (error) {
    throw error;
  }

  return { ranking, loading };
}

export default useR18Ranking;
