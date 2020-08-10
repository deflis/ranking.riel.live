import { Order, RankingResult } from "narou";
import { useMemo } from "react";
import useSWR from "swr";

import { fetcher } from "../util/fetcher";

export function useCustomRanking(order: Order, searchParams: URLSearchParams) {
  const options = useMemo(
    () => ({
      searchParams,
    }),
    [searchParams]
  );
  const { data, error } = useSWR<RankingResult[]>(
    [`/_api/custom/${order}/`, options],
    fetcher
  );
  const loading = !data;
  const ranking = data ?? [];
  if (error) {
    throw error;
  }

  return { ranking, loading };
}

export default useCustomRanking;
